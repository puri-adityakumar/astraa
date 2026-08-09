# Plan 006: Make CI catch frontend, accessibility, and integration regressions

> **Executor instructions**: Add gates in a sequence that stays green. Fix the
> underlying warning or test; do not raise thresholds or skip unstable routes.
> Run all local equivalents before editing CI. Update `plans/README.md` on
> completion.
>
> **Drift check (run first)**:
> `git diff --stat 94a1b1f..HEAD -- package.json package-lock.json eslint.config.mjs vitest.config.ts tsconfig.json .github playwright.config.ts tests app components lib`
> Reconcile the completed cleanup phase before continuing. Material unexplained
> drift is a STOP condition.

## Status

- **Priority**: P2
- **Effort**: M
- **Risk**: MED
- **Depends on**: `plans/005-remove-dead-state-and-simplify-architecture.md`
- **Category**: tests
- **Planned at**: commit `94a1b1f`, 2026-08-08

## Why this matters

The current unit suite is strong for pure utilities but blind to route crashes,
hydration, browser storage, stale requests, accessibility, and public metadata.
CI also omits lint and TypeScript and intentionally allows 50 warnings locally.
This phase converts the audit's reproduced failures into fast regression tests
and one documented quality command.

## Current state

- `.github/workflows/ci.yml:20-26` runs `npm ci`, `npm test`, and build only.
- `package.json:9` runs ESLint with `--max-warnings 50`; the audited baseline was
  nine warnings, so a new warning does not fail CI.
- `vitest.config.ts:5-9` includes only `lib/**/*.test.ts` in Node. It has no hook,
  component, route, or browser test layer.
- TypeScript strictness is high and `npx tsc --noEmit` passes, but there is no
  named script or CI gate.
- There is no formatter dependency/script despite a documented double-quote,
  semicolon, two-space, trailing-comma, 100-column convention.
- There is no automated test for the failures reproduced during audit:
  `/contribute` error-boundary rendering, theme hydration, server storage access,
  regex UI blocking, or stale rate responses.
- Existing strengths to preserve: 42 unit files, 330 passing tests, strict TS,
  worker-based JSON parsing, dynamic imports for heavy Markdown/snippet paths,
  and cryptographically secure password generation.

Use the Next production checklist when setting gates, but keep budgets based on
measurements rather than arbitrary scores:
<https://nextjs.org/docs/app/guides/production-checklist>.

## Commands you will need

| Purpose | Command | Expected on success |
|---------|---------|---------------------|
| Format | `npm run format:check` | exit 0, no changed files |
| Lint | `npm run lint` | exit 0, zero warnings |
| Typecheck | `npm run typecheck` | exit 0 |
| Unit | `npm run test:unit` | all unit tests pass |
| Dead code | `npm run check:dead-code` | Knip exits 0 |
| Build | `npm run build` | exit 0 |
| Browser | `npm run test:e2e` | all Chromium tests pass |
| Security | `npm audit --omit=dev --audit-level=high` | exit 0 |

## Scope

**In scope**:

- `package.json`, `package-lock.json`
- Prettier config and ignore files (create)
- `eslint.config.mjs`
- `vitest.config.ts`
- `playwright.config.ts` (create)
- `tests/e2e/**` (create)
- small app test hooks/fixtures only when semantic selectors are insufficient
- `.github/workflows/ci.yml`
- existing source files that still emit warnings after Plan 005
- `next.config.js` only for testable security/header behavior

**Out of scope**:

- Visual redesign or snapshotting every pixel.
- Real provider calls in CI.
- Field Core Web Vitals/Search Console; those require production data.
- A hard Lighthouse score until a repeatable baseline is collected.
- Lowering strict TypeScript or ESLint rules to pass.

## Git workflow

- Branch: `codex/006-quality-gates`
- Keep the mechanical formatting commit separate from behavior/test commits.
- Suggested commits:
  `style: apply repository formatter`,
  `test(e2e): cover critical browser flows`, and
  `ci: enforce frontend quality gates`.
- Target `development`; do not push without operator approval.

## Steps

### Step 1: Create one deterministic local quality command

Add scripts:

- `format` and `format:check` using Prettier with the repository's documented
  style;
- `typecheck` -> `tsc --noEmit`;
- `test:unit` -> current Vitest run;
- `test:e2e` -> Playwright;
- `check:dead-code` -> Knip;
- `check` -> format check, lint, typecheck, unit, dead code in fail-fast order.

Change lint to `eslint . --max-warnings 0`. Fix remaining warnings rather than
disabling a rule globally. If TanStack Virtual still triggers
`react-hooks/incompatible-library`, add a narrow inline/config override for the
specific call with a comment linking the compatibility rationale; do not disable
the rule repo-wide. Replace remote/raw `<img>` only when Next Image supports the
source safely; otherwise document a narrow lint exception with dimensions,
loading, and alt behavior.

Configure Prettier for double quotes, semicolons, two spaces, trailing commas,
and 100 columns. Apply it once in a standalone mechanical commit after the
cleanup phase. Exclude generated `.next`, coverage, build, and plan artifacts as
appropriate; do not ignore source files to avoid formatting them.

**Verify**: run `npm run check` twice. Both runs exit 0 and the second creates no
diff.

### Step 2: Keep unit tests fast and broaden pure boundary coverage

Retain Node as the default Vitest environment. Add explicit include globs for
the surviving pure hooks/controllers/server parsers added in Plans 001–004, but
do not turn every React page into a jsdom unit test. Fix the Vitest configuration
warning observed at baseline and remove unused Vite React plugins if no test
needs them.

Add/retain named regression tests for:

- server-safe storage and fallback exceptions;
- dependency/provider response validation and stable public error codes;
- rate cache expiry/deduplication/stale-response guard;
- worker timeout/error/no-sync-fallback;
- error/observability redaction;
- registry availability and sitemap inclusion rules;
- password character guarantees and memorable-mode behavior.

**Verify**: `npm run test:unit` passes with no unhandled-rejection, config, or
browser-global warning.

### Step 3: Add a production-oriented Playwright smoke suite

Install `@playwright/test` as a development dependency and configure Chromium.
Use the already-built app through `npm start` in CI, not live third-party APIs.
Set a fixed base URL, trace/screenshot on first retry, one CI retry, and bounded
timeouts. Intercept rate/text/GitHub requests with deterministic fixtures where
the server boundary is not already cached/mocked.

Create registry-driven smoke coverage for every available canonical route:

- response/document reaches one meaningful H1;
- no `Oops!`, Next error overlay, uncaught page error, console error, hydration
  mismatch, or failed local asset;
- title/canonical exist and robots behavior matches availability;
- unavailable routes do not expose unfinished UI;
- direct hard refresh works, not only client navigation.

Allowlist only known harmless development messages; because tests run a
production server, the expected console-error allowlist should normally be
empty.

**Verify**: deliberately break the contributor image path locally and confirm
the smoke test fails, then restore it and confirm the suite passes. Do not commit
the deliberate break.

### Step 4: Automate the critical interaction regressions

Add focused tests, using semantic roles/labels rather than CSS selectors:

1. **Theme hydration**: preseed light/dark/system storage, hard-refresh, assert
   the selected radio and no hydration console error.
2. **Persisted editors**: enter data in JSON/Markdown/regex, refresh, assert data
   restores and the app stays responsive.
3. **Regex timeout**: enter a known pathological pattern/input through the UI,
   assert a timeout/unavailable state appears while a separate button remains
   clickable. Never run the regex in Playwright's Node test process.
4. **Rate race**: delay pair A, return pair B immediately, then release A;
   assert B remains visible. Change amount repeatedly and assert no extra pair
   request.
5. **Contribute fallback**: simulate GitHub failure; H1/actions/founder still
   render without an error boundary.
6. **Text action**: mock success, rate limit, and timeout; assert safe messages
   and no prompt appears in browser console.
7. **WIP**: direct SQL/music/game URLs show WIP/404 with `noindex`, never the
   hidden implementation.

**Verify**: `npm run test:e2e` passes three consecutive local runs without a
flake. Fix timing by waiting on user-visible state/network events, not sleeps.

### Step 5: Add a small automated accessibility layer

Install `@axe-core/playwright` and run WCAG 2.2 A/AA checks on homepage,
catalog, password, currency, Markdown, regex, contribute, privacy, and the error
state. Fail on serious/critical violations at minimum; record and schedule any
lower-severity baseline issue rather than silently excluding whole rules.

Also assert keyboard behavior that axe cannot prove: skip link moves focus to
main, command menu opens/closes and traps/restores focus, every icon-only button
has a name, tool fields have labels, focus is visible, and reduced-motion media
preference disables repeating/large transforms.

**Verify**: accessibility tests pass in normal and reduced-motion projects.

### Step 6: Gate CI in useful failure order

Update CI to:

1. checkout and setup the supported Node version with npm cache;
2. `npm ci`;
3. format check, lint, typecheck, unit, and Knip;
4. production build once with external source-map upload disabled;
5. install the pinned Playwright Chromium binary and run E2E against
   `npm start`;
6. run high-severity production dependency audit in a separate clearly named
   step/job so registry outages are distinguishable from code failures.

Cache only npm/Playwright artifacts safe for the lockfile. Upload Playwright
trace/screenshots only on failure and give artifacts a short retention. Avoid
duplicating the build in Playwright's `webServer` when CI already built it.

**Verify**: the workflow passes on the branch, then locally introduce one type
error, one lint warning, and one broken route separately to prove the relevant
step fails; revert each test mutation before commit.

### Step 7: Record performance baselines without premature gates

Capture build route output and browser measurements for `/`, `/tools/password`,
`/tools/json`, `/tools/markdown`, and `/tools/snippet-generator`: JS transfer,
largest contentful paint, cumulative layout shift, and interaction latency on a
fixed emulated mobile profile. Store a concise baseline in project docs, not
generated profiler output.

If a large regression is already evident, create a follow-up issue with the
route/chunk/import chain. Do not set a Lighthouse CI threshold until three
repeatable runs establish normal variance. After that, gate budgets relative to
the measured baseline, not a generic score of 100.

**Verify**: baseline document includes date, commit, tool/version, device/network
profile, median of three runs, and named follow-ups.

## Test plan

- Unit tests stay network-free and deterministic with fake time/fixtures.
- E2E runs production output and intercepts provider variation.
- Route smoke list is generated from server-readable registry data or a checked
  static manifest, so adding an available route requires coverage.
- Accessibility uses axe plus manual-semantic assertions.
- CI mutation checks are performed locally and reverted.

## Done criteria

- [ ] `npm run check` is deterministic and lint allows zero warnings.
- [ ] Unit output has no config, server-global, or unhandled-promise warning.
- [ ] Every available route has production browser smoke coverage.
- [ ] Hydration, storage, regex, rate-race, contribute, text, and WIP
      regressions are automated.
- [ ] Critical routes pass serious/critical axe checks and keyboard assertions.
- [ ] CI gates format, lint, type, unit, dead code, build, browser, and high
      dependency advisories.
- [ ] Performance baseline is measured and documented without arbitrary gates.
- [ ] All commands pass and `plans/README.md` is updated.

## STOP conditions

- Browser tests require real paid/provider credentials. Replace the boundary
  with fixtures; do not add secrets to CI.
- A lint warning can only be removed by a repository-wide rule disable. Report
  the exact incompatibility and use the narrowest justified override.
- Production E2E cannot start from the built artifact without dynamic external
  configuration. Make the feature fail safely or inject non-secret fixtures;
  do not switch the whole suite to dev mode unnoticed.
- Accessibility remediation requires a visual/product decision beyond semantic
  equivalence; report the exact violation and affected flow.

## Maintenance notes

- A new route is not done until it is in route smoke and availability tests.
- Flaky tests are defects. Quarantine only with an issue, owner, and expiry date.
- Revisit performance budgets quarterly using field data when Search Console or
  Vercel Speed Insights becomes available.
