import { NextResponse, after } from "next/server";
import type { NextRequest } from "next/server";
import { Redis } from "@upstash/redis";

import {
  FLAVOUR_COOKIE_NAME,
  FLAVOUR_LEGACY,
  VISITED_COOKIE_MAX_AGE,
  VISITED_COOKIE_NAME,
  parseFlavour,
} from "@/lib/terminal/cookies";
import { terminalRewritePath } from "@/lib/terminal/flavour";

const VISITOR_COUNT_KEY = "astraa:visitor_count";

// Missing Upstash env (local dev) means "skip counting", never an error.
function createVisitorRedis(): Redis | null {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) {
    return null;
  }
  return new Redis({ url, token });
}

const visitorRedis = createVisitorRedis();

// Counts a visit to the public home page in either flavour: sets the 24h
// dedup cookie on the response actually returned (rewrite or next) and
// increments the Upstash counter non-blocking after the response is sent.
function withVisitorCount(
  request: NextRequest,
  response: NextResponse,
): NextResponse {
  if (request.nextUrl.pathname !== "/") {
    return response;
  }
  if (request.cookies.get(VISITED_COOKIE_NAME)) {
    return response;
  }
  response.cookies.set(VISITED_COOKIE_NAME, "true", {
    maxAge: VISITED_COOKIE_MAX_AGE,
    httpOnly: true,
    sameSite: "lax",
  });
  after(async () => {
    if (!visitorRedis) {
      return;
    }
    try {
      await visitorRedis.incr(VISITOR_COUNT_KEY);
    } catch (error) {
      console.error("Failed to increment visitor count:", error);
    }
  });
  return response;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Direct hits on the internal terminal routes are redirected to the
  // public URL (/terminal -> /, /terminal/tools/x -> /tools/x).
  if (pathname === "/terminal" || pathname.startsWith("/terminal/")) {
    const publicPath =
      pathname === "/terminal" ? "/" : pathname.slice("/terminal".length);
    const url = request.nextUrl.clone();
    url.pathname = publicPath;
    return NextResponse.redirect(url, 308);
  }

  // Flavour routing: without the legacy cookie, /, /tools and registered
  // /tools/<slug> pages render the terminal routes while the address bar
  // keeps the public URL. Everything else falls through unchanged.
  const rewritePath = terminalRewritePath(pathname);
  const flavour = parseFlavour(
    request.cookies.get(FLAVOUR_COOKIE_NAME)?.value,
  );

  if (rewritePath !== null && flavour !== FLAVOUR_LEGACY) {
    const url = request.nextUrl.clone();
    url.pathname = rewritePath;
    return withVisitorCount(request, NextResponse.rewrite(url));
  }

  return withVisitorCount(request, NextResponse.next());
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|assets/|api/|monitoring|.*\\..*).*)",
  ],
};
