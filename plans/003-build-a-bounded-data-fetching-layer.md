# Plan 003: Build a bounded data-fetching and cache layer

> **Executor instructions**: Follow the ordered steps and verification gates.
> Do not introduce a query library unless a STOP condition shows the focused
> design cannot satisfy the requirements. Update `plans/README.md` when done.
>
> **Drift check (run first)**:
> `git diff --stat 94a1b1f..HEAD -- lib/api.ts lib/currency-data.ts lib/crypto-data.ts components/currency components/footer.tsx components/contribute app/api/stats app/api/rates lib/rates`
> Reconcile changes from Plan 002 first; unexpected drift is a STOP condition.

## Status

- **Priority**: P1
- **Effort**: M
- **Risk**: MED
- **Depends on**: `plans/002-close-security-and-abuse-paths.md`
- **Category**: perf
- **Planned at**: commit `94a1b1f`, 2026-08-08

## Why this matters

Current converter effects couple amount entry to remote I/O. They can issue
duplicate calls, allow stale responses to win, and make loading state lie when
requests overlap. Contributor data is also fetched independently from two
client components, leaking visitors' IPs to GitHub and duplicating work. A
small typed resource layer gives Astraa caching, cancellation, and consistent
errors without the cost of a general server-state framework.

## Current state

- `components/currency/fiat-converter.tsx:36-89` fetches a pair rate whenever
  `amount`, source, or target changes. Debouncing delays the request but does not
  abort it or prevent an older response/finally block from overwriting newer
  state.
- `components/currency/crypto-converter.tsx:31-68` repeats the same pattern and
  omits `toast` from dependencies.
- Amount multiplication is pure; changing `10` to `100` should not refetch an
  unchanged USD/EUR or BTC/USD rate.
- `lib/api.ts:35-78` fetches two public fiat providers from the browser, with no
  timeout, response schema, explicit cache policy, or abort signal.
- Plan 002 creates a protected local crypto-rate endpoint. Reuse its response
  contract rather than inventing a second shape.
- `components/footer.tsx:31-59` and
  `components/contribute/contribute-client.tsx:18-42` independently fetch the
  GitHub contributors API after mount.
- `app/api/stats/route.ts:4-49` has both a process-memory cache and Next fetch
  `revalidate`, but its only UI consumer, `components/home/stats-bar.tsx`, is not
  mounted. Do not reuse this route as a general cache abstraction.

React's official guidance requires an Effect cleanup path that aborts or
ignores obsolete fetch results:
<https://react.dev/reference/react/useEffect>. The project does not enable Next
`cacheComponents`, so use explicit server `fetch` revalidation rather than the
`use cache` directive:
<https://nextjs.org/docs/app/api-reference/directives/use-cache>.

## Commands you will need

| Purpose | Command | Expected on success |
|---------|---------|---------------------|
| Rate tests | `npm test -- lib/rates` | all new rate tests pass |
| Full tests | `npm test` | all pass |
| Typecheck | `npx tsc --noEmit` | exit 0 |
| Lint | `npm run lint` | exit 0; converter hook warnings absent |
| Build | `ASTRAA_DISABLE_SENTRY_SOURCE_MAPS=true npm run build -- --webpack` | exit 0 |

## Scope

**In scope**:

- `lib/api.ts`
- `lib/rates/**` (create or extend Plan 002 modules)
- `app/api/rates/fiat/route.ts` (create)
- `app/api/rates/crypto/route.ts` only to align its shared contract
- `hooks/use-exchange-rate.ts` and testable supporting modules (create)
- `components/currency/fiat-converter.tsx`
- `components/currency/crypto-converter.tsx`
- `components/currency/currency-converter-client.tsx`
- `lib/github/contributors.ts` and tests (create)
- `components/footer.tsx`
- `app/contribute/page.tsx`
- `components/contribute/contribute-client.tsx`

**Out of scope**:

- React Query/SWR adoption.
- Currency-history charts, offline historical rates, or trading-grade precision.
- Visitor counts and dead stats-route deletion; Plan 005 owns them.
- Telemetry contents and privacy copy; Plan 004 owns them.

## Git workflow

- Branch: `codex/003-data-fetching-layer`
- Suggested commit: `refactor(data): centralize cached external resources`.
- Target `development`; do not push without operator approval.

## Steps

### Step 1: Define one typed rate contract and server error model

Create shared types for a successful rate (`base`, `quote`, finite positive
`rate`, `asOf`, `source`) and stable failure codes (`INVALID_PAIR`,
`NOT_CONFIGURED`, `UPSTREAM_TIMEOUT`, `UPSTREAM_UNAVAILABLE`). Do not send raw
upstream bodies or error messages to clients.

The local fiat route must:

- validate both codes against `lib/currency-data.ts`;
- use a fixed primary and fallback origin;
- pass a finite timeout to each fetch;
- validate the provider JSON shape and numeric rate;
- explicitly use server fetch revalidation (a reasonable starting TTL is one
  hour for fiat; confirm provider data cadence);
- set `Cache-Control` with a matching shared-cache lifetime and a bounded
  `stale-while-revalidate` window;
- return 400, 502, or 504 consistently.

Align Plan 002's crypto route to the same success/failure envelope with a
shorter starting TTL such as 60 seconds. Put provider-specific parsing in pure
functions with fixture tests.

**Verify**: route/parser tests cover valid data, missing pair, malformed JSON,
non-finite/negative rate, primary failure plus fallback success, and timeout.

### Step 2: Add a focused `useExchangeRate` resource hook

Create a hook keyed only by `{ kind, base, quote }`, never by amount. It should
return `{ rate, asOf, status, errorCode, refresh }`. Requirements:

- abort the obsolete request on key change/unmount;
- also guard state updates with a monotonically increasing request ID, because
  an already-resolved promise may beat abort;
- deduplicate concurrent requests for the same key through a small module-level
  in-flight map;
- keep a bounded TTL cache with separate fiat/crypto lifetimes and a maximum
  entry count; expired entries must be evicted, not grow forever;
- expose manual refresh that invalidates only the current key;
- never cache an error indefinitely;
- keep the last successful rate visible during refresh while exposing a
  refreshing status;
- make all network and cache logic independently testable outside React.

Do not memoize primitives reflexively. The useful abstraction is lifecycle and
resource identity, not wrapping every multiplication in `useMemo`.

**Verify**: pure cache/request-controller tests cover hit, expiry, LRU/size cap,
deduplication, abort, stale response, refresh, and failed-request cleanup.

### Step 3: Refactor both converter components around pair state

Each converter owns/selects its pair and calls `useExchangeRate` once. Derive
the displayed result synchronously from `Number(amount) * rate`; amount edits
must cause no request. Keep the last result while a pair refreshes and provide a
clear unavailable state without writing strings such as `"Error"` into a
numeric field.

Make swap updates atomic so no intermediate same-currency request is visible.
For invalid/empty/negative input, render an empty or validation state without a
toast storm. Announce completed conversions and errors through an appropriate
`aria-live` region; keep fields labelled and keyboard reachable.

Delete the long implementation-deliberation comments at
`components/currency/fiat-converter.tsx:58-70,135-165`; the final component
should explain only non-obvious invariants.

**Verify** manually with a mocked/network-inspected session:

- typing ten amount characters with an unchanged pair makes at most one pair
  request;
- switching USD/EUR quickly to GBP/INR cannot show the old pair's result;
- swap produces the correct inverse pair request;
- offline/error state preserves editable input and retry.

### Step 4: Fetch contributor data once on the server

Create `lib/github/contributors.ts` as a server-only helper. Fetch a bounded
page from the fixed Astraa repository with explicit `next: { revalidate: ... }`
and timeout. Parse an allowlisted shape (`id`, `login`, `avatarUrl`,
`profileUrl`, `contributions`), filter bots/founder in one place, and return a
small static fallback on failure. Do not throw from root layout/footer rendering.

Convert `Footer` to receive server-fetched contributor data (it may be an async
server component) and pass the same helper result from `app/contribute/page.tsx`
into `ContributeClient`. Remove both client `useEffect` fetches and local
duplicate interfaces/filter lists. Ensure remote image host configuration stays
narrow.

**Verify**:

- `rg -n "api.github.com/repos/puri-adityakumar/astraa/contributors" components`
  returns no matches.
- A cold server render makes one cacheable server request path; page navigation
  does not expose a browser request to `api.github.com`.
- GitHub timeout/rate-limit renders the page and footer with fallback content.

### Step 5: Remove superseded API helpers and validate cache behavior

Delete exported client functions from `lib/api.ts` once no consumer remains;
delete the file if empty. Run `rg` for `getExchangeRate` and `getCryptoPrice` to
confirm only the new modules/contracts remain. Document cache TTL constants
next to provider cadence and add response-header assertions to route tests.

**Verify**: full tests, typecheck, lint, build, and `git diff --check` pass.

## Test plan

- Pure provider parser tests use local fixtures, never live network.
- Request/cache tests use fake time and deferred promises to prove an old
  response cannot update the current key.
- Route tests assert validation occurs before fetch and errors are redacted.
- Contributor helper tests cover valid list, bot filtering, malformed response,
  timeout, and static fallback.
- Plan 006 will add browser-level request-count and stale-response tests.

## Done criteria

- [ ] Amount changes do not fetch an unchanged rate pair.
- [ ] Obsolete rate requests are aborted and cannot update visible state.
- [ ] Rate caches have explicit TTL, deduplication, and size bounds.
- [ ] External rate and GitHub responses are parsed into typed allowlisted
      shapes with timeouts.
- [ ] Visitors' browsers do not call GitHub contributors directly.
- [ ] No duplicate or dead `lib/api.ts` path remains.
- [ ] Tests, typecheck, lint, and production build pass.
- [ ] Only in-scope files changed and the plan index is updated.

## STOP conditions

- Plan 002's crypto endpoint does not provide a stable typed contract; reconcile
  it before writing the hook.
- A provider's license or cache policy forbids the proposed server caching.
- Product requirements demand tick-level or financial-grade accuracy. This plan
  is for a utility converter, not a trading system.
- Making Footer async creates an uncached full-site dynamic render. Inspect the
  build output and use a cached server child/API boundary instead of accepting
  the regression.

## Maintenance notes

- Add new remote resources to the focused layer only when they need shared
  lifecycle/cache behavior; do not make it a generic fetch wrapper.
- TTL values are product data-quality decisions. Review them when providers or
  plans change.
- Monitor upstream failure rates by code, not response bodies or user input.
