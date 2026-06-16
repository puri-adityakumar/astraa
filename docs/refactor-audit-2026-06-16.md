# Refactor Audit — astraa (post v2 monochrome overhaul)

**Date:** 2026-06-16 · **Branch:** `major-overhaul` · **Baseline commit:** `8ac7fe6`
**Method:** 3 parallel read-only explorers (UI overhaul / styling+config / lib+broader), then hand-verified every deletion and parity claim via `grep`. Findings marked **✓ verified** were confirmed against the tree; **⚠ reported** are from the explorer pass and need a 1-line check before acting.
**Scope:** structural refactors only — behavior-preserving. No feature changes. Anything that would alter rendered output is flagged `Risk: high`.

**Legend:** Effort `S`(<15m) `M`(~1h) `L`(half-day+) · Risk = chance of changing observable behavior.

---

## Priority summary

| # | Finding | Sev | Effort | Risk | Status |
|---|---------|-----|--------|------|--------|
| 1 | `--surface` alias redefined in 4 components (already global) | P0 | S | low | ✓ |
| 2 | `--border-strong` defined in `:root` only — missing in `.dark` | P0 | S | med | ✓ |
| 3 | `fadeInUp`/`stagger` motion variants re-declared in 7 components | P0 | M | low | ✓ |
| 4 | Orphaned components: `shimmer-button`, `floating-navbar` | P1 | S | low | ✓ |
| 5 | 8 dead Tailwind keyframe/animation entries | P1 | S | low | ✓ |
| 6 | 11 dead `@layer components` utility classes in globals.css | P1 | S | low | ✓ |
| 7 | Inconsistent error handling — raw `console.*` bypasses error-handler | P1 | M | med | ⚠ |
| 8 | Repeated section header/divider markup (label + hairline + h2) | P2 | M | low | partial ✓ |
| 9 | `migrateFromContextAPI` — 51-line dual-concern fn + `as any` | P2 | M | med | ⚠ |
| 10 | Random-id `Math.random().toString(36).substr(2,9)` ×4 (+ dep. `substr`) | P2 | S | low | ✓ |
| 11 | Scattered magic limits (slice 50/10/5, retention days) & store-key literals | P2 | S | low | ⚠ |
| 12 | Inline-`style` vs Tailwind-arbitrary strategy mixed within components | P2 | M | low | ✓ |
| 13 | `regex-tester/example-gen.ts` — 166-line nested state machine | P2 | L | high | ⚠ |
| 14 | `any` in Zustand migrate/forEach callbacks | P2 | M | med | ⚠ |
| 15 | Misc nits (logo double-import, BTN string style, variants factory, pixel-blast.css) | P3 | S | low | mixed |

---

## P0 — Critical (do first)

### 1. `--surface` alias redefined inside 4 components ✓ verified
Canonical definition lives in `app/globals.css:10` (`:root`) and `:68` (`.dark`). It is then re-injected via a component `<style>` block in:
- `components/navigation.tsx:165`
- `components/footer.tsx:178`
- `components/command-menu.tsx:14`
- `components/ui/floating-navbar.tsx:161`

**What:** four components ship `:root { --surface: hsl(var(--card)); }` that duplicates the global token. Any future change to the alias must be made in 5 places; the per-component `:root` blocks also re-declare a global selector from inside a subtree (smell).
**Fix:** delete the `:root { --surface … }` line from each `<style>` block — keep the hover/transition rules. Inline uses already carry the `var(--surface, hsl(var(--card)))` fallback, so this is pure cleanup. (`floating-navbar` is orphaned anyway — see #4.)
**Effort:** S · **Risk:** low (token remains globally defined).

### 2. `--border-strong` set in light `:root` only — absent from `.dark` ✓ verified
`app/globals.css:36` defines `--border-strong: 0 0% 25%;` inside `:root` (light block starts `:6`, `.dark` starts `:64`). `grep` finds **no** `--border-strong` in `.dark`.
**What:** the light value (`25%` lightness — a fairly dark line) cascades into dark mode unchanged, so dark-mode consumers of `--border-strong` get a token tuned for a white background. Likely a parity oversight from the overhaul (the spec lists `0 0% 25%` as the *light* value). Wherever `--border-strong` is consumed, dark mode currently inherits the light value.
**Fix:** add an explicit `--border-strong` to `.dark` with the intended dark value (a lighter gray reads as "strong" on a `4%` bg), **or** confirm the inherit is intentional and add a comment. Verify against the frozen spec token table.
**Effort:** S · **Risk:** med (changes dark-mode border appearance where used — that's the point; verify visually).

### 3. `fadeInUp` + `stagger` variants re-declared in 7 components ✓ verified
`lib/animations/variants.ts` already exports `fadeInUp` (`:26`), `staggerContainer` (`:159`), `staggerContainerFast` (`:173`), `staggerContainerSlow` (`:187`). Local copies (with drifting `y`/`duration`/`staggerChildren` values) exist in:
`components/home/hero-section.tsx`, `components/home/popular-section.tsx`, `components/home/principles-section.tsx`, `components/tools/tools-client.tsx`, `components/about/about-client.tsx`, `components/explore/explore-client.tsx`, `components/games/games-client.tsx`.
**What:** 7 near-duplicate variant pairs; values have already drifted (`y:20` vs `y:16`, `duration .5` vs `.4`, stagger `.1/.07/.06/.05`), so motion is subtly inconsistent across pages — the exact problem a shared module prevents.
**Fix:** import from `@/lib/animations/variants`. Where a page genuinely needs a different offset/timing, add a small parameterized factory to the variants module (see #15) rather than re-inlining. CLAUDE.md already mandates the shared variants — this realigns to it.
**Effort:** M · **Risk:** low if the shared values are matched; **note** motion timing will normalize (intended).

---

## P1 — High

### 4. Orphaned components — `shimmer-button`, `floating-navbar` ✓ verified
`grep` for importers (excluding self) returns nothing for either:
- `components/ui/shimmer-button.tsx` — only self `export`s; hardcodes `#10b981` (emerald) + `#a78bfa` (purple), i.e. the retired pre-v2 palette.
- `components/ui/floating-navbar.tsx` — zero consumers; also carries a duplicate `--surface` block (#1).
**What:** dead files. An explorer suggested re-tokenizing shimmer-button's hex colors — unnecessary, since nothing renders it.
**Fix:** delete both files (and `shimmer-button`'s `.css`/keyframes if any are exclusive to it — but see #5: `shimmer-slide`/`spin-around` keyframes ARE referenced *by* shimmer-button, so they die with it). Confirm once more with `grep -rn ShimmerButton\|FloatingNav` before removing.
**Effort:** S · **Risk:** low (no consumers).
**Knock-on:** once `shimmer-button` is gone, `animate-shimmer-slide` + `animate-spin-around` (#5) become dead too and can also be removed.

### 5. Dead Tailwind keyframes / animations ✓ verified
`tailwind.config.ts` animation block — confirmed **0 consumers** outside config/globals for:
`fade-in`, `fade-in-up`, `slide-in-bottom`, `slide-in-top`, `scale-in`, `spin-slow`, `pulse-slow`, `bounce-slow`.
**Keep:** `accordion-down/up` (accordion.tsx), `shimmer-slide` + `spin-around` (shimmer-button — but those go if #4 lands).
**Fix:** delete the 8 dead keyframe + animation entries.
**Effort:** S · **Risk:** low.

### 6. Dead `@layer components` utility classes in globals.css ✓ verified
Confirmed **0 consumers**: `card-mobile`, `card-elevated`, `btn-hover-lift`, `rounded-smooth`, `content-center`, `content-narrow`, `content-wide`, `touch-spacing`, `grid-responsive`, `section-spacing`, `reduce-motion` (11 classes).
**KEEP (explorer false-positive):** `.glass` (5 consumers incl. `app/error.tsx`) and `.glass-hover` (2) are **live** and documented in CLAUDE.md — do **not** delete.
**Fix:** remove only the 11 confirmed-dead classes.
**Effort:** S · **Risk:** low.

### 7. Inconsistent error handling — raw `console.*` bypasses error-handler ⚠ reported
Reported sites: `lib/api.ts:30`, `lib/openrouter.ts:59`, `lib/stores/migration.ts:106`, `lib/stores/storage.ts:45,62,79,144,152,159`.
**What:** network/storage/migration paths log via raw `console.error`/`console.warn` instead of `getUserFriendlyError()` + `logError()` (the project's sanitizing, Sentry-wired path per CLAUDE.md). `migration.ts` reportedly swallows JSON-parse failures.
**Fix:** route through `@/lib/error-handler`. **Caveat:** storage.ts runs inside the IndexedDB/localStorage adapter and the persistence lock — verify `logError` has no circular dependency on the store before wiring it in there.
**Effort:** M · **Risk:** med (changes what surfaces to user/telemetry).

---

## P2 — Medium

### 8. Repeated section header / divider markup — partial ✓
The "uppercase mono label + `w-[18px] h-px` hairline + `h2`" cluster repeats across `hero-section`, `tools-client` (verified in-context) and reportedly `popular-section:81-93`, `principles-section:57-70`. The bare divider `<span className="… w-[18px] h-px bg-foreground" style={{opacity:.55}} />` is copy-pasted with a hardcoded `0.55`.
**Fix:** extract `<SectionHeader label title />` (+ optional `<SectionDivider />`) into `components/ui/`; replace the literal `0.55` with a token/class.
**Effort:** M · **Risk:** low (single shared render path; diff screenshots after).

### 9. `migrateFromContextAPI` — dual-concern 51-line fn ⚠ reported
`lib/stores/migration.ts:58-108`, with `settings as any` cast.
**Fix:** split `migrateActivities()` / `migrateToolSettings()`, extract the shared parse→migrate→handle block, type the legacy shapes.
**Effort:** M · **Risk:** med (one-time startup path — test the upgrade flow explicitly).

### 10. Random-id duplication + deprecated `substr` ✓ verified
`Math.random().toString(36).substr(2,9)` at `lib/activity-tracker.tsx:57,92` and `lib/stores/activity-tracking.ts:23,64` (`markdown-editor.ts:36` uses the `.slice(2)` form).
**Fix:** add `generateId()` to `lib/utils.ts`, use `.slice(2,11)` (`substr` is deprecated), replace all 4 call sites.
**Effort:** S · **Risk:** low.

### 11. Scattered magic limits & store-key string literals ⚠ reported
Slice/limit literals (`50`, `10`, `5`, retention `30` days) across `activity-tracker.tsx`, `activity-tracking.ts`, editor stores; store keys (`'activity-tracking'`, `'tool-settings'`, `'user-preferences'`, …) hardcoded in `storage.ts` + `migration.ts`.
**Fix:** `lib/stores/constants.ts` with `STORE_KEYS` + named limits; import everywhere (esp. keep migration.ts in sync — a key typo there silently drops data).
**Effort:** S · **Risk:** low.

### 12. Inline-`style` vs Tailwind-arbitrary mixed within a component ✓ verified
`components/navigation.tsx` and `components/footer.tsx` express the same tokens both as inline `style={{ border: "1px solid var(--hairline)" }}` and (elsewhere) as `border-[color:var(--hairline)]` utilities.
**Fix:** pick one per component — prefer Tailwind-arbitrary for static token styling, reserve inline `style` for genuinely dynamic values. Mechanical, but touches a lot of lines; do it as its own commit.
**Effort:** M · **Risk:** low (verify hover/sticky states unchanged).

### 13. `regex-tester/example-gen.ts` — 166-line nested state machine ⚠ reported
`generateExample` `lib/regex-tester/example-gen.ts:62-227`: deep `inClass`/`groupAltDepth`/`skipGroup`/`alternationSeen` nesting, multiple `return null`.
**Fix:** extract `handleCharClass`/`handleGroup`/`handleAlternation`/`handleQuantifier`. **Risk: high — algorithmic.** Only attempt with the existing unit tests green before+after; if coverage is thin, add characterization tests first.
**Effort:** L · **Risk:** high.

### 14. `any` in Zustand migrate/forEach callbacks ⚠ reported
`activity-tracking.ts:198`, `migration.ts:69,94`, `tool-settings.ts:114`, `user-preferences.ts:86`.
**Fix:** type legacy versions (`LegacyActivityData`, …); remove casts. Conflicts with the strict `tsconfig` ethos.
**Effort:** M · **Risk:** med (over-strict validation could reject real legacy state — keep parsing permissive).

---

## P3 — Low / nits
- **`components/logo.tsx`** — imports `useReducedMotion` from `framer-motion` while using the project hook of the same name; drop the framer import (shadowing risk). `S/low` ⚠.
- **`hero-section.tsx:45-48`** — `BTN_BASE`/`BTN_GHOST` built via string concat while sibling files use `[...].join(" ")`/`cn()`. Standardize on `cn()`. `S/low` ✓.
- **`lib/animations/variants.ts`** (~304 lines) — ~20 variants repeat the same `{hidden,show,transition}` shape; a `createFadeVariant({x,y})` / `createSlideVariant(axis,dist)` factory cuts it ~half with identical output. Pairs naturally with #3. `M/low` ⚠.
- **`components/ui/tcard.tsx`** — `isHover?` prop reportedly unused; tag is stringly-typed (`"SOON"|"WIP"|"LOCAL"`) derived from booleans. Consider a `TagStatus` union. Verify call sites first. `S–M/med` ⚠.
- **`components/ui/pixel-blast.css` / `pixel-blast.tsx`** — reportedly orphaned (LandingBackground renders null). Verify then delete. `S/low` ⚠.
- **`!important` in `footer.tsx:180-184`, `command-menu.tsx`** — defensive specificity; tighten selectors. Keep `!important` only in `prefers-reduced-motion`/`sr-only`. `M/med` ⚠.
- **z-index `9999`** at `globals.css` skip-link — lone magic value; fine to leave, or define a tiny z-scale. `S/low`.

---

## Quick-wins batch (safe, behavior-preserving — one commit)
All ✓ verified, Risk: low. ~30-45 min total:
1. Delete the 4 duplicate `--surface` `:root` blocks (#1).
2. Delete orphaned `shimmer-button.tsx` + `floating-navbar.tsx` (#4).
3. Delete the 8 dead animations (#5) — plus `shimmer-slide`/`spin-around` once #4 lands.
4. Delete the 11 dead utility classes (#6) — **keep `.glass`/`.glass-hover`**.
5. `generateId()` helper, kill `.substr` ×4 (#10).
6. `logo.tsx` framer import (#13-nits).

→ then `npm run lint && npm test && npm run build`, screenshot home + tools in both themes (dead-CSS removal shouldn't move pixels — confirm it doesn't).

## Out of scope / deferred
- **`mockups/v2/system.css`** — read-only design reference, not in the build graph; untracked. Leave (it's the visual source of truth), don't "clean up."
- **#2 (`--border-strong`)** is the one quick-win with real visual impact — handle it deliberately with the spec open, not in the blind batch.
- **#13 (regex state machine)** — highest-risk item; needs test scaffolding first. Don't bundle with anything.

## Corrections to the explorer pass (recorded so they aren't re-litigated)
- `.glass` / `.glass-hover` are **live** (7 consumers total) — not dead.
- `--border-strong` gap is **missing-in-dark**, not missing-in-light (light is where it's defined).
- shimmer-button's emerald hex is moot — the component is **orphaned**; delete, don't re-tokenize.
