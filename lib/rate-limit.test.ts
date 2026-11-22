import { beforeEach, describe, expect, it, vi } from "vitest";

const { limitMock, fixedWindowMock } = vi.hoisted(() => ({
  limitMock: vi.fn(),
  fixedWindowMock: vi.fn(),
}));

vi.mock("@upstash/ratelimit", () => {
  class Ratelimit {
    static fixedWindow = fixedWindowMock;
    limit = limitMock;
  }
  return { Ratelimit };
});

function requestWith(headers: Record<string, string>): Request {
  return new Request("https://astraa.test/api/stats", { headers });
}

async function loadRateLimitModule() {
  vi.resetModules();
  return await import("./rate-limit");
}

beforeEach(() => {
  delete process.env.KV_REST_API_URL;
  delete process.env.KV_REST_API_TOKEN;
  limitMock.mockReset();
  fixedWindowMock.mockReset();
});

describe("clientIdentifier", () => {
  it("uses the first x-forwarded-for hop", async () => {
    const { clientIdentifier } = await loadRateLimitModule();
    expect(
      clientIdentifier(requestWith({ "x-forwarded-for": "1.2.3.4, 10.0.0.1" })),
    ).toBe("1.2.3.4");
  });

  it("prefers x-forwarded-for over x-real-ip", async () => {
    const { clientIdentifier } = await loadRateLimitModule();
    expect(
      clientIdentifier(
        requestWith({ "x-forwarded-for": "1.2.3.4", "x-real-ip": "5.6.7.8" }),
      ),
    ).toBe("1.2.3.4");
  });

  it("falls back to x-real-ip", async () => {
    const { clientIdentifier } = await loadRateLimitModule();
    expect(clientIdentifier(requestWith({ "x-real-ip": "5.6.7.8" }))).toBe("5.6.7.8");
  });

  it("falls back to the anonymous bucket without ip headers", async () => {
    const { clientIdentifier } = await loadRateLimitModule();
    expect(clientIdentifier(requestWith({}))).toBe("anonymous");
  });

  it("skips an empty x-forwarded-for", async () => {
    const { clientIdentifier } = await loadRateLimitModule();
    expect(
      clientIdentifier(requestWith({ "x-forwarded-for": " ", "x-real-ip": "5.6.7.8" })),
    ).toBe("5.6.7.8");
  });
});

describe("MemoryFixedWindow", () => {
  const T0 = 1_000_000;

  it("allows up to limit requests per window then blocks", async () => {
    const { MemoryFixedWindow } = await loadRateLimitModule();
    const window = new MemoryFixedWindow(3, 60_000, 100);
    expect(window.check("a", T0)).toBe(true);
    expect(window.check("a", T0 + 1)).toBe(true);
    expect(window.check("a", T0 + 2)).toBe(true);
    expect(window.check("a", T0 + 3)).toBe(false);
    expect(window.check("a", T0 + 59_999)).toBe(false);
  });

  it("resets the key after its window elapses", async () => {
    const { MemoryFixedWindow } = await loadRateLimitModule();
    const window = new MemoryFixedWindow(1, 60_000, 100);
    expect(window.check("a", T0)).toBe(true);
    expect(window.check("a", T0 + 1)).toBe(false);
    expect(window.check("a", T0 + 60_000)).toBe(true);
    expect(window.check("a", T0 + 60_001)).toBe(false);
  });

  it("tracks keys independently", async () => {
    const { MemoryFixedWindow } = await loadRateLimitModule();
    const window = new MemoryFixedWindow(1, 60_000, 100);
    expect(window.check("a", T0)).toBe(true);
    expect(window.check("b", T0)).toBe(true);
    expect(window.check("a", T0)).toBe(false);
    expect(window.check("b", T0)).toBe(false);
  });

  it("stays bounded when flooded with unique keys", async () => {
    const { MemoryFixedWindow } = await loadRateLimitModule();
    const window = new MemoryFixedWindow(1, 60_000, 10);
    for (let i = 0; i < 100; i++) {
      window.check(`ip-${i}`, T0 + i);
    }
    expect(window.size).toBe(10);
  });

  it("sweeps expired buckets before evicting live ones", async () => {
    const { MemoryFixedWindow } = await loadRateLimitModule();
    const window = new MemoryFixedWindow(1, 60_000, 3);
    window.check("old-1", T0);
    window.check("old-2", T0);
    window.check("old-3", T0);
    window.check("new", T0 + 120_000);
    expect(window.size).toBe(1);
    expect(window.check("new", T0 + 120_000)).toBe(false);
  });
});

describe("createRateLimiter", () => {
  it("falls back to the in-memory limiter without Upstash env", async () => {
    const { createRateLimiter } = await loadRateLimitModule();
    const check = createRateLimiter({ limit: 2, windowMs: 60_000, prefix: "p" });
    const request = requestWith({ "x-forwarded-for": "9.9.9.9" });
    expect(await check(request)).toEqual({ success: true, backend: "memory" });
    expect(await check(request)).toEqual({ success: true, backend: "memory" });
    expect(await check(request)).toEqual({ success: false, backend: "memory" });
    expect(fixedWindowMock).not.toHaveBeenCalled();
    expect(limitMock).not.toHaveBeenCalled();
  });

  it("limits against Upstash when Redis is configured", async () => {
    process.env.KV_REST_API_URL = "https://example.upstash.io";
    process.env.KV_REST_API_TOKEN = "test-token";
    limitMock.mockResolvedValue({ success: true, remaining: 29, reset: 0 });
    const { createRateLimiter } = await loadRateLimitModule();
    const check = createRateLimiter({
      limit: 30,
      windowMs: 60_000,
      prefix: "astraa:ratelimit:stats",
    });
    expect(
      await check(requestWith({ "x-forwarded-for": "8.8.8.8" })),
    ).toEqual({ success: true, backend: "upstash" });
    expect(fixedWindowMock).toHaveBeenCalledWith(30, "1 m");
    expect(limitMock).toHaveBeenCalledWith("8.8.8.8");
  });

  it("blocks when Upstash denies the request", async () => {
    process.env.KV_REST_API_URL = "https://example.upstash.io";
    process.env.KV_REST_API_TOKEN = "test-token";
    limitMock.mockResolvedValue({ success: false, remaining: 0, reset: 0 });
    const { createRateLimiter } = await loadRateLimitModule();
    const check = createRateLimiter({ limit: 30, windowMs: 60_000, prefix: "p" });
    expect(await check(requestWith({ "x-forwarded-for": "8.8.8.8" }))).toEqual({
      success: false,
      backend: "upstash",
    });
  });

  it("fails closed when the Upstash check errors", async () => {
    process.env.KV_REST_API_URL = "https://example.upstash.io";
    process.env.KV_REST_API_TOKEN = "test-token";
    limitMock.mockRejectedValue(new Error("redis down"));
    const { createRateLimiter } = await loadRateLimitModule();
    const check = createRateLimiter({ limit: 30, windowMs: 60_000, prefix: "p" });
    expect(await check(requestWith({ "x-forwarded-for": "8.8.8.8" }))).toEqual({
      success: false,
      backend: "upstash",
    });
  });

  it("converts sub-minute windows to seconds", async () => {
    process.env.KV_REST_API_URL = "https://example.upstash.io";
    process.env.KV_REST_API_TOKEN = "test-token";
    const { createRateLimiter } = await loadRateLimitModule();
    createRateLimiter({ limit: 5, windowMs: 1500, prefix: "p" });
    expect(fixedWindowMock).toHaveBeenCalledWith(5, "2 s");
  });
});
