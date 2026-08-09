import { describe, expect, it, vi } from "vitest";

import { BoundedRateCache, ExchangeRateResource, LatestRequestTracker } from "./client";
import type { ExchangeRate } from "./types";

const USD_EUR = { kind: "fiat", base: "USD", quote: "EUR" } as const;
const USD_GBP = { kind: "fiat", base: "USD", quote: "GBP" } as const;
const USD_INR = { kind: "fiat", base: "USD", quote: "INR" } as const;

function createRate(base: string, quote: string, rate: number): ExchangeRate {
  return {
    base,
    quote,
    rate,
    asOf: "2026-08-08T00:00:00.000Z",
    source: "currency-api",
  };
}

function createRateResponse(base = "USD", quote = "EUR", rate = 0.92): Response {
  return new Response(JSON.stringify(createRate(base, quote, rate)), { status: 200 });
}

describe("bounded rate cache", () => {
  it("returns hits and evicts expired entries", () => {
    let now = 1_000;
    const cache = new BoundedRateCache({
      now: () => now,
      ttlMs: { fiat: 100, crypto: 50 },
    });
    cache.set(USD_EUR, createRate("USD", "EUR", 0.92));

    expect(cache.get(USD_EUR)?.rate).toBe(0.92);
    now += 101;
    expect(cache.get(USD_EUR)).toBeNull();
    expect(cache.size).toBe(0);
  });

  it("uses least-recently-used eviction at the size cap", () => {
    const cache = new BoundedRateCache({ maxEntries: 2 });
    cache.set(USD_EUR, createRate("USD", "EUR", 0.92));
    cache.set(USD_GBP, createRate("USD", "GBP", 0.78));
    expect(cache.get(USD_EUR)).not.toBeNull();

    cache.set(USD_INR, createRate("USD", "INR", 83));

    expect(cache.get(USD_GBP)).toBeNull();
    expect(cache.get(USD_EUR)).not.toBeNull();
    expect(cache.get(USD_INR)).not.toBeNull();
  });
});

describe("exchange rate resource", () => {
  it("deduplicates concurrent requests for the same pair", async () => {
    let resolveFetch: ((response: Response) => void) | undefined;
    const fetchMock = vi.fn<typeof fetch>().mockImplementation(
      () =>
        new Promise<Response>((resolve) => {
          resolveFetch = resolve;
        }),
    );
    const resource = new ExchangeRateResource({ fetchImplementation: fetchMock });

    const first = resource.load(USD_EUR);
    const second = resource.load(USD_EUR);
    resolveFetch?.(createRateResponse());

    await expect(first).resolves.toMatchObject({ rate: 0.92 });
    await expect(second).resolves.toMatchObject({ rate: 0.92 });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("aborts the underlying request after its last consumer leaves", async () => {
    let providerSignal: AbortSignal | undefined;
    const fetchMock = vi.fn<typeof fetch>().mockImplementation((_url, init) => {
      providerSignal = init?.signal ?? undefined;
      return new Promise<Response>((_resolve, reject) => {
        providerSignal?.addEventListener("abort", () => {
          reject(new DOMException("aborted", "AbortError"));
        });
      });
    });
    const resource = new ExchangeRateResource({ fetchImplementation: fetchMock });
    const controller = new AbortController();

    const pending = resource.load(USD_EUR, { signal: controller.signal });
    controller.abort();

    await expect(pending).rejects.toMatchObject({ name: "AbortError" });
    expect(providerSignal?.aborted).toBe(true);
  });

  it("keeps a deduplicated request alive for an immediate replacement consumer", async () => {
    let resolveFetch: ((response: Response) => void) | undefined;
    let providerSignal: AbortSignal | undefined;
    const fetchMock = vi.fn<typeof fetch>().mockImplementation((_url, init) => {
      providerSignal = init?.signal ?? undefined;
      return new Promise<Response>((resolve) => {
        resolveFetch = resolve;
      });
    });
    const resource = new ExchangeRateResource({ fetchImplementation: fetchMock });
    const firstController = new AbortController();

    const first = resource.load(USD_EUR, { signal: firstController.signal });
    firstController.abort();
    const replacement = resource.load(USD_EUR);
    resolveFetch?.(createRateResponse());

    await expect(first).rejects.toMatchObject({ name: "AbortError" });
    await expect(replacement).resolves.toMatchObject({ rate: 0.92 });
    expect(providerSignal?.aborted).toBe(false);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("cleans failed requests so retry can succeed", async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockRejectedValueOnce(new Error("offline"))
      .mockResolvedValueOnce(createRateResponse());
    const resource = new ExchangeRateResource({ fetchImplementation: fetchMock });

    await expect(resource.load(USD_EUR)).rejects.toThrow("offline");
    expect(resource.inFlightCount).toBe(0);
    await expect(resource.load(USD_EUR)).resolves.toMatchObject({ rate: 0.92 });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("serves cache hits and force-refreshes only the requested key", async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(createRateResponse("USD", "EUR", 0.92))
      .mockResolvedValueOnce(createRateResponse("USD", "EUR", 0.93));
    const resource = new ExchangeRateResource({ fetchImplementation: fetchMock });

    await resource.load(USD_EUR);
    await expect(resource.load(USD_EUR)).resolves.toMatchObject({ rate: 0.92 });
    await expect(resource.load(USD_EUR, { force: true })).resolves.toMatchObject({
      rate: 0.93,
    });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});

describe("latest request tracker", () => {
  it("rejects stale response generations", () => {
    const tracker = new LatestRequestTracker();
    const oldRequest = tracker.begin();
    const currentRequest = tracker.begin();

    expect(tracker.isCurrent(oldRequest)).toBe(false);
    expect(tracker.isCurrent(currentRequest)).toBe(true);
    tracker.cancel(currentRequest);
    expect(tracker.isCurrent(currentRequest)).toBe(false);
  });
});
