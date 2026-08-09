import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { CRYPTO_CACHE_CONTROL, GET as getCryptoRate } from "@/app/api/rates/crypto/route";
import { FIAT_CACHE_CONTROL, GET as getFiatRate } from "@/app/api/rates/fiat/route";

const ORIGINAL_CRYPTO_KEY = process.env.COINGECKO_API_KEY;

describe("rate routes", () => {
  beforeEach(() => {
    process.env.COINGECKO_API_KEY = "server-only-key";
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    if (ORIGINAL_CRYPTO_KEY === undefined) {
      delete process.env.COINGECKO_API_KEY;
    } else {
      process.env.COINGECKO_API_KEY = ORIGINAL_CRYPTO_KEY;
    }
  });

  it("rejects invalid fiat pairs before fetching", async () => {
    const fetchMock = vi.fn<typeof fetch>();
    vi.stubGlobal("fetch", fetchMock);

    const response = await getFiatRate(
      new Request("http://localhost/api/rates/fiat?base=USD&quote=ZZZ"),
    );

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({
      error: { code: "INVALID_PAIR", message: "Unsupported currency pair." },
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("returns a validated fiat rate with bounded cache headers", async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValue(new Response(JSON.stringify({ date: "2026-08-08", usd: { eur: 0.92 } })));
    vi.stubGlobal("fetch", fetchMock);

    const response = await getFiatRate(
      new Request("http://localhost/api/rates/fiat?base=USD&quote=EUR"),
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("Cache-Control")).toBe(FIAT_CACHE_CONTROL);
    expect(await response.json()).toMatchObject({
      base: "USD",
      quote: "EUR",
      rate: 0.92,
      source: "currency-api",
    });
  });

  it("rejects invalid crypto pairs before reading the provider", async () => {
    const fetchMock = vi.fn<typeof fetch>();
    vi.stubGlobal("fetch", fetchMock);

    const response = await getCryptoRate(
      new Request("http://localhost/api/rates/crypto?base=invalid&quote=USD"),
    );

    expect(response.status).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("returns a validated crypto rate with bounded cache headers", async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValue(new Response(JSON.stringify({ bitcoin: { usd: 67_500 } })));
    vi.stubGlobal("fetch", fetchMock);

    const response = await getCryptoRate(
      new Request("http://localhost/api/rates/crypto?base=bitcoin&quote=USD"),
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("Cache-Control")).toBe(CRYPTO_CACHE_CONTROL);
    expect(await response.json()).toMatchObject({
      base: "bitcoin",
      quote: "USD",
      rate: 67_500,
      source: "coingecko",
    });
  });

  it("fails closed when the crypto provider is not configured", async () => {
    delete process.env.COINGECKO_API_KEY;

    const response = await getCryptoRate(
      new Request("http://localhost/api/rates/crypto?base=bitcoin&quote=USD"),
    );

    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({
      error: {
        code: "NOT_CONFIGURED",
        message: "Crypto rates are temporarily unavailable.",
      },
    });
  });
});
