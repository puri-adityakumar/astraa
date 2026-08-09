# Plan 002: Close dependency, credential, API-abuse, and regex execution risks

> **Executor instructions**: Follow every step and verification gate. Never
> print, copy into a plan, or commit a credential value. If a STOP condition
> occurs, stop and report; do not weaken a boundary to make a test pass. Update
> the status row in `plans/README.md` when complete.
>
> **Drift check (run first)**:
> `git diff --stat 94a1b1f..HEAD -- package.json package-lock.json lib/api.ts lib/openrouter.ts components/text components/currency lib/regex-tester components/regex-tester .env.sample next.config.js`
> Material drift in these paths is a STOP condition until reconciled.

## Status

- **Priority**: P1
- **Effort**: L
- **Risk**: HIGH
- **Depends on**: `plans/001-stabilize-runtime-boundaries.md`
- **Category**: security
- **Planned at**: commit `94a1b1f`, 2026-08-08

## Why this matters

The audited lockfile contains high-severity advisories in code that handles
public input, a provider credential is shipped in the browser bundle, and two
public compute paths are unbounded. A malicious regex can also freeze the UI
before the existing worker is invoked. This phase creates hard server and worker
boundaries before performance-oriented refactors reuse them.

## Current state

- `package-lock.json` resolves older versions than the installed working tree.
  A clean CI install receives Next 16.1.0, React 19.2.3, Sentry 10.32.1,
  js-yaml 4.1.1, Mermaid 11.14.0, and related transitive versions. The audit
  reported 12 high-severity advisories.
- `package.json:24,71,81` pins/alleges mismatched Next toolchain versions.
  `@next/swc-wasm-nodejs` and `eslint-config-next` must be aligned with Next or
  removed when unnecessary.
- `lib/api.ts:1-12` contains a hardcoded CoinGecko demo credential and is
  imported by client components. Treat that credential as compromised; source
  deletion does not invalidate copies in Git history or browser bundles.
- `lib/api.ts:4-32` accepts dynamic query values and calls CoinGecko directly
  from the browser without a timeout or response schema validation.
- `lib/openrouter.ts:1-60` is a public Server Action. It validates basic types
  but permits 5,000 words, has no rate limit or timeout, returns configuration
  details to users, and can consume provider quota anonymously.
- `components/text/text-generator-client.tsx:24-31` calls that action; its UI
  maximum is 1,000 words, so the client/server contract disagrees.
- `components/regex-tester/regex-tester-client.tsx:127-157` calls `runMatches`
  synchronously in `useMemo` and invokes `runMatchesSafe` only after the sync
  loop reports a soft timeout.
- A single `RegExp.exec()` at `lib/regex-tester/match.ts:24-35` can block before
  the elapsed-time check at lines 47-49.
- `lib/regex-tester/redos-client.ts:14-38,46-57,102-110` falls back to that same
  synchronous execution when Worker construction or execution fails.

Authoritative minimums observed during the audit:

- Next Server Action/App Router denial of service: upgrade to a release outside
  the affected range documented at
  <https://github.com/advisories/GHSA-m99w-x7hq-7vfj>.
- js-yaml prototype pollution: use 4.3.1 or newer:
  <https://github.com/advisories/GHSA-5p4m-2wfm-xmqj>.
- Mermaid denial of service: use 11.15.0 or newer:
  <https://github.com/advisories/GHSA-ghcm-xqfw-q4vr>.
- DOMPurify: ensure the resolved version is 3.4.13 or newer:
  <https://github.com/advisories/GHSA-55q2-fjhq-7xh7>.

Use the latest compatible patched releases at execution time, not these
minimums blindly. Read each package's official release notes before crossing a
major version.

## Commands you will need

| Purpose | Command | Expected on success |
|---------|---------|---------------------|
| Clean install | `npm ci` | lockfile installs exactly, exit 0 |
| Audit | `npm audit --omit=dev --audit-level=high` | exit 0, no high advisory |
| Unit tests | `npm test` | all pass, including new security cases |
| Typecheck | `npx tsc --noEmit` | exit 0 |
| Lint | `npm run lint` | exit 0, no new warning |
| Build | `ASTRAA_DISABLE_SENTRY_SOURCE_MAPS=true npm run build -- --webpack` | exit 0 |

## Scope

**In scope**:

- `package.json`, `package-lock.json`
- `.env.sample`
- `lib/api.ts` (split or reduce to non-secret client wrappers)
- `lib/crypto-data.ts`, `lib/currency-data.ts` for allowlist reuse only
- `app/api/rates/crypto/route.ts` (create)
- `lib/rates/crypto.ts` and tests (create)
- `lib/openrouter.ts` or a replacement server-only text-generation module
- `lib/rate-limit.ts` and tests (create)
- `components/text/text-generator-client.tsx`
- `components/currency/crypto-converter.tsx`
- `lib/regex-tester/match.ts`
- `lib/regex-tester/redos-client.ts`
- `lib/regex-tester/redos-worker.ts`
- `components/regex-tester/regex-tester-client.tsx`
- co-located tests for the changed pure/server modules

**Out of scope**:

- Rewriting Git history. Credential rotation plus source removal is mandatory;
  history surgery needs a separate coordinated incident procedure.
- Authentication/accounts.
- Fiat caching and reusable React hooks; Plan 003 owns them.
- Enforced CSP; revisit after third-party flows and Sentry are settled.
- Adding a regex engine with different JavaScript semantics.

## Git workflow

- Branch: `codex/002-security-boundaries`
- Suggested commits:
  `chore(deps): update vulnerable runtime packages`,
  `fix(api): protect external provider requests`, and
  `fix(regex): isolate matching in a worker`.
- Target `development`; never commit `.env*` credentials.

## Steps

### Step 1: Reconcile and patch the dependency graph

Start from the lockfile, not the currently installed module versions. Update
Next, its ESLint config, React, Sentry, js-yaml, Mermaid, and affected
transitives to mutually compatible patched versions. Align
`@next/swc-wasm-nodejs` exactly with Next or remove it if the project builds
without it. Do not run `npm audit fix --force` and do not accept an unreviewed
major upgrade.

Run a fresh `npm ci` after updating the lock and print the resolved versions for
the named packages. Confirm CI and local resolution agree. Record any remaining
moderate advisory in the PR description with reachability and a follow-up; do
not waive a high advisory reachable from public input.

**Verify**:

- `npm ci` exits 0 without modifying `package-lock.json`.
- `npm audit --omit=dev --audit-level=high` exits 0.
- `npm ls next react react-dom @sentry/nextjs js-yaml mermaid` has no invalid or
  extraneous entry.

### Step 2: Revoke the shipped CoinGecko credential and create a server boundary

The operator must revoke or rotate the credential currently committed at
`lib/api.ts:1`. The executor must remove it without echoing its value. Add only
`COINGECKO_API_KEY=your_coingecko_api_key_here` to `.env.sample`; never prefix
the variable with `NEXT_PUBLIC_`.

Create a server-only provider function and `GET /api/rates/crypto`. Requirements:

- accept only a crypto ID present in `lib/crypto-data.ts` and currency code
  present in `lib/currency-data.ts`;
- build a fixed CoinGecko origin URL—never accept a caller-provided URL;
- read the key from server environment only;
- use a bounded timeout and validate that the response contains a finite,
  nonnegative number;
- return a typed, minimal JSON shape such as `{ rate, asOf }`;
- use a short server fetch revalidation window and a response `Cache-Control`
  policy so the finite set of allowed pairs does not burn provider quota;
- return 400 for invalid parameters, 503 when server configuration is absent,
  and a generic 502/504 for upstream failure without leaking provider content.

Change the crypto converter to call the local endpoint. Inspect the built
client chunks and Git-tracked files to confirm the credential is absent.

**Verify**:

- `rg -n "CG-|x-cg-demo-api-key" app components lib public .next/static`
  returns no hardcoded credential. A header name may remain only in a
  server-only module if the provider requires it; no value may be present.
- Invalid crypto/currency query values return 400 without an upstream request.
- Missing configuration returns 503 and does not throw during build.

### Step 3: Bound the public text-generation action

Keep the feature anonymous, but treat the action as a public endpoint. Enforce
the same server maximum as the UI: 1,000 words. Move validation to a typed schema
with stable public error codes. Use a direct server-only `fetch` or a verified
SDK API that supports `AbortSignal`; set a finite timeout (for example 20s).

Add a durable anonymous rate limiter using the existing server-side Upstash
dependency or another operator-approved store. Production must fail closed when
rate-limit configuration is missing; local development may use a clearly
bounded development-only adapter. Hash the request identity with a server-only
salt before storage, set a short TTL, and never log the raw IP, topic, prompt,
provider response, or API key. A starting policy is five requests per ten
minutes per identity plus one small global concurrency/budget guard; expose the
numbers as named constants and confirm them with the operator before launch.

Return generic user messages for configuration and provider failures. Capture
only a code, duration, provider status class, and generated size for diagnostics.

**Verify** with mocked provider and limiter tests:

- 1,001 words is rejected before provider invocation;
- the sixth request inside the window is rate-limited;
- timeout aborts the provider and returns a stable timeout code;
- missing production limiter configuration prevents a provider call;
- test output and logs contain no topic/prompt or credentials.

### Step 4: Run every untrusted regex in a worker from the first match

Make `runMatchesSafe()` the only browser path for user-supplied pattern/input.
The React component should keep an async state (`idle`, `running`, `success`,
`timed-out`, `unavailable`, `invalid`) and ignore stale worker results via a
request ID. Prefer one managed worker that is recreated after a hard timeout;
do not create overlapping workers on each keystroke.

On Worker construction/error, fail closed with `unavailable` and no matches.
Never call `fallbackSync()` with untrusted pattern/input. `runMatches()` may
remain as worker-internal pure logic and for bounded unit tests, but it must not
be imported into a client render path. Terminate and replace the worker at the
hard timeout. Preserve match caps, zero-length-match handling, flags, capture
indices, replacement preview, and reduced-motion behavior.

Add tests with a fake Worker for success, syntax error, stale response,
construction failure, worker error, and hard timeout. Add a browser regression
case for a known catastrophic shape such as nested quantifiers over a long
nonmatching input; assert the page stays responsive and reports timeout. Plan
006 will place this browser test in CI if the runner is not added here.

**Verify**:

- `rg -n "runMatches\(" components/regex-tester` returns no matches.
- `rg -n "fallbackSync" lib/regex-tester/redos-client.ts` returns no matches.
- Worker unit tests pass with fake timers and do not execute the catastrophic
  expression on the test runner's main thread.

### Step 5: Re-run the complete clean-install gate

Remove any temporary debug logs or generated audit files. Run a clean install,
full tests, typecheck, lint, and production build. Inspect generated client
chunks for the retired credential and server-only provider packages.

**Verify**: every command in the command table exits 0 and
`git diff --check` prints nothing.

## Test plan

- Server route tests mock CoinGecko and cover allowlists, response validation,
  timeout, caching headers, and missing configuration.
- Text action tests mock provider and rate store; cover validation boundaries,
  quota exhaustion, timeouts, and redacted failures.
- Regex client/manager tests use a controllable fake Worker; never use a real
  catastrophic expression in a unit test process.
- Existing js-yaml and Markdown/Mermaid utility tests must still pass after
  package updates.
- Fresh `npm ci` and production build are mandatory because the original defect
  includes lock/install drift.

## Done criteria

- [ ] The exposed CoinGecko credential is revoked/rotated and absent from source
      and client bundles.
- [ ] No high-severity production dependency advisory remains.
- [ ] Crypto and text provider credentials are server-only.
- [ ] Public text generation has server validation, durable rate limiting,
      timeout, and generic errors.
- [ ] No untrusted regex executes on the main thread, including error fallback.
- [ ] Full tests, typecheck, lint, audit, and build pass from `npm ci`.
- [ ] No files outside scope changed; the plan index status is updated.

## STOP conditions

- The credential owner cannot confirm revoke/rotation before deployment. Source
  removal can be prepared, but do not declare the incident remediated.
- A patched dependency requires a major migration not described here.
- The chosen text-generation rate store cannot provide atomic increment and TTL
  semantics; do not substitute a per-instance memory map in production.
- Worker isolation is unavailable in a supported browser. Report the browser
  and disable regex execution there rather than restoring synchronous fallback.
- A public API must accept arbitrary provider URLs or model names to preserve a
  hidden requirement; that needs a separate threat review.

## Maintenance notes

- Review every new provider parameter as an allowlist expansion and quota risk.
- Rate-limit identifiers are operational data; Plan 004 must document retention
  and ensure Sentry does not capture them.
- Re-run `npm audit` and review official advisories whenever the lockfile changes.
