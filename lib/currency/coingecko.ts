import { logError } from "@/lib/error-handler";

/**
 * Server-only CoinGecko access, imported exclusively by route handlers. The
 * provider credential is read from a server-only environment variable, so it
 * is never bundled; a client import would see an undefined key and fail safe.
 */
const COINGECKO_API = "https://api.coingecko.com/api/v3";
const CACHE_TTL_MS = 60_000;
const CACHE_LIMIT = 256;
const REQUEST_TIMEOUT_MS = 5_000;

export type CryptoPriceResult =
  | { status: "ok"; price: number | null }
  | { status: "unconfigured" }
  | { status: "error" };

type CacheEntry = { price: number | null; expiresAt: number };

// Prices are public and short-lived, so one entry per pair keeps repeated
// anonymous requests off the provider quota without any per-visitor state.
const priceCache = new Map<string, CacheEntry>();

function readPrice(
  payload: unknown,
  cryptoId: string,
  currency: string,
): number | null {
  if (typeof payload !== "object" || payload === null) {
    return null;
  }
  const byCurrency = (payload as Record<string, unknown>)[cryptoId];
  if (typeof byCurrency !== "object" || byCurrency === null) {
    return null;
  }
  const price = (byCurrency as Record<string, unknown>)[
    currency.toLowerCase()
  ];
  return typeof price === "number" && Number.isFinite(price) ? price : null;
}

function remember(key: string, price: number | null): void {
  if (priceCache.size >= CACHE_LIMIT) {
    priceCache.clear();
  }
  priceCache.set(key, { price, expiresAt: Date.now() + CACHE_TTL_MS });
}

function logProviderFailure(
  reason: string,
  cryptoId: string,
  currency: string,
  status?: number,
): void {
  logError(new Error(`CoinGecko price request failed: ${reason}`), {
    context: "currency/coingecko",
    cryptoId,
    currency,
    ...(status === undefined ? {} : { status }),
  });
}

export async function fetchCryptoPrice(
  cryptoId: string,
  currency: string,
): Promise<CryptoPriceResult> {
  const apiKey = process.env.COINGECKO_API_KEY;
  if (!apiKey) {
    return { status: "unconfigured" };
  }

  const cacheKey = `${cryptoId}:${currency.toLowerCase()}`;
  const cached = priceCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return { status: "ok", price: cached.price };
  }

  const query = new URLSearchParams({
    ids: cryptoId,
    vs_currencies: currency.toLowerCase(),
  });

  try {
    const response = await fetch(`${COINGECKO_API}/simple/price?${query}`, {
      headers: { "x-cg-demo-api-key": apiKey },
      cache: "no-store",
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });

    if (!response.ok) {
      logProviderFailure("provider_status", cryptoId, currency, response.status);
      return { status: "error" };
    }

    const price = readPrice(await response.json(), cryptoId, currency);
    remember(cacheKey, price);
    return { status: "ok", price };
  } catch (error) {
    // Only the error's class name is logged: provider URLs, response bodies,
    // headers, and the key itself never reach the shared logger.
    logProviderFailure(
      `transport_${error instanceof Error ? error.name : "unknown"}`,
      cryptoId,
      currency,
    );
    return { status: "error" };
  }
}
