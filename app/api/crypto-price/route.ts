import { NextResponse } from "next/server";

import { fetchCryptoPrice } from "@/lib/currency/coingecko";
import { resolveCryptoPricePair } from "@/lib/currency/pair";

// Prices move once a minute at most, so shared caches absorb repeat lookups and
// keep anonymous traffic from spending the provider quota.
const PRICE_CACHE_HEADERS = {
  "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
};

export async function GET(request: Request) {
  const pair = resolveCryptoPricePair(new URL(request.url).searchParams);
  if (pair === null) {
    return NextResponse.json({ error: "invalid_pair" }, { status: 400 });
  }

  const result = await fetchCryptoPrice(pair.cryptoId, pair.currency);

  if (result.status === "unconfigured") {
    return NextResponse.json(
      { error: "price_unavailable" },
      { status: 503 },
    );
  }
  if (result.status === "error") {
    return NextResponse.json({ error: "price_unavailable" }, { status: 502 });
  }

  return NextResponse.json(
    { price: result.price },
    { headers: PRICE_CACHE_HEADERS },
  );
}
