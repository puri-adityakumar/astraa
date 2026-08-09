# Plan 013: Launch a bounded SQL Formatter and remove unsafe hidden prototypes

> **Executor instructions**: Replace the SQL demonstrator; do not expose it.
> Delete the unmounted Music, Dino, and Snake prototypes while preserving their
> fail-closed public WIP routes/statuses. Install only the reviewed formatter
> dependency and load it on demand. Verify each subphase before changing SQL's
> registry status. Update `plans/README.md` after every launch gate passes.
>
> **Drift check (run first)**:
> `git diff --stat 94a1b1f -- app/tools/sql components/sql components/music components/games lib/games lib/tools.ts lib/seo knip.jsonc package.json package-lock.json docs tests/e2e`
> `git status --short -- app/tools/sql components/sql components/music components/games lib/games lib/tools.ts lib/seo knip.jsonc package.json package-lock.json docs tests/e2e`
> This plan assumes Plans 001–012 are complete in the worktree. Reconcile their
> intended registry, copy, docs, and test changes; STOP on unexplained drift.

## Status

- **Priority**: P2
- **Effort**: L
- **Risk**: MED
- **Depends on**: Plans 008–012
- **Category**: direction
- **Planned at**: commit `94a1b1f`, 2026-08-09

## Why this matters

SQL Formatter is the strongest coming-soon fit for Astraa's focused developer
utility positioning, but its hidden implementation performs global regex
replacements that can corrupt strings/comments and claims validation it does
not implement. Three other hidden prototypes are broken or introduce unresolved
external-media/privacy obligations while Knip treats them as intentional entry
points. This phase removes that false readiness signal and launches one bounded,
local, well-tested SQL formatter.

## Current state

- `/tools/sql` correctly renders a noindex WIP page and is excluded from the
  sitemap. `lib/tools.ts:182-189` marks SQL `coming-soon` and `local`.
- `components/sql/sql-formatter-client.tsx:20-41` collapses whitespace and runs
  chained keyword regex replacements. It can match inside strings/comments and
  replaces `JOIN` before `LEFT JOIN`.
- The same UI promises “Format and validate SQL queries” at lines 73-75, but no
  validation exists. Its labels and icon-only copy button also lack complete
  accessible relationships.
- The official `sql-formatter` project describes itself as a whitespace
  formatter, supports several dialects, explicitly excludes stored procedures
  and non-semicolon delimiter changes, is in maintenance mode, and is MIT:
  <https://github.com/sql-formatter-org/sql-formatter>.
- The reviewed upstream manifest on 2026-08-09 is version `15.8.2`, exports ESM
  and CJS, declares `sideEffects: false`, and uses MIT:
  <https://raw.githubusercontent.com/sql-formatter-org/sql-formatter/master/package.json>.
- Next.js supports loading a client-side external library on demand with
  `import()`:
  <https://nextjs.org/docs/app/guides/lazy-loading>.
- `knip.jsonc:11-14` exempts hidden Dino, Memory, Snake, Music, and SQL clients.
- Music hotlinks a Pinterest GIF and third-party audio, ignores `audio.play()`
  rejection, and has no approved data/media-rights boundary
  (`components/music/player.tsx:16-23,49-54,100`).
- Dino cannot start on its first Space/click, its jump/collision math cannot
  clear the obstacle, and its default mode embeds a third-party “Chrome Dino”
  page (`lib/games/dino/useDinoGame.ts:18-37,52-82`,
  `components/games/dino-client.tsx:12,25-56`).
- Snake checks the current tail before removing it, can place food on the snake,
  and recreates its interval after every tick (`useSnakeGame.ts:28-81,124-127`).
- Memory remains the sole hidden game candidate for Plan 014; do not delete it here.

## Bounded SQL v1 contract

**Include**:

- local formatting for Basic SQL, PostgreSQL, MySQL/MariaDB, SQLite, SQL Server,
  and BigQuery (map each label to an upstream language ID and test it);
- keyword case (preserve/upper/lower), 2- or 4-space indentation;
- format, copy, clear; original input never overwritten automatically;
- input cap `MAX_SQL_BYTES = 100 * 1024` (102,400 UTF-8 bytes), displayed as
  “100 KB” consistently;
- visible parse/unsupported-syntax error and exact upstream limitations;
- on-demand formatter import after the user requests formatting.

**Exclude**:

- query execution, database connections, schema awareness, semantic validation,
  linting, autocomplete, persistence, CodeMirror, uploads, stored procedures,
  custom delimiters, or dialects not explicitly tested/advertised.

“Formatting succeeded” means the formatter returned output; it is not proof the
query is safe, semantically valid, executable, or optimized.

## Commands you will need

| Purpose | Command | Expected on success |
|---|---|---|
| Install reviewed dependency | `npm install --save-exact sql-formatter@15.8.2` | manifest and lockfile record the exact reviewed version |
| SQL unit tests | `npm test -- lib/sql` | all SQL cases pass |
| Full quality | `npm run check` | exit 0; no obsolete Knip exceptions |
| Production artifact | `npm run build:e2e -- --webpack` | `/tools/sql` builds indexable |
| SQL browser tests | `npm run test:e2e -- --grep "SQL|sql"` | interaction/SEO/a11y tests pass |
| Full browser suite | `npm run test:e2e` | all projects pass |

## Suggested executor toolkit

- Load all three `astraa-*` skills.
- Recheck the upstream manifest/release before installation. If current package
  metadata or licensing differs from the reviewed facts, STOP rather than
  silently upgrading.

## Scope

**In scope**:

- `app/tools/sql/page.tsx`
- replace `components/sql/sql-formatter-client.tsx`; add focused subcomponents only if useful
- new `lib/sql/**` and unit tests
- `lib/tools.ts`, `lib/tools.test.ts`
- `lib/seo/tool-guides.ts` and tests
- `components/tool-guide.tsx` types only as required by SQL availability
- `package.json`, `package-lock.json`, `knip.jsonc`
- delete `components/music/**`
- delete `components/games/dino-client.tsx`, `lib/games/dino/**`
- delete `components/games/snake-client.tsx`, `lib/games/snake/**`
- update factual prototype notes in `docs/ARCHITECTURE.md`
- relevant `tests/e2e/**` and performance documentation if measured

**Out of scope**:

- Deleting or launching the public Music, Dino, Snake, Pacman, Sudoku, Word
  Search, or 2048 WIP routes/registry entries.
- Deleting/replacing Memory; Plan 014 owns its clean rewrite.
- A streaming Music feature. A separate local Focus Timer is a future product decision.
- Formal trademark/copyright conclusions for planned game names.
- Adding a GPL formatter or database/parser backend.
- Updating the external Notion Roadmap without operator authorization.

## Git workflow

- Suggested branch: `codex/013-sql-launch`
- Suggested commits:
  `refactor(wip): remove unsafe hidden prototypes` and
  `feat(sql): launch local formatter`.
- Do not push, deploy, or open a PR unless asked.

## Steps

### Step 1: Remove hidden prototypes without changing public availability

Delete the unmounted Music component tree, Dino client/logic/types, and Snake
client/logic/types. Remove only their Knip entry exemptions. Preserve each
route's route-specific `WorkInProgress`, noindex metadata, registry item, and
noninteractive catalog card.

Update `docs/ARCHITECTURE.md` so it no longer claims all hidden prototypes are
preserved follow-up entry points. Document that incomplete public ideas remain
fail-closed and implementation code is added only within a committed launch plan.

Do not delete Memory or the SQL file yet; they are the two committed candidates.

**Verify**:

- `rg -n 'LofiStudioClient|MusicPlayer|Pomodoro|TodoList|DinoClient|useDinoGame|SnakeClient|useSnakeGame' app components lib knip.jsonc docs`
  returns no matches;
- `npm run check:dead-code` exits 0;
- affected WIP paths still return 200, one route-specific H1, canonical, noindex.

### Step 2: Install and isolate the reviewed formatter

Before installation, inspect `npm view sql-formatter@15.8.2 version license
exports sideEffects` and compare it with the official manifest above. Install
exactly `15.8.2` with `--save-exact`; do not save a caret/tilde or use an
unbounded latest range.

Create `lib/sql/types.ts` for Astraa's small dialect/options contract and
`lib/sql/formatter.ts` as the only wrapper around upstream. Make formatting
asynchronous so `import("sql-formatter")` occurs after the user requests it.

Validate UTF-8 byte length before importing. Map only the six advertised
dialects. Return a discriminated result for success, oversized input, and
parse/unsupported syntax; do not leak stack traces or call parse failure
“invalid SQL.” Preserve the original input in every result.

**Verify**: production network/resource tests show no SQL formatter chunk loaded
on initial route load and one lazy chunk after Format.

### Step 3: Build pure boundary tests before the UI

Unit-test at least:

- SELECT/FROM/WHERE and nested queries;
- keywords inside single/double/backtick/bracketed identifiers as applicable;
- line/block comments containing SQL words;
- `LEFT JOIN`, multiple statements, semicolons;
- `?`, `$1`, and named placeholders where supported;
- all six advertised dialect IDs and options;
- stored procedure/custom-delimiter limitation as a surfaced error/non-goal;
- empty/whitespace input;
- exactly 102,400 UTF-8 bytes and 102,401 bytes using ASCII and non-ASCII input;
- upstream throw converted to a safe result;
- input unchanged when output succeeds or fails.

Do not snapshot a large formatter output corpus; assert the load-bearing pieces
and exact fixtures for known corruption regressions.

**Verify**: `npm test -- lib/sql` passes all named cases.

### Step 4: Replace the SQL client with the standard tool layout

Build a focused accessible client using existing UI primitives:

- one H1 and concise local-processing disclosure;
- labelled input and read-only formatted output;
- labelled dialect, keyword-case, and indentation controls;
- Format primary action, Copy and Clear secondary actions;
- empty, importing/formatting, success, expected parse/unsupported, oversized,
  and unexpected-error states;
- polite success/output status and focused error summary for actionable failures;
- 44 px targets, keyboard operation, no horizontal overflow at 320 px;
- error helpers/logging only for unexpected failures—user parse errors should
  not create noisy telemetry.

Never overwrite the source textarea. Do not render untrusted HTML.

**Verify**: component/E2E tests reproduce a formerly corrupting quoted-keyword
fixture and show preserved input plus correct output.

### Step 5: Turn the route into an available, indexable tool

Update `app/tools/sql/page.tsx` to render the SQL client, `<ToolGuide
toolId="sql" />`, and `<RelatedTools toolId="sql" />`. Replace planned/noindex
metadata with concise accurate metadata and one canonical.

Change SQL's registry status to `available`; keep processing `local`, remove any
“validation” claim, and ensure related IDs are available. Add a complete unique
guide with supported dialects/options, local boundary, 100 KB cap, and explicit
non-validation/stored-procedure/custom-delimiter limits.

Update count and guide invariants rather than hard-coding a new total in many
components. The sitemap, command menu, Tools, Explore, homepage, related links,
and accessibility route list should react to registry availability.

**Verify**:

- `/tools/sql` returns 200, is indexable/canonical, and appears once in sitemap;
- no WIP/`noindex` remains on the route;
- catalog/command menu link to it; available/processing counts are correct;
- built HTML contains its guide and related links.

### Step 6: Check bundle, latency, and main-thread behavior

Measure initial SQL route JS before any interaction and the lazy chunk after
Format. The dependency exceeds the project's “review heavy dependencies”
threshold unless proven otherwise, so it must not enter global/home bundles.

With 4× CPU throttling, format representative 10 KB and 100 KB queries. Target
under 100 ms for 100 KB; if representative maximum input exceeds 100 ms or
causes a long task, STOP and move the wrapper to a Web Worker before launch.

**Verify**: homepage initial JS does not grow attributable to SQL; initial SQL
load omits the formatter chunk; measured max input meets the threshold or uses a
tested worker.

### Step 7: Run launch-quality browser coverage

Test desktop/mobile, keyboard, dark/light, reduced motion, axe, direct refresh,
and no console/hydration errors. Cover:

- empty Format disabled;
- dialect/option change;
- successful format and copy with clipboard fixture;
- quoted/comment preservation regression;
- parse/unsupported error without source loss;
- 100 KB cap;
- lazy-load failure rendered through a safe retryable error.

**Verify**: targeted SQL, full quality, E2E build, and full Playwright pass.

## Test plan

- `lib/sql` unit tests cover corruption regressions, dialects/options, limits,
  failure mapping, and input immutability.
- E2E covers full accessible workflow, errors, responsive/reduced motion,
  metadata/sitemap/catalog activation, lazy loading, and diagnostics.
- Knip proves deleted prototype code no longer needs exceptions.
- Performance sampling proves the formatter is not in initial global/home JS.

## Done criteria

- [ ] Music, Dino, and Snake hidden prototypes and Knip exemptions are gone; WIP routes remain closed.
- [ ] SQL uses reviewed `sql-formatter@15.8.2` behind one typed lazy wrapper.
- [ ] The six advertised dialects/options and 100 KB boundary are tested.
- [ ] SQL never claims semantic validation or overwrites source input.
- [ ] `/tools/sql` is available, indexable, guided, related, accessible, and in sitemap.
- [ ] Formatter code is absent from initial home/SQL load and meets the main-thread threshold.
- [ ] Full quality/build/browser gates pass and Plan 013 is `DONE`.

## STOP conditions

Stop and report if:

- Upstream version/license/exports differ from the reviewed package.
- Required syntax is outside the package's documented support or formatting corrupts a fixture.
- A product requirement expands into execution, DB connectivity, or semantic validation.
- The formatter loads in global/home initial JS or exceeds 100 ms at the bounded maximum without a worker.
- Deleting a hidden prototype changes a public route or removes approved user data.
- Full verification fails twice after focused fixes.

## Maintenance notes

- Upstream is in maintenance mode. Keep the Astraa wrapper small and retest
  fixtures before any upgrade; do not swap to a differently licensed successor
  casually.
- Music, Dino, and Snake remain product ideas only. Any revival starts from a
  fresh spec and implementation, not deleted code recovery.
- Plan 014 is the sole next game launch candidate; leave its one Knip exemption
  until that plan replaces the hidden implementation.
