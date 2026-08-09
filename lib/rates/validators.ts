import { cryptocurrencies, type CryptoId } from "@/lib/crypto-data";
import { currencies, type CurrencyCode } from "@/lib/currency-data";

const CRYPTO_IDS = new Set<string>(cryptocurrencies.map((crypto) => crypto.id));
const CURRENCY_CODES = new Set<string>(currencies.map((currency) => currency.code));

export function isCryptoId(value: string): value is CryptoId {
  return CRYPTO_IDS.has(value);
}

export function isCurrencyCode(value: string): value is CurrencyCode {
  return CURRENCY_CODES.has(value.toUpperCase());
}
