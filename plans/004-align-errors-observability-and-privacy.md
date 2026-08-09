# Plan 004: Align error handling, observability, and privacy promises

> **Executor instructions**: Implement the privacy-minimal baseline in this
> plan. Do not invent legal claims or enable new tracking. Run every verification
> gate and update `plans/README.md` when complete. Stop on any listed condition.
>
> **Drift check (run first)**:
> `git diff --stat 94a1b1f..HEAD -- lib/error-handler.ts lib/error-handler.test.ts app/error.tsx app/global-error.tsx instrumentation-client.ts sentry.server.config.ts sentry.edge.config.ts next.config.js app/layout.tsx app/privacy components/contribute components/footer.tsx`
> Reconcile Plans 002–003 first; material unexplained drift is a STOP condition.

## Status

- **Priority**: P1
- **Effort**: M
- **Risk**: MED
- **Depends on**: `plans/002-close-security-and-abuse-paths.md`,
  `plans/003-build-a-bounded-data-fetching-layer.md`
- **Category**: security
- **Planned at**: commit `94a1b1f`, 2026-08-08

## Why this matters

Astraa handles passwords, files, Markdown, regex text, and AI prompts, so a
privacy-first claim must be backed by conservative diagnostics. Today the app
can display/copy raw exception messages while Sentry records all traces, enables
Replay and logs, and sends default PII. Public copy simultaneously says there
is no data collection. This phase makes public errors safe, telemetry minimal,
and disclosures factual.

## Current state

- `lib/error-handler.ts:22-91` returns raw `error.message` in a `technical`
  field. `logError` at lines 97-105 logs that field and arbitrary context.
- `sanitizeErrorMessage()` exists at lines 128-135 but is not applied by either
  conversion or logging. Its regex ordering can also let the Unix-path pattern
  alter a URL before the URL pattern handles it.
- `app/error.tsx:20-32,127-165` logs the whole exception, displays
  `error.message`, and copies it to the clipboard. Its repeating animation at
  lines 46-54 does not respect reduced motion.
- `instrumentation-client.ts:7-29` enables Replay, logs, 100% tracing, 10%
  session replay, 100% error replay, and `sendDefaultPii: true`.
- `sentry.server.config.ts:7-18` and `sentry.edge.config.ts:8-19` also use 100%
  tracing, logs, and default PII.
- `app/layout.tsx:161-165` mounts Vercel Analytics and Speed Insights in
  production. Vercel Web Analytics is cookie-free but still receives page-view
  data; it is not “no data collection.” See
  <https://vercel.com/docs/analytics/privacy-policy>.
- `components/contribute/contribute-client.tsx:58-60` says all tools are local
  and there is no collection, although text generation and rate conversion use
  remote providers and production telemetry is mounted.
- `app/privacy/privacy-policy.md:154-172` says local statistics never leave the
  device, while other sections contain generic account, purchase, and contact
  language for product flows that do not exist.
- `lib/stores/user-preferences.ts:13-27` defaults analytics to false, but that
  store is not mounted and does not gate Vercel or Sentry. It is not consent.
- `components/footer.tsx:73-76` always displays “All systems operational” even
  when no health source exists.

## Commands you will need

| Purpose | Command | Expected on success |
|---------|---------|---------------------|
| Error tests | `npm test -- lib/error-handler.test.ts` | all redaction cases pass |
| Full tests | `npm test` | all pass |
| Typecheck | `npx tsc --noEmit` | exit 0 |
| Lint | `npm run lint` | exit 0, no new warning |
| Build | `ASTRAA_DISABLE_SENTRY_SOURCE_MAPS=true npm run build -- --webpack` | exit 0 |

## Scope

**In scope**:

- `lib/error-handler.ts`, `lib/error-handler.test.ts`
- a small server/client-safe diagnostics module under `lib/observability/`
- `app/error.tsx`, `app/global-error.tsx`
- `instrumentation-client.ts`
- `sentry.server.config.ts`, `sentry.edge.config.ts`
- `next.config.js` only for Sentry privacy-related settings
- `app/layout.tsx`
- `app/privacy/privacy-policy.md` and privacy page metadata
- `components/contribute/contribute-client.tsx`
- `components/footer.tsx`
- error call sites touched by Plans 002–003 when required to adopt stable codes

**Out of scope**:

- Legal advice or a jurisdiction-specific compliance certification.
- A cookie/consent management platform.
- Product accounts, cloud sync, or marketing tracking.
- Removing dead preference stores; Plan 005 owns that cleanup.
- CSP enforcement. Record a follow-up for Report-Only after deployed headers are
  inspected.

## Git workflow

- Branch: `codex/004-private-observability`
- Suggested commits:
  `refactor(errors): separate public and diagnostic errors` and
  `docs(privacy): align disclosures with runtime data flows`.
- Target `development`; do not push without operator approval.

## Steps

### Step 1: Define public errors separately from diagnostics

Replace substring-classification plus a public `technical` field with a small
typed error contract:

- stable code;
- safe title/message/action for UI;
- optional retryable boolean;
- diagnostic cause/context kept internal only.

Provider and route modules should create named domain errors/codes instead of
matching English substrings. Keep a generic converter for unexpected errors,
but never include raw messages in its public return value.

Create one sanitization pipeline for diagnostic messages and allowlisted
context. It must redact URLs (including query/hash), email, IP, absolute paths,
authorization/cookie headers, obvious API/token patterns, and long free-form
strings; cap field length and nesting depth. Apply it before console output or
Sentry context. Preserve useful error code, operation, status class, route
template, and duration.

Update tests with representative Windows/Unix paths, URLs, email/IP, token-like
values, nested context, long strings, unknown thrown values, and ordering cases.
Tests must assert the sensitive input is absent, not only that a placeholder is
present.

**Verify**: `npm test -- lib/error-handler.test.ts` passes and
`rg -n "technical:" app components` finds no UI exposure.

### Step 2: Make error boundaries safe and accessible

Use the central logger/diagnostics function in `app/error.tsx` and
`app/global-error.tsx`. Display a generic user message and optional server
`digest`; never render or copy raw `error.message`. The copy action may include
only stable error code/digest, route template, and timestamp.

Use `useReducedMotion()` from the existing animation package. Disable the
infinite pulse and entrance transforms when motion is reduced. Give the error
heading focus or move focus to it after the boundary mounts, use an alert/live
region once, and keep retry/back/home actions keyboard accessible.

**Verify** with a deliberately thrown test error containing an email, URL, and
path: none appears in DOM, clipboard text, console output, or captured mock
Sentry event; the digest remains available.

### Step 3: Set a privacy-minimal Sentry baseline

Configure Sentry from environment and disable it when no DSN/environment is
configured. The DSN itself is not a password, but environment ownership makes
environments explicit. Baseline settings:

- `sendDefaultPii: false` on client, server, and edge;
- no Replay integration and both replay sample rates zero;
- logs disabled until every logging call uses the sanitizer;
- low, environment-aware trace sampling rather than 100%;
- `beforeSend`/`beforeBreadcrumb` redaction for URL query/hash, headers,
  request bodies, form/input values, and arbitrary context;
- deny attachment of passwords, Markdown/files, regex test strings, AI topics
  or provider output, rate-limit identities, and clipboard content;
- keep release/environment, stable error code, route template, build version,
  and coarse timings.

Do not treat the dead `useUserPreferences` analytics flag as consent. If Replay
is ever proposed later, it requires an explicit product/privacy review and
field masking tests before enablement.

**Verify** with a mocked Sentry transport/event processor: a synthetic event
containing all named sensitive fields is either dropped or arrives redacted.

### Step 4: Decide and document production analytics honestly

Use this baseline product decision unless the operator explicitly chooses a
stricter one:

- keep Vercel Analytics and Speed Insights because they provide aggregate
  performance/usage signals without a custom visitor cookie;
- disclose that production sends limited page-view and performance data to
  Vercel;
- do not add the unused visitor counter or any marketing identifiers;
- provide an operator-visible environment switch that disables both components
  together for privacy-sensitive deployments.

If the operator chooses “zero production analytics,” remove both components
instead and state that clearly. Do not claim they are disabled while leaving
them mounted.

**Verify**: the chosen environment switch produces a build where both analytics
components are absent, and default production behavior matches the policy text.

### Step 5: Rewrite factual privacy and product copy

Inventory the actual post-Plan-003 flows and update the policy and short copy:

- which tools process entirely on-device;
- text topic/word count sent to the configured AI provider;
- currency/crypto pair sent to Astraa's server and then rate providers;
- server-fetched public GitHub contributor data;
- Vercel aggregate analytics/performance if retained;
- minimal Sentry errors/traces if enabled, with Replay/PII disabled;
- anonymous rate-limit identifier purpose and short retention;
- storage keys retained locally, reset path, and no cloud sync/account flow.

Remove generic claims about accounts, purchases, or email collection unless the
runtime actually implements them. Replace “all tools”/“no data collection” with
precise “most tools process locally” language and name exceptions near the
affected tools. Ask the operator to arrange appropriate legal review before
publishing; the executor should ensure technical accuracy only.

Remove or replace the hardcoded footer health badge with a real status link if
one exists. Do not present an unmeasured operational claim.

**Verify**:

- `rg -n "no data collection|all tools run locally|All systems operational" app components`
  returns no misleading claim.
- Every external runtime request documented by `rg -n "fetch\(|OpenRouter|Analytics|Sentry" app components lib instrumentation-client.ts sentry.*.config.ts`
  has a matching disclosure or is explicitly operational-only and redacted.

## Test plan

- Extend the existing error-handler test file; preserve public safe-message
  behavior while deleting assertions that codify raw technical output.
- Add observability redaction tests around the exact event processor or helper
  used in production.
- Add a component-level or Plan-006 browser test for error boundary DOM and
  reduced motion.
- Manually compare policy statements against an instrumented network log for
  homepage, password, Markdown, currency, text, contribute, and regex routes.

## Done criteria

- [ ] Raw exception messages and arbitrary context cannot reach UI, clipboard,
      console, or Sentry unsanitized.
- [ ] Error animations respect reduced motion and focus reaches the error state.
- [ ] Sentry default PII, Replay, 100% traces, and unrestricted logs are off.
- [ ] Vercel analytics behavior is controlled and accurately disclosed.
- [ ] Policy/copy names all actual external processing and removes nonexistent
      account/purchase flows.
- [ ] Footer no longer asserts unmeasured health.
- [ ] Tests, typecheck, lint, and build pass; only scope files changed.
- [ ] `plans/README.md` status is updated.

## STOP conditions

- The operator requires Sentry Replay or raw request bodies for support. That
  needs a separate documented privacy/security decision, not a quiet exception.
- The technical request inventory and deployed production configuration differ;
  capture both before editing policy.
- A jurisdiction-specific legal promise is requested. Report it for qualified
  review instead of drafting it as engineering fact.
- Sanitization destroys stack frames or stable error codes needed to debug.
  Preserve those fields while redacting user-controlled values; do not revert
  to raw messages.

## Maintenance notes

- Review telemetry settings whenever a new tool accepts secrets or file content.
- Privacy copy is a runtime contract. A PR adding an external request must update
  the request inventory and user-facing disclosure in the same change.
- After deployment, inspect actual headers and Sentry event samples, then plan a
  CSP Report-Only rollout separately.
