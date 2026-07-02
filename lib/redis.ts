import { Redis } from "@upstash/redis";

// Singleton Redis client (using Vercel KV env vars)
export const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
});

// Keys used in the application
export const REDIS_KEYS = {
  VISITOR_COUNT: "astraa:visitor_count",
} as const;
