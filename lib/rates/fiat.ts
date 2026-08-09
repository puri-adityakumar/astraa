import type { CurrencyCode } from "@/lib/currency-data";
import type { ExchangeRate } from "@/lib/rates/types";

const PRIMARY_ORIGIN = "https://cdn.jsdelivr.net";
const FALLBACK_ORIGIN = "https://api.exchangerate-api.com";

export const FIAT_CACHE_SECONDS = 60 * 60;
export const FIAT_STALE_SECONDS = 6 * 60 * 60;
const FIAT_UPSTREAM_TIMEOUT_MS = 5_000;

export interface FiatRate extends ExchangeRate {
  base: CurrencyCode;
  quote: CurrencyCode;
  source: "currency-api" | "exchange-rate-api" | "identity";
}

export class FiatRateProviderError extends Error {
  constructor(public readonly code: "UPSTREAM_TIMEOUT" | "UPSTREAM_UNAVAILABLE") {
    super(code === "UPSTREAM_TIMEOUT" ? "Fiat provider timed out" : "Fiat provider failed");
    this.name = "FiatRateProviderError";
  }
}

export function parsePrimaryFiatRate(
  value: unknown,
  base: CurrencyCode,
  quote: CurrencyCode,
  now: Date = new Date(),
): FiatRate | null {
  if (typeof value !== "object" || value === null) return null;

  const payload = value as Record<string, unknown>;
  const baseRates = payload[base.toLowerCase()];
  if (typeof baseRates !== "object" || baseRates === null) return null;

  const rate = (baseRates as Record<string, unknown>)[quote.toLowerCase()];
  if (!isPositiveRate(rate)) return null;

  return {
    base,
    quote,
    rate,
    asOf: parseDate(payload.date, now),
    source: "currency-api",
  };
}

export function parseFallbackFiatRate(
  value: unknown,
  base: CurrencyCode,
  quote: CurrencyCode,
  now: Date = new Date(),
): FiatRate | null {
  if (typeof value !== "object" || value === null) return null;

  const payload = value as Record<string, unknown>;
  const rates = payload.rates;
  if (typeof rates !== "object" || rates === null) return null;

  const rate = (rates as Record<string, unknown>)[quote];
  if (!isPositiveRate(rate)) return null;

  const timestamp = payload.time_last_updated;
  const asOf =
    typeof timestamp === "number" && Number.isFinite(timestamp) && timestamp > 0
      ? new Date(timestamp * 1_000).toISOString()
      : now.toISOString();

  return {
    base,
    quote,
    rate,
    asOf,
    source: "exchange-rate-api",
  };
}

export async function fetchFiatRate(
  base: CurrencyCode,
  quote: CurrencyCode,
  fetchImplementation: typeof fetch = fetch,
): Promise<FiatRate> {
  if (base === quote) {
    return {
      base,
      quote,
      rate: 1,
      asOf: new Date().toISOString(),
      source: "identity",
    };
  }

  let primaryError: unknown;
  try {
    const url = new URL(
      `/npm/@fawazahmed0/currency-api@latest/v1/currencies/${base.toLowerCase()}.json`,
      PRIMARY_ORIGIN,
    );
    const response = await fetchImplementation(url, {
      next: { revalidate: FIAT_CACHE_SECONDS },
      signal: AbortSignal.timeout(FIAT_UPSTREAM_TIMEOUT_MS),
    });
    if (!response.ok) throw new Error("Primary provider returned a non-success status");

    const parsed = parsePrimaryFiatRate(await response.json(), base, quote);
    if (!parsed) throw new Error("Primary provider returned an invalid payload");
    return parsed;
  } catch (error) {
    primaryError = error;
  }

  try {
    const url = new URL(`/v4/latest/${base}`, FALLBACK_ORIGIN);
    const response = await fetchImplementation(url, {
      next: { revalidate: FIAT_CACHE_SECONDS },
      signal: AbortSignal.timeout(FIAT_UPSTREAM_TIMEOUT_MS),
    });
    if (!response.ok) throw new Error("Fallback provider returned a non-success status");

    const parsed = parseFallbackFiatRate(await response.json(), base, quote);
    if (!parsed) throw new Error("Fallback provider returned an invalid payload");
    return parsed;
  } catch (fallbackError) {
    const code =
      isTimeoutError(fallbackError) || isTimeoutError(primaryError)
        ? "UPSTREAM_TIMEOUT"
        : "UPSTREAM_UNAVAILABLE";
    throw new FiatRateProviderError(code);
  }
}

function isPositiveRate(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value > 0;
}

function parseDate(value: unknown, fallback: Date): string {
  if (typeof value !== "string") return fallback.toISOString();
  const timestamp = Date.parse(`${value}T00:00:00.000Z`);
  return Number.isNaN(timestamp) ? fallback.toISOString() : new Date(timestamp).toISOString();
}

function isTimeoutError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "name" in error &&
    (error as { name?: unknown }).name === "TimeoutError"
  );
}
