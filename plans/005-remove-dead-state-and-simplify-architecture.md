# Plan 005: Remove dead state, speculative runtime work, and unused modules

> **Executor instructions**: Cleanup must be evidence-driven. Generate the
> dead-code report, classify every deletion, and make small verified batches.
> Never delete a file merely because one tool reports it unused. Update
> `plans/README.md` after all gates pass.
>
> **Drift check (run first)**:
> `git diff --stat 94a1b1f..HEAD -- app/layout.tsx middleware.ts app/api/stats components lib/stores lib/activity-tracker.tsx lib/tools-context.tsx lib/redis.ts hooks package.json package-lock.json docs CLAUDE.md AGENTS.md public/fonts`
> Plans 001–004 will legitimately change some paths. Reconcile their current
> state first; unaccounted drift is a STOP condition.

## Status

- **Priority**: P2
- **Effort**: L
- **Risk**: MED
- **Depends on**: Plans 001, 002, 003, and 004
- **Category**: tech-debt
- **Planned at**: commit `94a1b1f`, 2026-08-08

## Why this matters

The root currently performs fake activity work every three seconds and wraps a
static registry in mutable context. Separate persisted stores collect partial,
inconsistently keyed usage data that no UI reads. The repository also contains
orphan components and heavy UI dependencies. Removing confirmed dead paths
shrinks the client graph and makes future refactoring decisions visible rather
than burying them under speculative abstractions.

## Current state

- `app/layout.tsx:147-168` mounts `ToolsProvider` and `ActivityProvider` around
  every page.
- `lib/activity-tracker.tsx:38-88` generates random locations/users and
  `lib/activity-tracker.tsx:107-142` starts an interval every three seconds.
  `useActivity` has no production consumer.
- `lib/tools-context.tsx:13-49` copies static registries into React state.
  Nothing calls `updateTools` or `updateCategories`; its missing-provider guard
  is unreachable because the context has a non-null default.
- The only `useTools` consumers are `components/command-menu.tsx`,
  `components/tools/tools-client.tsx`, and
  `components/explore/explore-client.tsx`; each can import the registry directly.
- `lib/stores/user-preferences.ts`, `activity-tracking.ts`, `migration.ts`, and
  `provider.tsx` are not mounted by the app.
- `lib/stores/tool-settings.ts` is written by only five tools, with inconsistent
  IDs (`base64`, `regex-tester`, and `/tools/...`). No production component
  reads counts or last-used values. Persisted `Date` fields also deserialize as
  strings, making date comparisons unsafe.
- Active editor stores (`json-editor.ts`, `markdown-editor.ts`,
  `regex-tester.ts`, `snippet-generator.ts`) do use Zustand persistence and must
  remain.
- `middleware.ts`, `lib/redis.ts`, `app/api/stats/route.ts`, and
  `components/home/stats-bar.tsx` form a visitor/stats pipeline whose only UI
  component is not mounted. The middleware still runs on first homepage visits
  and logs Redis failures when configuration is absent.
- Credible orphan candidates from the import graph include
  `hooks/use-error-toast.ts`, `components/animations-showcase.tsx`,
  `components/error-boundary.tsx`, `components/search-filter.tsx`,
  `components/colors/color-display.tsx`,
  `components/image/transform-controls.tsx`,
  `components/password/password-options.tsx`, and
  `lib/animations/presets.ts`. Confirm each after prior plans land.
- More than 30 `components/ui/*` modules have no current importer. One candidate,
  `components/ui/pixel-blast.tsx`, is about 700 lines and is the apparent reason
  for `three`/`postprocessing`. Some primitives may be intentional inventory.
- `public/fonts/FunnelDisplay-SemiBold.ttf` was not referenced at audit time;
  Plan 001 removes the only inline family declaration.
- Tooling packages and `@types/*` live under production `dependencies`
  (`package.json:57-63,70-71,101,104`) instead of `devDependencies`.

## Commands you will need

| Purpose | Command | Expected on success |
|---------|---------|---------------------|
| Import/use search | `rg -n "<symbol>" app components lib hooks` | only reviewed matches |
| Dead-code report | `npx knip` | exit 0 after reviewed ignore list |
| Unit tests | `npm test` | all pass |
| Typecheck | `npx tsc --noEmit` | exit 0 |
| Lint | `npm run lint` | exit 0, fewer warnings than baseline |
| Build | `ASTRAA_DISABLE_SENTRY_SOURCE_MAPS=true npm run build -- --webpack` | exit 0 |

## Scope

**In scope**:

- `app/layout.tsx`
- `components/command-menu.tsx`
- `components/tools/tools-client.tsx`
- `components/explore/explore-client.tsx`
- `lib/tools-context.tsx`
- `lib/activity-tracker.tsx`
- legacy files under `lib/stores/` listed above, while preserving active editor
  stores and `storage.ts`
- five tool components that write unused usage counters
- `middleware.ts`, `lib/redis.ts`, `app/api/stats/route.ts`
- `components/home/stats-bar.tsx`, `components/home/index.ts`
- confirmed orphan components/hooks/assets from the generated report
- `components/ui/*` only after classification
- `package.json`, `package-lock.json`, `knip.json` or `knip.config.ts`
- `AGENTS.md`, `CLAUDE.md`, `docs/API.md`, `docs/COMPONENTS.md`,
  `docs/DEVELOPMENT.md`, and `lib/stores/README.md` to remove obsolete
  architecture statements

**Out of scope**:

- Active JSON, Markdown, regex, and snippet Zustand stores or their user data.
- Implementing or deleting unfinished SQL/music/game features without a separate
  operator decision.
- Changing tool names/paths or public behavior.
- Replacing working UI primitives for visual consistency.
- Removing React/ReactDOM or a dependency used indirectly by framework config.

## Git workflow

- Branch: `codex/005-simplify-runtime-graph`
- Make reviewable commits per batch, for example:
  `refactor(state): remove unused global providers`,
  `chore(stats): remove unused visitor pipeline`, and
  `chore(deps): prune confirmed orphan dependencies`.
- Target `development`; do not push without operator approval.

## Steps

### Step 1: Replace static-registry context with direct imports

Update the command menu, tools catalog, and explore catalog to derive data
directly from `lib/tools.ts` and `lib/games.ts`. Keep filtering/mapping local and
pure; do not copy registry arrays into component state. Then remove
`ToolsProvider` from root layout and delete `lib/tools-context.tsx`.

If a consumer mutates the registry after Plan 001, stop and document that real
requirement. Do not recreate a context just to preserve the old API.

**Verify**:

- `rg -n "ToolsProvider|useTools|tools-context" app components lib` has no
  production matches.
- Catalog counts and command-menu items match the registry in a rendered check.

### Step 2: Remove simulated activity and unused persisted analytics

Remove `ActivityProvider` from layout and delete `lib/activity-tracker.tsx`.
Delete the unmounted preference/activity/provider/migration store stack after
confirming no post-Plan-004 consumer was introduced. Remove obsolete exports and
types that become unused, but keep editor-store types.

Remove `updateToolUsage` calls from Base64, JSON, Markdown, regex, and snippet
components, then delete `tool-settings.ts` if no reader exists. Do not migrate or
erase users' old `tool-settings` IndexedDB key during this phase; leave stale
data harmlessly in place unless an explicit reset/migration feature already
owns cleanup.

**Verify**:

- `rg -n "ActivityProvider|useActivityTracking|useUserPreferences|useToolSettings|updateToolUsage|StoreProvider|migrateFromContextAPI" app components lib --glob '!**/README.md'`
  returns no production matches.
- Root layout has no random timer/state provider.
- Active editor persistence tests still pass.

### Step 3: Remove the unused visitor/stats pipeline

Delete the homepage visitor middleware/Proxy, unused stats API, Redis visitor
helper, and `StatsBar` export/component. Preserve `@upstash/redis` if Plan 002's
text-generation limiter uses it; otherwise remove it only after a dependency
search.

Update docs that claim `/api/stats` or demo activity is part of the architecture.
The footer's contributor data now comes from Plan 003's cached server helper and
must remain.

**Verify**:

- `rg -n "visitor_count|astraa_visited|/api/stats|StatsBar|REDIS_KEYS" app components lib middleware.ts 2>/dev/null`
  returns no matches.
- Loading `/` makes no visitor Redis request and logs no middleware deprecation.

### Step 4: Install and configure a reviewed dead-code detector

Add Knip as a development dependency and configure it for Next App Router,
Vitest, Sentry entry files, and worker entry points. The audit's import graph
falsely marked `lib/json/parse-worker.ts` and
`lib/regex-tester/redos-worker.ts` unreachable because they are loaded through
`new Worker(new URL(...))`; explicitly preserve/configure them. Also preserve
Next route conventions, instrumentation, and generated framework types.

Generate a report and classify each item in a temporary review checklist:

- `DELETE`: no runtime, config, test, doc, dynamic, or registry reference;
- `KEEP/ALLOWLIST`: intentional design-system inventory or convention entry;
- `FOLLOW-UP`: ambiguous ownership or planned feature.

Do not commit generated report noise. Add concise reasons to the permanent Knip
ignore list for every `KEEP` entry.

**Verify**: after deletions and allowlists, `npx knip` exits 0. It must not report
either worker entry or active Next/Sentry files.

### Step 5: Remove confirmed orphan files in small batches

Re-check and remove the named candidates only if the final report and `rg` both
show no consumer. For UI primitives, delete only those classified `DELETE`.
Specifically scrutinize `pixel-blast.tsx/css`, charts, calendar, carousel,
drawer, form, OTP, and other primitives that pull substantial dependencies.

After each logical batch, run typecheck and affected tests. If a file is kept as
intentional design-system inventory, document that status rather than leaving
the dead-code tool permanently noisy.

Delete the Funnel font asset only if `rg` confirms no CSS/font-loader/metadata
reference after Plan 001.

**Verify**: `npx knip`, typecheck, and build pass after all batches.

### Step 6: Prune and classify dependencies

Remove packages used only by deleted modules. Candidates to confirm include
`@hookform/resolvers`, `focus-trap-react`, and dependencies behind unused UI
primitives such as `three`, `postprocessing`, `recharts`, `react-day-picker`,
`input-otp`, `vaul`, `embla-carousel-react`, and `react-hook-form`.

Move build/test/type tooling to `devDependencies`: ESLint/config, TypeScript,
`@types/*`, Tailwind/PostCSS/Autoprefixer and build-only plugins. Keep genuine
runtime packages in `dependencies`. Do not remove `react-dom` just because no
source file imports it directly. Recreate the lock through normal npm install,
then prove `npm ci` is stable.

**Verify**:

- `npm ci` exits 0 without modifying the lock.
- `npx knip` reports no unused dependency.
- `npm ls --all` reports no invalid dependency.
- Full test, typecheck, lint, and build gates pass.

### Step 7: Synchronize architecture documentation

Update docs and project guidance so they no longer instruct contributors to use
deleted providers/stores/stats routes. Document the surviving pattern:
server page -> client component -> pure `lib/` logic; direct immutable registry
imports; focused editor stores only; server-owned remote resources.

Do not rewrite unrelated documentation. Ensure examples use current import paths
and double-quoted/semicolon style.

**Verify**:
`rg -n "ToolsContext|ActivityProvider|demo stats|/api/stats|UserPreferences|ActivityTracking" AGENTS.md CLAUDE.md docs lib/stores/README.md`
returns only intentional historical/migration notes, each explicitly labelled.

## Test plan

- Existing editor-store tests are the safety net for persistence files that must
  remain.
- Render `/`, `/tools`, `/explore`, command menu, and Footer after direct-import
  conversion; counts/links must match the registry.
- Run typecheck after each delete batch; run full build after dependency pruning.
- Plan 006 will add automated route and bundle regression gates.

## Done criteria

- [ ] Root layout mounts no fake activity or static-registry state provider.
- [ ] No unused tool-usage store/calls or visitor pipeline remains.
- [ ] Active editor persistence and worker entries remain functional.
- [ ] Knip has a reviewed, documented zero-noise result.
- [ ] Confirmed orphan files/assets and their exclusive dependencies are gone.
- [ ] Tooling is in devDependencies and clean `npm ci` is reproducible.
- [ ] Architecture docs match the surviving code.
- [ ] Tests, typecheck, lint, audit, and build pass; plan index is updated.

## STOP conditions

- A supposedly static registry is mutated by a real post-audit feature.
- A legacy store gained a visible consumer or contains user data the product
  promises to expose again. Document before removal.
- Knip cannot model a dynamic entry. Allowlist it with a reason; do not delete
  based on the false positive.
- Removing a dependency changes a public tool's behavior or production bundle
  cannot build from `npm ci`.
- The operator wants to preserve an incomplete implementation for imminent work.
  Keep it, attach an issue/owner, and exclude it explicitly rather than guessing.

## Maintenance notes

- Run Knip in CI only after its ignore list is stable; Plan 006 owns the gate.
- A new global provider must justify cross-route mutable state and have at least
  two real consumers.
- A new persisted field requires schema version, size cap, and migration tests.
