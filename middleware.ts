import { Redis } from "@upstash/redis";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Create Redis client directly in middleware (can't import from lib in edge runtime)
const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
});

const VISITOR_COUNT_KEY = "astraa:visitor_count";
const COOKIE_NAME = "astraa_visited";
const COOKIE_MAX_AGE = 60 * 60 * 24; // 24 hours

export async function middleware(request: NextRequest) {
  // Only track visits to the home page
  if (request.nextUrl.pathname !== "/") {
    return NextResponse.next();
  }

  const response = NextResponse.next();

  // Check if user has already been counted recently
  const hasVisited = request.cookies.get(COOKIE_NAME);

  if (!hasVisited) {
    try {
      // Increment visitor count
      await redis.incr(VISITOR_COUNT_KEY);

      // Set cookie to prevent counting same visitor within 24h
      response.cookies.set(COOKIE_NAME, "true", {
        maxAge: COOKIE_MAX_AGE,
        httpOnly: true,
        sameSite: "lax",
      });
    } catch (error) {
      // Silent fail - don't break the site if Redis is down
      console.error("Failed to increment visitor count:", error);
    }
  }

  return response;
}

export const config = {
  matcher: "/",
};
