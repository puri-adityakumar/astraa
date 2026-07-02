import { Redis } from "@upstash/redis";

// Read Upstash Redis env vars with a typed, non-throwing fallback so missing
// env never crashes app startup or the build (matching the prior `!` behavior).
const KV_REST_API_URL = process.env.KV_REST_API_URL;
const KV_REST_API_TOKEN = process.env.KV_REST_API_TOKEN;
if (!KV_REST_API_URL || !KV_REST_API_TOKEN) {
  console.error("Missing Upstash Redis env vars (KV_REST_API_URL / KV_REST_API_TOKEN)");
}

// Singleton Redis client (using Vercel KV env vars)
export const redis = new Redis({
  url: KV_REST_API_URL ?? "",
  token: KV_REST_API_TOKEN ?? "",
});

// Keys used in the application
export const REDIS_KEYS = {
  VISITOR_COUNT: "astraa:visitor_count",
} as const;
