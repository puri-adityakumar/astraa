# Server interfaces

Astraa keeps provider credentials and remote-resource policy on the server. The
browser consumes two rate endpoints and one server action; most other tools run
entirely in the browser.

## Shared rate response

Successful fiat and crypto requests return one rate for one normalized pair:

```json
{
  "base": "USD",
  "quote": "EUR",
  "rate": 0.92,
  "asOf": "2026-08-08T12:00:00.000Z",
  "source": "currency-api"
}
```

Errors use a stable public envelope and never include upstream payloads or
credentials:

```json
{
  "error": {
    "code": "UPSTREAM_UNAVAILABLE",
    "message": "Fiat rates are temporarily unavailable."
  }
}
```

Supported error codes are `INVALID_PAIR`, `NOT_CONFIGURED`,
`UPSTREAM_TIMEOUT`, and `UPSTREAM_UNAVAILABLE`.

## `GET /api/rates/fiat`

Query parameters:

- `base`: supported three-letter currency code, case-insensitive;
- `quote`: supported three-letter currency code, case-insensitive.

The route validates both values, fetches the primary provider with a bounded
timeout, falls back to a second provider, and returns an identity rate when the
pair is equal. Successful responses are CDN-cacheable for one hour with six
hours of stale-while-revalidate coverage.

Status codes:

- `200`: rate returned;
- `400`: unsupported pair;
- `502`: providers unavailable or invalid;
- `504`: provider timeout.

## `GET /api/rates/crypto`

Query parameters:

- `base`: a supported CoinGecko asset ID such as `bitcoin`;
- `quote`: a supported currency code such as `USD`.

`COINGECKO_API_KEY` remains server-only and is sent to CoinGecko by the route.
Successful responses are CDN-cacheable for one minute with two minutes of
stale-while-revalidate coverage.

Status codes:

- `200`: rate returned;
- `400`: unsupported pair;
- `503`: server credential is not configured;
- `502`: provider unavailable or invalid;
- `504`: provider timeout.

## `generateText` server action

`lib/openrouter.ts` exposes the server action used by the text tool. It:

- accepts a non-empty topic of at most 500 characters;
- accepts an integer word count from 10 through 1,000;
- hashes the request identity with `RATE_LIMIT_SALT`;
- permits five attempts per ten-minute window;
- uses Upstash in configured deployments and an in-memory store in development;
- fails closed in production when rate limiting or required credentials are unavailable;
- applies a 20-second upstream timeout;
- returns a typed success/error result instead of throwing provider details to the client.

Required production variables are `OPENROUTER_API_KEY`, `KV_REST_API_URL`,
`KV_REST_API_TOKEN`, and `RATE_LIMIT_SALT`.

## Server-cached contributors

`lib/github/contributors.ts` is a server-only React cache wrapper around the
GitHub contributors request. The helper validates allowed GitHub URLs, removes
bots, caps the result at 20, revalidates after one hour, applies a five-second
timeout, and returns an empty fallback on failure. Client components must not
call GitHub's contributors API directly.

## Client rate resource

`hooks/use-exchange-rate.ts` consumes the two rate routes through the bounded
resource in `lib/rates/client.ts`. It caches by `kind:base:quote`, caps the cache
at 50 entries, deduplicates concurrent requests, aborts work with no consumers,
and ignores stale request generations. Amount changes are calculated locally
and must not trigger new network requests.
