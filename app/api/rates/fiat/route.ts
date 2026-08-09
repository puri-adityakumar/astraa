import { NextResponse } from "next/server";

import {
  FIAT_CACHE_SECONDS,
  FIAT_STALE_SECONDS,
  FiatRateProviderError,
  fetchFiatRate,
} from "@/lib/rates/fiat";
import { isCurrencyCode } from "@/lib/rates/validators";

export const FIAT_CACHE_CONTROL = `public, s-maxage=${FIAT_CACHE_SECONDS}, stale-while-revalidate=${FIAT_STALE_SECONDS}`;

export async function GET(request: Request): Promise<NextResponse> {
  const url = new URL(request.url);
  const base = (url.searchParams.get("base") ?? "").toUpperCase();
  const quote = (url.searchParams.get("quote") ?? "").toUpperCase();

  if (!isCurrencyCode(base) || !isCurrencyCode(quote)) {
    return NextResponse.json(
      { error: { code: "INVALID_PAIR", message: "Unsupported currency pair." } },
      { status: 400 },
    );
  }

  try {
    const rate = await fetchFiatRate(base, quote);
    return NextResponse.json(rate, {
      headers: { "Cache-Control": FIAT_CACHE_CONTROL },
    });
  } catch (error) {
    const code = error instanceof FiatRateProviderError ? error.code : "UPSTREAM_UNAVAILABLE";
    const status = code === "UPSTREAM_TIMEOUT" ? 504 : 502;

    return NextResponse.json(
      { error: { code, message: "Fiat rates are temporarily unavailable." } },
      { status },
    );
  }
}
