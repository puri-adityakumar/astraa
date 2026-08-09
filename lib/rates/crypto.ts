import type { CryptoId } from "@/lib/crypto-data";
import type { CurrencyCode } from "@/lib/currency-data";
import type { ExchangeRate } from "@/lib/rates/types";
export { isCryptoId, isCurrencyCode } from "@/lib/rates/validators";

const COINGECKO_ORIGIN = "https://api.coingecko.com/api/v3";

export const CRYPTO_CACHE_SECONDS = 60;
export const CRYPTO_STALE_SECONDS = 120;
export const CRYPTO_UPSTREAM_TIMEOUT_MS = 8_000;

export interface CryptoRate extends ExchangeRate {
  base: CryptoId;
  quote: CurrencyCode;
  rate: number;
  asOf: string;
  source: "coingecko";
}

export class CryptoRateProviderError extends Error {
  constructor(
    public readonly code: "UPSTREAM_UNAVAILABLE" | "UPSTREAM_INVALID",
    message: string,
  ) {
    super(message);
    this.name = "CryptoRateProviderError";
  }
}

export async function fetchCryptoRate(
  cryptoId: CryptoId,
  currency: CurrencyCode,
  apiKey: string,
  signal: AbortSignal,
  fetchImplementation: typeof fetch = fetch,
): Promise<CryptoRate> {
  const quote = currency.toLowerCase();
  const url = new URL(`${COINGECKO_ORIGIN}/simple/price`);
  url.searchParams.set("ids", cryptoId);
  url.searchParams.set("vs_currencies", quote);

  const response = await fetchImplementation(url, {
    headers: { "x-cg-demo-api-key": apiKey },
    next: { revalidate: CRYPTO_CACHE_SECONDS },
    signal,
  });

  if (!response.ok) {
    throw new CryptoRateProviderError(
      "UPSTREAM_UNAVAILABLE",
      `CoinGecko returned ${response.status}`,
    );
  }

  const data: unknown = await response.json();
  const rate = readCryptoRate(data, cryptoId, quote);
  if (rate === null) {
    throw new CryptoRateProviderError(
      "UPSTREAM_INVALID",
      "CoinGecko returned an invalid rate payload",
    );
  }

  return {
    base: cryptoId,
    quote: currency,
    rate,
    asOf: new Date().toISOString(),
    source: "coingecko",
  };
}

function readCryptoRate(data: unknown, cryptoId: string, currency: string): number | null {
  if (typeof data !== "object" || data === null) return null;
  const cryptoRecord = (data as Record<string, unknown>)[cryptoId];
  if (typeof cryptoRecord !== "object" || cryptoRecord === null) return null;
  const rate = (cryptoRecord as Record<string, unknown>)[currency];
  return typeof rate === "number" && Number.isFinite(rate) && rate > 0 ? rate : null;
}
