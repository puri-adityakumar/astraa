import { Redis } from "@upstash/redis";

export const REDIS_KEYS = {
  VISITOR_COUNT: "astraa:visitor_count",
} as const;

let client: Redis | null | undefined;

// Missing Upstash env (local dev) means "skip counting", never an error.
export function getRedis(): Redis | null {
  if (client !== undefined) {
    return client;
  }
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  client = url && token ? new Redis({ url, token }) : null;
  return client;
}
