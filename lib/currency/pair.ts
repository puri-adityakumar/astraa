import { cryptocurrencies } from "@/lib/crypto-data";
import { currencies } from "@/lib/currency-data";

/** One provider lookup: a catalog crypto id plus a catalog fiat ISO code. */
export type CryptoPricePair = {
  cryptoId: string;
  currency: string;
};

const CRYPTO_IDS = new Set<string>(cryptocurrencies.map((crypto) => crypto.id));
const FIAT_CODES = new Set<string>(currencies.map((currency) => currency.code));

/**
 * Resolves the single crypto/fiat pair a price request may ask for. Both
 * members must be catalog entries, so the anonymous price endpoint only reads
 * prices for known pairs and never forwards caller-supplied ids or URLs.
 */
export function resolveCryptoPricePair(
  params: URLSearchParams,
): CryptoPricePair | null {
  const cryptoId = params.get("crypto");
  const currency = params.get("currency");

  if (cryptoId === null || currency === null) {
    return null;
  }
  if (!CRYPTO_IDS.has(cryptoId) || !FIAT_CODES.has(currency)) {
    return null;
  }

  return { cryptoId, currency };
}
