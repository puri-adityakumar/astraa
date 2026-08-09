import { describe, expect, it, vi } from "vitest";

import {
  FiatRateProviderError,
  fetchFiatRate,
  parseFallbackFiatRate,
  parsePrimaryFiatRate,
} from "./fiat";

const NOW = new Date("2026-08-08T10:00:00.000Z");

describe("fiat rate providers", () => {
  it("parses the primary provider shape", () => {
    expect(
      parsePrimaryFiatRate({ date: "2026-08-08", usd: { eur: 0.92 } }, "USD", "EUR", NOW),
    ).toEqual({
      base: "USD",
      quote: "EUR",
      rate: 0.92,
      asOf: "2026-08-08T00:00:00.000Z",
      source: "currency-api",
    });
  });

  it("parses the fallback provider shape", () => {
    expect(
      parseFallbackFiatRate(
        { rates: { EUR: 0.91 }, time_last_updated: 1_786_147_200 },
        "USD",
        "EUR",
        NOW,
      ),
    ).toMatchObject({
      base: "USD",
      quote: "EUR",
      rate: 0.91,
      source: "exchange-rate-api",
    });
  });

  it("rejects missing, non-finite, zero, and negative rates", () => {
    expect(parsePrimaryFiatRate({ usd: {} }, "USD", "EUR", NOW)).toBeNull();
    expect(
      parsePrimaryFiatRate({ usd: { eur: Number.POSITIVE_INFINITY } }, "USD", "EUR", NOW),
    ).toBeNull();
    expect(parseFallbackFiatRate({ rates: { EUR: 0 } }, "USD", "EUR", NOW)).toBeNull();
    expect(parseFallbackFiatRate({ rates: { EUR: -1 } }, "USD", "EUR", NOW)).toBeNull();
  });

  it("uses the fallback when the primary provider fails", async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(new Response("unavailable", { status: 503 }))
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ rates: { EUR: 0.9 } }), { status: 200 }),
      );

    const result = await fetchFiatRate("USD", "EUR", fetchMock);

    expect(result).toMatchObject({ rate: 0.9, source: "exchange-rate-api" });
    expect(new URL(String(fetchMock.mock.calls[0]?.[0])).origin).toBe("https://cdn.jsdelivr.net");
    expect(new URL(String(fetchMock.mock.calls[1]?.[0])).origin).toBe(
      "https://api.exchangerate-api.com",
    );
    expect(fetchMock.mock.calls[0]?.[1]?.signal).toBeInstanceOf(AbortSignal);
    expect(fetchMock.mock.calls[1]?.[1]?.signal).toBeInstanceOf(AbortSignal);
  });

  it("maps provider timeouts to the stable timeout code", async () => {
    const timeout = new DOMException("timed out", "TimeoutError");
    const fetchMock = vi.fn<typeof fetch>().mockRejectedValue(timeout);

    await expect(fetchFiatRate("USD", "EUR", fetchMock)).rejects.toMatchObject({
      code: "UPSTREAM_TIMEOUT",
    } satisfies Partial<FiatRateProviderError>);
  });

  it("returns an identity rate without a network request", async () => {
    const fetchMock = vi.fn<typeof fetch>();

    await expect(fetchFiatRate("USD", "USD", fetchMock)).resolves.toMatchObject({
      rate: 1,
      source: "identity",
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
