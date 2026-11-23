import { afterEach, describe, expect, it, vi } from "vitest";

const getRootHeaders = async (): Promise<Array<{ key: string; value: string }>> => {
  const nextConfig = await import("../next.config.js");
  const headers = nextConfig.default.headers;

  if (typeof headers !== "function") {
    throw new Error("Next headers configuration is missing");
  }

  const routes = await headers();
  const rootRoute = routes.find((route) => route.source === "/(.*)");

  if (!rootRoute) {
    throw new Error("Root security headers route is missing");
  }

  return rootRoute.headers;
};

const getHeader = (headers: Array<{ key: string; value: string }>, key: string): string => {
  const header = headers.find((entry) => entry.key === key);

  if (!header) {
    throw new Error(`${key} header is missing`);
  }

  return header.value;
};

const getDirective = (csp: string, name: string): string => {
  const directive = csp.split("; ").find((entry) => entry.startsWith(`${name} `));

  if (!directive) {
    throw new Error(`${name} CSP directive is missing`);
  }

  return directive;
};

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("security headers", () => {
  it("uses a bounded CSP in development without forcing localhost to HTTPS", async () => {
    vi.stubEnv("NODE_ENV", "development");
    const headers = await getRootHeaders();
    const csp = getHeader(headers, "Content-Security-Policy");

    expect(csp).toContain("default-src 'self'");
    expect(csp).toContain("object-src 'none'");
    expect(csp).toContain("frame-src 'self' blob: https:");
    expect(csp).toContain("worker-src 'self' blob:");
    expect(getDirective(csp, "img-src")).toBe(
      "img-src 'self' data: blob: https: http:",
    );
    expect(csp).toContain("https://va.vercel-scripts.com");
    expect(csp).toContain("http://localhost:* ws://localhost:*");
    expect(csp).toContain("'unsafe-eval'");
    expect(csp).not.toContain("upgrade-insecure-requests");
    expect(headers.some((header) => header.key === "Strict-Transport-Security")).toBe(false);
  });

  it("adds HSTS and mixed-content upgrades only for deployed production responses", async () => {
    vi.stubEnv("NODE_ENV", "production");
    const headers = await getRootHeaders();
    const csp = getHeader(headers, "Content-Security-Policy");

    expect(csp).toContain("upgrade-insecure-requests");
    expect(csp).not.toContain("http://localhost");
    expect(csp).not.toContain("'unsafe-eval'");
    expect(csp).toContain("'wasm-unsafe-eval'");
    expect(getDirective(csp, "img-src")).toBe("img-src 'self' data: blob: https:");
    expect(getHeader(headers, "Strict-Transport-Security")).toBe(
      "max-age=31536000; includeSubDomains",
    );
    expect(getHeader(headers, "X-Content-Type-Options")).toBe("nosniff");
    expect(getHeader(headers, "X-Frame-Options")).toBe("SAMEORIGIN");
    expect(getHeader(headers, "Referrer-Policy")).toBe("strict-origin-when-cross-origin");
    expect(getHeader(headers, "Permissions-Policy")).toBe("camera=(), microphone=(), geolocation=()");
    expect(getHeader(headers, "X-DNS-Prefetch-Control")).toBe("on");
  });
});
