import { createHash } from "node:crypto";
import { Redis } from "@upstash/redis";

export interface RateLimitDecision {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
}

export interface RateLimitStore {
  consume: (identity: string, limit: number, windowSeconds: number) => Promise<RateLimitDecision>;
}

interface MemoryEntry {
  count: number;
  expiresAt: number;
}

export class MemoryRateLimitStore implements RateLimitStore {
  private readonly entries = new Map<string, MemoryEntry>();

  constructor(private readonly now: () => number = Date.now) {}

  async consume(
    identity: string,
    limit: number,
    windowSeconds: number,
  ): Promise<RateLimitDecision> {
    const now = this.now();
    const current = this.entries.get(identity);
    const entry =
      !current || current.expiresAt <= now
        ? { count: 0, expiresAt: now + windowSeconds * 1_000 }
        : current;

    entry.count += 1;
    this.entries.set(identity, entry);

    return {
      allowed: entry.count <= limit,
      remaining: Math.max(0, limit - entry.count),
      retryAfterSeconds: Math.max(1, Math.ceil((entry.expiresAt - now) / 1_000)),
    };
  }
}

class UpstashRateLimitStore implements RateLimitStore {
  constructor(private readonly redis: Redis) {}

  async consume(
    identity: string,
    limit: number,
    windowSeconds: number,
  ): Promise<RateLimitDecision> {
    const key = `astraa:rate-limit:text:${identity}`;
    const result: unknown = await this.redis.eval(
      [
        "local count = redis.call('INCR', KEYS[1])",
        "if count == 1 then redis.call('EXPIRE', KEYS[1], ARGV[1]) end",
        "local ttl = redis.call('TTL', KEYS[1])",
        "return {count, ttl}",
      ].join("\n"),
      [key],
      [String(windowSeconds)],
    );

    if (!Array.isArray(result) || typeof result[0] !== "number" || typeof result[1] !== "number") {
      throw new Error("Rate-limit store returned an invalid response");
    }

    const [count, ttl] = result;
    return {
      allowed: count <= limit,
      remaining: Math.max(0, limit - count),
      retryAfterSeconds: Math.max(1, ttl),
    };
  }
}

let productionStore: RateLimitStore | null | undefined;
const developmentStore = new MemoryRateLimitStore();

export function getTextGenerationRateLimitStore(): RateLimitStore | null {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;

  if (url && token) {
    productionStore ??= new UpstashRateLimitStore(new Redis({ url, token }));
    return productionStore;
  }

  return process.env.NODE_ENV === "production" ? null : developmentStore;
}

export function createRateLimitIdentity(value: string, salt: string): string {
  return createHash("sha256").update(`${salt}:${value}`).digest("hex");
}
