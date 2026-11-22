import { Ratelimit } from "@upstash/ratelimit";

import { getRedis } from "@/lib/redis";

export interface RateLimitConfig {
  /** Requests allowed per client inside one window. */
  limit: number;
  /** Window duration in milliseconds. */
  windowMs: number;
  /** Redis key prefix, namespaced per endpoint. */
  prefix: string;
}

export interface RateLimitResult {
  success: boolean;
  /** Backend that served the check. */
  backend: "upstash" | "memory";
}

/**
 * Best-effort client identity for rate limiting. On Vercel the platform
 * sets `x-forwarded-for` to the real client IP, so the first hop is the
 * client; `x-real-ip` and a shared "anonymous" bucket cover other setups.
 */
export function clientIdentifier(request: Request): string {
  const firstHop = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  if (firstHop) {
    return firstHop;
  }
  return request.headers.get("x-real-ip")?.trim() || "anonymous";
}

interface MemoryBucket {
  count: number;
  resetAt: number;
}

/**
 * Per-instance fixed-window limiter used when Redis is not configured
 * (Upstash env is optional in this project). Each key gets its own window
 * anchored at its first request. Bounded to `maxBuckets` live keys so a
 * flood of spoofed IPs cannot grow memory: expired buckets are swept first,
 * then the oldest bucket is evicted.
 */
export class MemoryFixedWindow {
  private readonly buckets = new Map<string, MemoryBucket>();

  constructor(
    private readonly limit: number,
    private readonly windowMs: number,
    private readonly maxBuckets: number,
  ) {}

  get size(): number {
    return this.buckets.size;
  }

  check(key: string, now: number = Date.now()): boolean {
    const bucket = this.buckets.get(key);
    if (bucket && bucket.resetAt > now) {
      if (bucket.count >= this.limit) {
        return false;
      }
      bucket.count += 1;
      return true;
    }
    if (bucket) {
      this.buckets.delete(key);
    }
    this.ensureCapacity(now);
    this.buckets.set(key, { count: 1, resetAt: now + this.windowMs });
    return true;
  }

  private ensureCapacity(now: number): void {
    if (this.buckets.size < this.maxBuckets) {
      return;
    }
    for (const [key, bucket] of this.buckets) {
      if (bucket.resetAt <= now) {
        this.buckets.delete(key);
      }
    }
    if (this.buckets.size >= this.maxBuckets) {
      const oldest = this.buckets.keys().next();
      if (!oldest.done) {
        this.buckets.delete(oldest.value);
      }
    }
  }
}

/** Formats milliseconds as the `Duration` string `@upstash/ratelimit` expects. */
function durationString(ms: number): `${number} ${"ms" | "s" | "m" | "h" | "d" | "w"}` {
  if (ms % 86_400_000 === 0) {
    return `${ms / 86_400_000} d`;
  }
  if (ms % 3_600_000 === 0) {
    return `${ms / 3_600_000} h`;
  }
  if (ms % 60_000 === 0) {
    return `${ms / 60_000} m`;
  }
  return `${Math.ceil(ms / 1000)} s`;
}

const MEMORY_MAX_BUCKETS = 10_000;

/**
 * Builds the rate-limit check for one endpoint. With Upstash configured it
 * limits against Redis (atomic, shared across server instances) and fails
 * closed when the check errors, so quota stays protected during a Redis
 * outage. Without Upstash env it falls back to the per-instance memory
 * limiter: Redis is optional in this project ("missing env means skip"),
 * so failing closed there would break local dev and Redis-less deploys.
 */
export function createRateLimiter(
  config: RateLimitConfig,
): (request: Request) => Promise<RateLimitResult> {
  const memory = new MemoryFixedWindow(config.limit, config.windowMs, MEMORY_MAX_BUCKETS);
  const redis = getRedis();
  const upstash = redis
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.fixedWindow(config.limit, durationString(config.windowMs)),
        prefix: config.prefix,
      })
    : null;

  return async (request) => {
    const identifier = clientIdentifier(request);
    if (!upstash) {
      return { success: memory.check(identifier), backend: "memory" };
    }
    try {
      const { success } = await upstash.limit(identifier);
      return { success, backend: "upstash" };
    } catch (error) {
      console.error("Rate limit check failed; failing closed:", error);
      return { success: false, backend: "upstash" };
    }
  };
}
