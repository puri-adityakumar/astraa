const RATE_ERROR_CODES = [
  "INVALID_PAIR",
  "NOT_CONFIGURED",
  "UPSTREAM_TIMEOUT",
  "UPSTREAM_UNAVAILABLE",
] as const;

export type RateErrorCode = (typeof RATE_ERROR_CODES)[number];
export type RateKind = "crypto" | "fiat";
type RateSource = "coingecko" | "currency-api" | "exchange-rate-api" | "identity";

export interface ExchangeRate {
  base: string;
  quote: string;
  rate: number;
  asOf: string;
  source: RateSource;
}

const RATE_SOURCES = new Set<RateSource>([
  "coingecko",
  "currency-api",
  "exchange-rate-api",
  "identity",
]);

export function isRateErrorCode(value: unknown): value is RateErrorCode {
  return typeof value === "string" && RATE_ERROR_CODES.includes(value as RateErrorCode);
}

export function parseExchangeRate(value: unknown): ExchangeRate | null {
  if (typeof value !== "object" || value === null) return null;

  const candidate = value as Record<string, unknown>;
  if (
    typeof candidate.base !== "string" ||
    typeof candidate.quote !== "string" ||
    typeof candidate.rate !== "number" ||
    !Number.isFinite(candidate.rate) ||
    candidate.rate <= 0 ||
    typeof candidate.asOf !== "string" ||
    Number.isNaN(Date.parse(candidate.asOf)) ||
    typeof candidate.source !== "string" ||
    !RATE_SOURCES.has(candidate.source as RateSource)
  ) {
    return null;
  }

  return {
    base: candidate.base,
    quote: candidate.quote,
    rate: candidate.rate,
    asOf: candidate.asOf,
    source: candidate.source as RateSource,
  };
}
