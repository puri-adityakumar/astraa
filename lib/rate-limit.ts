import { Redis } from "@upstash/redis";

/**
 * Lightweight per-key fixed-window rate limiter backed by Upstash Redis.
 *
 * Degrades gracefully: when Redis is not configured (missing env vars) or any
 * Redis call fails, requests are ALLOWED rather than blocked. This mirrors how
 * `middleware.ts` treats Redis as a best-effort dependency and never lets a
 * counting failure break the user-facing flow.
 */

export interface RateLimitResult {
  /** Whether the request is permitted under the configured limits. */
  allowed: boolean;
  /** Seconds until the exceeded window resets (only meaningful when blocked). */
  retryAfterSeconds?: number;
}

interface WindowConfig {
  /** Window length in seconds. */
  windowSeconds: number;
  /** Maximum number of requests permitted within the window. */
  limit: number;
}

// Lazily-created singleton client. We only construct the client when env vars
// are present so an unconfigured deployment never emits SDK warnings or throws.
let cachedRedis: Redis | null | undefined;

function getRedis(): Redis | null {
  if (cachedRedis !== undefined) {
    return cachedRedis;
  }

  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;

  if (!url || !token) {
    cachedRedis = null;
    return cachedRedis;
  }

  try {
    cachedRedis = new Redis({ url, token });
  } catch {
    cachedRedis = null;
  }

  return cachedRedis;
}

// Atomic fixed-window increment: bump the counter and, on the first hit, set the
// key's TTL so the window expires. Returns [currentCount, ttlSeconds].
const FIXED_WINDOW_SCRIPT = `
local current = redis.call("INCR", KEYS[1])
if current == 1 then
  redis.call("EXPIRE", KEYS[1], ARGV[1])
end
local ttl = redis.call("TTL", KEYS[1])
return {current, ttl}
`;

async function checkWindow(
  redis: Redis,
  key: string,
  config: WindowConfig,
): Promise<RateLimitResult> {
  const result = (await redis.eval(
    FIXED_WINDOW_SCRIPT,
    [key],
    [String(config.windowSeconds)],
  )) as [number, number];

  const current = Number(result[0]);
  const ttl = Number(result[1]);

  if (current > config.limit) {
    return {
      allowed: false,
      retryAfterSeconds: ttl > 0 ? ttl : config.windowSeconds,
    };
  }

  return { allowed: true };
}

/**
 * Apply a per-identifier fixed-window rate limit across multiple windows
 * (e.g. a short burst window plus a longer daily cap).
 *
 * @param identifier  Stable client key (typically the request IP).
 * @param namespace   Logical bucket used to scope the Redis keys per feature.
 * @param windows     One or more window configurations to enforce together.
 */
export async function rateLimit(
  identifier: string,
  namespace: string,
  windows: WindowConfig[],
): Promise<RateLimitResult> {
  const redis = getRedis();

  // No Redis available -> allow the request (graceful degradation).
  if (!redis) {
    return { allowed: true };
  }

  try {
    for (const window of windows) {
      const key = `astraa:ratelimit:${namespace}:${window.windowSeconds}:${identifier}`;
      const result = await checkWindow(redis, key, window);
      if (!result.allowed) {
        return result;
      }
    }
    return { allowed: true };
  } catch (error) {
    // Any Redis failure must not block the user; log and allow.
    console.error("Rate limit check failed, allowing request:", error);
    return { allowed: true };
  }
}
