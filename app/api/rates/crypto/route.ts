import { NextResponse } from "next/server";

import {
  CryptoRateProviderError,
  CRYPTO_CACHE_SECONDS,
  CRYPTO_STALE_SECONDS,
  CRYPTO_UPSTREAM_TIMEOUT_MS,
  fetchCryptoRate,
  isCryptoId,
  isCurrencyCode,
} from "@/lib/rates/crypto";

export const CRYPTO_CACHE_CONTROL = `public, s-maxage=${CRYPTO_CACHE_SECONDS}, stale-while-revalidate=${CRYPTO_STALE_SECONDS}`;

export async function GET(request: Request): Promise<NextResponse> {
  const url = new URL(request.url);
  const cryptoId = url.searchParams.get("base") ?? "";
  const requestedCurrency = (url.searchParams.get("quote") ?? "").toUpperCase();

  if (!isCryptoId(cryptoId) || !isCurrencyCode(requestedCurrency)) {
    return NextResponse.json(
      { error: { code: "INVALID_PAIR", message: "Unsupported currency pair." } },
      { status: 400 },
    );
  }

  const apiKey = process.env.COINGECKO_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      {
        error: {
          code: "NOT_CONFIGURED",
          message: "Crypto rates are temporarily unavailable.",
        },
      },
      { status: 503 },
    );
  }

  try {
    const rate = await fetchCryptoRate(
      cryptoId,
      requestedCurrency,
      apiKey,
      AbortSignal.timeout(CRYPTO_UPSTREAM_TIMEOUT_MS),
    );

    return NextResponse.json(rate, {
      headers: { "Cache-Control": CRYPTO_CACHE_CONTROL },
    });
  } catch (error) {
    const isTimeout = error instanceof DOMException && error.name === "TimeoutError";
    const status = isTimeout ? 504 : 502;
    const code = isTimeout ? "UPSTREAM_TIMEOUT" : "UPSTREAM_UNAVAILABLE";

    if (error instanceof CryptoRateProviderError) {
      return NextResponse.json(
        { error: { code: "UPSTREAM_UNAVAILABLE", message: "Rate data is unavailable." } },
        { status: 502 },
      );
    }

    return NextResponse.json(
      { error: { code, message: "Crypto rates are temporarily unavailable." } },
      { status },
    );
  }
}
