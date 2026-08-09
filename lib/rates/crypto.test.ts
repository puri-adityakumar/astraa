import { describe, expect, it, vi } from "vitest";

import { CryptoRateProviderError, fetchCryptoRate, isCryptoId, isCurrencyCode } from "./crypto";

describe("crypto rate provider", () => {
  it("validates registry-backed pair values", () => {
    expect(isCryptoId("bitcoin")).toBe(true);
    expect(isCryptoId("not-a-coin")).toBe(false);
    expect(isCurrencyCode("usd")).toBe(true);
    expect(isCurrencyCode("ZZZ")).toBe(false);
  });

  it("parses a finite provider rate", async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValue(
        new Response(JSON.stringify({ bitcoin: { usd: 67_500 } }), { status: 200 }),
      );

    const result = await fetchCryptoRate(
      "bitcoin",
      "USD",
      "server-key",
      new AbortController().signal,
      fetchMock,
    );

    expect(result).toMatchObject({
      base: "bitcoin",
      quote: "USD",
      rate: 67_500,
      source: "coingecko",
    });
    const calledUrl = new URL(String(fetchMock.mock.calls[0]?.[0]));
    expect(calledUrl.origin).toBe("https://api.coingecko.com");
    expect(calledUrl.searchParams.get("ids")).toBe("bitcoin");
  });

  it("rejects malformed and negative rates", async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValue(new Response(JSON.stringify({ bitcoin: { usd: -1 } }), { status: 200 }));

    await expect(
      fetchCryptoRate("bitcoin", "USD", "server-key", new AbortController().signal, fetchMock),
    ).rejects.toMatchObject({
      code: "UPSTREAM_INVALID",
    } satisfies Partial<CryptoRateProviderError>);
  });

  it("rejects non-success provider responses", async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValue(new Response("rate limited", { status: 429 }));

    await expect(
      fetchCryptoRate("bitcoin", "USD", "server-key", new AbortController().signal, fetchMock),
    ).rejects.toMatchObject({
      code: "UPSTREAM_UNAVAILABLE",
    } satisfies Partial<CryptoRateProviderError>);
  });
});
