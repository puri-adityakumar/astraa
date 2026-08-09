# Plan 001: Stabilize server/client rendering and unavailable routes

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving on. If a
> STOP condition occurs, stop and report; do not improvise. When done, update
> this plan's row in `plans/README.md`.
>
> **Drift check (run first)**:
> `git diff --stat 94a1b1f..HEAD -- app/layout.tsx app/sitemap.ts app/tools app/games components/theme-toggle.tsx components/contribute/contribute-client.tsx lib/stores/storage.ts components/wip.tsx components/password/password-generator.tsx lib/tools.ts lib/games.ts next.config.js app/globals.css`
> If an in-scope file changed, compare the current-state notes below with the
> live code. A material mismatch is a STOP condition.

## Status

- **Priority**: P1
- **Effort**: M
- **Risk**: MED
- **Depends on**: none
- **Category**: bug
- **Planned at**: commit `94a1b1f`, 2026-08-08

## Why this matters

Several public routes currently render an error boundary or log server/client
boundary failures. These are correctness issues, not cosmetic cleanup: an
indexable route is an error page, persisted editor stores touch browser globals
on the server, and theme markup hydrates inconsistently. This phase makes route
rendering deterministic before security, caching, and SEO changes build on it.

## Current state

- `components/contribute/contribute-client.tsx:113-119` renders a remote
  `next/image` from `github.com`; `next.config.js:4` declares no allowed remote
  patterns. `/contribute` therefore renders `app/error.tsx` in development.
- `components/theme-toggle.tsx:21-54` derives `aria-checked` from a timer-based
  hydration flag and `next-themes`. The rendered audit reproduced server
  `aria-checked="false"` versus client `true`.
- `app/layout.tsx:86-90` suppresses hydration warnings on both `<html>` and
  `<body>`, which can mask unrelated mismatches. `next-themes` may require the
  root `<html>` suppression for its class mutation; the body suppression should
  not be necessary.
- `lib/stores/storage.ts:85-110` returns `LocalStorageAdapter` whenever
  IndexedDB is unavailable, including server rendering. Its methods dereference
  `localStorage` unconditionally. The dev server logged
  `localStorage.getItem is not a function` on persisted editor routes.
- `components/wip.tsx:8-11` exposes incomplete children unless
  `NEXT_PUBLIC_ENV` equals the exact string `prod`. Missing or misspelled
  configuration therefore fails open.
- `components/password/password-generator.tsx:35-57,203-209` renders a
  `fullWords` toggle, but generation receives only `memOptions.capitalize`.
  Toggling it has no effect.
- `app/globals.css:86` enables smooth scrolling, while the root HTML element
  does not declare Next.js's `data-scroll-behavior="smooth"` marker, producing a
  dev warning.

Project constraints:

- Follow the server-page to client-component pattern in `AGENTS.md`.
- Preserve semantic controls, 44px touch targets, reduced-motion behavior, and
  double-quoted/semicolon TypeScript formatting.
- Do not broadly suppress hydration warnings to make the console quiet.

## Commands you will need

| Purpose | Command | Expected on success |
|---------|---------|---------------------|
| Unit tests | `npm test` | 42 existing files plus new tests pass |
| Typecheck | `npx tsc --noEmit` | exit 0, no errors |
| Lint | `npm run lint` | exit 0; no new warnings |
| Build | `ASTRAA_DISABLE_SENTRY_SOURCE_MAPS=true npm run build -- --webpack` | exit 0; no `localStorage` warning |

## Scope

**In scope**:

- `next.config.js`
- `app/layout.tsx`
- `app/globals.css`
- `components/theme-toggle.tsx`
- `components/contribute/contribute-client.tsx`
- `lib/stores/storage.ts`
- `lib/stores/storage.test.ts` (create)
- `components/wip.tsx`
- WIP tool/game page modules that currently wrap `WorkInProgress`
- `lib/tools.ts`, `lib/games.ts`, and `app/sitemap.ts` only for the typed
  availability boundary
- `lib/tools.test.ts` (create) or the nearest existing registry test
- `components/password/password-generator.tsx`
- `lib/password/password-utils.ts` and its test only if the product explicitly
  keeps and defines a non-full-word mode

**Out of scope**:

- Contributor-fetch caching; Plan 003 owns it.
- Telemetry/error-boundary redesign; Plan 004 owns it.
- Implementing SQL, music, or any game.
- Rebranding or visual redesign.

## Git workflow

- Branch: `codex/001-stable-runtime-boundaries`
- Conventional commits, for example
  `fix(runtime): stabilize hydration and browser storage`.
- PR target: `development`; do not push or open a PR without operator approval.

## Steps

### Step 1: Repair the `/contribute` image boundary

Add the narrowest `images.remotePatterns` entry in `next.config.js` needed for
the founder image, with protocol `https`, hostname `github.com`, and the exact
pathname `/puri-adityakumar.png`. Do not add a wildcard for arbitrary hosts.
Alternatively, if a suitable tracked local founder image already exists at
execution time, switch the component to that local asset and avoid the remote
pattern entirely. Preserve explicit width, height, and alt text.

Remove the unused inline `Funnel Display` family at
`components/contribute/contribute-client.tsx:50`; the active design system uses
Geist and the tracked Funnel font is not loaded.

**Verify**:

- `npm run build -- --webpack` exits 0.
- In a clean browser session, `http://localhost:3000/contribute` has H1
  `Contribute to astraa`, not `Oops!`.
- The browser console contains no `Invalid src prop` error.

### Step 2: Make persisted storage explicitly SSR-safe

Add a `NoopStorageAdapter` whose async reads return `null` and whose writes and
removes resolve without touching a global. Change `createEnhancedStorage()` to
select adapters in this order:

1. server/no `window` -> no-op adapter;
2. browser with IndexedDB -> IndexedDB adapter;
3. browser without IndexedDB but with working localStorage -> localStorage;
4. browser without either -> no-op adapter.

Guard the IndexedDB adapter's fallback too; it must not assume localStorage is
available or writable. A quota/security exception should be handled through a
single safe fallback helper, not trigger a second unguarded exception. Keep the
per-key serialization in `createZustandStorage()`.

Create `lib/stores/storage.test.ts`. Stub browser globals per test and cover:
server read/write/remove, localStorage selection, localStorage exception,
IndexedDB-unavailable fallback, and operation ordering for the same key. Restore
globals after every test.

**Verify**: `npm test -- lib/stores/storage.test.ts` exits 0 and the test output
contains no `localStorage` warning.

### Step 3: Make theme markup stable through hydration

Replace the zero-timeout mount flag with a deterministic server snapshot. A
small `useClientMounted()` built with `useSyncExternalStore` is preferred:
server snapshot `false`, client snapshot `true`, and a stable no-op subscribe
function. Until mounted, render the same three controls and keep every
`aria-checked` false; after mounting, derive the active control from `theme`.
Do not render an entirely different tree on the server.

Remove `suppressHydrationWarning` from `<body>` in `app/layout.tsx`. Keep it on
`<html>` only if required by `next-themes`. Add
`data-scroll-behavior="smooth"` to `<html>` because `app/globals.css` enables
smooth scrolling.

**Verify**: with a previously persisted dark theme, hard-refresh `/`,
`/tools/markdown`, and `/tools/regex`. The selected dark control becomes active
after mount, but the console contains no hydration mismatch or smooth-scroll
warning.

### Step 4: Make incomplete routes fail closed

Replace the public environment-string check in `WorkInProgress` with an
explicit server-owned availability decision. The source of truth must be the
tool/game registry's `comingSoon` field, not a client-visible environment name.
For direct access to unavailable routes, prefer a server page that exports
`robots: { index: false, follow: false }` and renders the WIP view or calls
`notFound()`. Missing configuration must never reveal unfinished children.

Keep the implementation small: this step does not build the unavailable tools.
Add or update a pure registry test that asserts every `comingSoon` route is
excluded from the sitemap and cannot be treated as available by the list UI.

**Verify**: start the app without `NEXT_PUBLIC_ENV`; direct visits to SQL,
music, and a game route do not expose their unfinished client implementation.

### Step 5: Remove the inert password control

Unless a product specification defines what “not full words” means, delete the
`fullWords` state and switch. Keeping a control whose outcome is undefined is
worse than a smaller honest UI. If the operator supplies an explicit behavior,
implement it in the pure password utility first and add deterministic
property-level tests before wiring the switch.

**Verify**:
`rg -n "fullWords|fullwords" components/password lib/password` returns no
matches when the control is removed, and `npm test -- lib/password` passes.

## Test plan

- New `lib/stores/storage.test.ts` tests the exact server-global regression and
  browser fallback cases.
- Add a pure availability/sitemap test in the nearest registry test file; if no
  registry test exists, create `lib/tools.test.ts`.
- Manually hard-refresh dark and light themes to cover hydration; Plan 006 will
  automate this in a browser suite.
- Manually exercise `/contribute` and every `comingSoon` direct route.
- Run the complete unit, type, lint, and build commands before completion.

## Done criteria

- [ ] `/contribute` renders its intended H1 and no image configuration error.
- [ ] Server rendering never calls `localStorage` or IndexedDB.
- [ ] Theme hard refresh emits no hydration warning in light, dark, or system
      mode.
- [ ] Missing `NEXT_PUBLIC_ENV` cannot expose WIP implementations.
- [ ] The password UI has no inert “Full words” control.
- [ ] `npm test`, `npx tsc --noEmit`, lint, and production build exit 0.
- [ ] No file outside this plan's scope is modified.
- [ ] The status row in `plans/README.md` is updated.

## STOP conditions

- The contributor image has moved to an untrusted/user-controlled hostname.
- Making storage SSR-safe requires changing persisted schemas or deleting user
  data; that belongs in a separately reviewed migration.
- A `comingSoon` route is intentionally public for a documented preview program;
  report that route instead of hiding it by assumption.
- The hydration warning persists after body suppression is removed and the
  theme control uses a stable server snapshot; capture the exact component
  stack before proceeding.

## Maintenance notes

- Reviewers should test with existing persisted editor documents and each theme,
  not only an empty browser profile.
- Do not turn the narrow image allowance into a general wildcard later.
- Registry availability becomes an SEO dependency in Plan 007; keep it typed
  and server-readable.
