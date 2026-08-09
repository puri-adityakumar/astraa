# Astraa feature contract

Complete this contract for a new or materially changed tool, game, public route,
provider-backed feature, or contributor pull request.

## Goal, users, and scope

- State the user problem, intended outcome, success signal, and smallest complete version.
- List explicit non-goals and deferred work so omissions are distinguishable from gaps.
- Identify affected routes, existing behavior, migration or compatibility needs, and any
  destructive transition.

## User-visible states and interaction

- Specify initial or empty, hydration, loading, refreshing, success, validation error,
  provider error, unavailable or offline, retry, and destructive-confirmation states that
  can occur.
- Define keyboard actions, focus behavior after meaningful state changes, status
  announcements, and refresh or navigation behavior mid-edit.
- Define the layout below 640 pixels and on desktop, plus dark and light theme behavior.

## Layer placement and state

- Use `$astraa-architecture` to assign server route pages, focused client components, pure
  `lib/` logic, optional focused stores, and provider-facing server interfaces.
- Keep pure parsing, validation, conversion, and formatting outside React and test it.
- Use local component state unless durable editor state justifies a focused Zustand store.
- For persisted state, define a schema version, migration, storage cap, partialization,
  quota or unavailability fallback, and refresh behavior.

## Registry, metadata, and launch state

- Give tools and games a stable ID, canonical path, truthful description, status,
  processing classification, and valid related IDs where the live registry requires them.
- Use unbranded child metadata and let the root template add the Astraa identity once.
- Specify canonical URL, social metadata, indexability, sitemap membership, contextual
  related links, and structured data impact.
- Keep unfinished routes explicitly unavailable and noindex. Define the exact switch and
  passing tests required to launch them.

## Data, privacy, security, and observability

- Classify each datum as browser-local, server-owned, or provider-bound. State what leaves
  the browser, why, how long it persists or caches, and what the UI tells the user.
- Keep credentials and provider policy server-only. Define validation, normalization,
  limits, timeouts, cancellation, cache keys and caps, fallback behavior, and public error
  envelopes for remote work.
- Bound uploads and stored collections. Render user content safely and never trust raw HTML.
- Define sanitized diagnostic context and meaningful failure or latency instrumentation.
  Exclude raw tool input, secrets, request bodies, clipboard data, detailed URLs, and
  personal identifiers from logs and telemetry.

## Accessibility and presentation

- Reuse existing UI primitives and semantic HTML before introducing new components.
- Ensure labels, keyboard reachability, visible focus, 44-by-44-pixel targets, appropriate
  live regions, meaningful alternative text, and reduced-motion behavior.
- Define persistent feedback for persistent failures; do not depend on color, motion, or a
  transient toast alone.

## Testing and verification

- Add unit tests for pure logic, edge values, malformed input, migrations, and regressions.
- Add or update production-browser coverage for route behavior, keyboard flows,
  accessibility, responsive behavior, and SEO contracts when applicable.
- Read live scripts from `package.json` and CI commands from `.github/workflows/ci.yml`.
  Select focused checks during implementation and all applicable canonical gates for final
  verification; do not freeze a copied command list here.
- Record automated results separately from manual mobile or desktop and dark or light
  checks. Report skipped checks and residual risk explicitly.

## Documentation and contributor completion

- Update public factual docs when architecture, interfaces, components, or SEO behavior
  changes; keep agent procedure in repository skills and human policy in `CONTRIBUTING.md`.
- Ensure UI copy, metadata, privacy claims, guides, and availability remain truthful.
- Read `CONTRIBUTING.md` for assignment, branch, commit, pull-request, review, and release
  requirements rather than duplicating them here.
- Re-read the final diff for scope, secrets, generated artifacts, debug output, dead code,
  stale references, and intentionally deferred work.
