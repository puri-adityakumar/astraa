# Redesign Progress Checklist

**Last updated:** 2026-06-24 (Phase 4 mostly done; P2/P3 deferred)

## Phase status

- [x] **Phase 0 — Ground** — target spec + semantic map + progress doc written
- [x] **Phase 1 — Validate vision linchpin** — PASS. `analyze_image` works on JPG only (not PNG, err 1210). Local-serving over `http.server` on `docs/polar/shots/`. *Note: API went into transient outage mid-session — retry opportunistically.*
- [x] **Phase 2 — Recon pass** — DONE. Computed-CSS from polar.sh: card `#101011` = astraa `0 0% 6%` (EXACT parity), h1 `96px/400`, h2 `48px/400`, CTA white pill `14px/600 pad12/20`, grid `gap:16px`. Decisions: D-PARITY (no color changes), D-WEIGHT (headlines→lighter), D-GRID (keep hairlined tcards).
- [x] **Phase 3 — Core** — DONE. D-WEIGHT applied (hero→medium, 22 files h1/h2→semibold, globals h1/h2→500). D-PARITY confirmed (no color changes). Gate green.
- [x] **Phase 3-verify** — DONE. Rung1 ✅ (4 headings weight 500), Rung2 ✅ (clean h1→h2→h3, 7 tool links, 4 CTAs), Rung3 ⚠️ skipped (API outage). PASS on 2 deterministic rungs.
- [~] **Phase 4 — Sections** — mostly done (P1 no-op, P4 done, P5 done; P2 deferred-to-user, P3 deferred-low-priority)
- [ ] **Phase 5 — Whole-site sweep + both-theme verify** (retry vision when API recovers)

## Per-section state (Phase 4)

- [x] **P1 Seamless hairline grid — NO-OP (already at parity).** Computed-CSS audit: both `/tools` catalog grids use `gap: 16px` (exactly matches polar's `16px`). Per D-GRID, astraa keeps hairlined tcards; seamless feel already present. No change needed.
- [~] **P2 Nav/footer pill polish — DEFERRED (user decision).** Astraa nav + footer icon buttons use `rounded-[9px]` squircles (system.css heritage); hero CTAs already full-pill. Polar's primary CTAs are full-pill but nav icon buttons vary. Going full-pill on icon buttons is an aesthetic preference that may conflict with blueprint identity → surface to user.
- [ ] **P3 Stat/usage data-table — DEFERRED (low priority).** Recon incomplete (polar pricing big-numbers not extractable from home). Ties to audit DIR-03 (surface persisted usage data). Park for later.
- [x] **P4 Light-mode neutralize — DONE.** All light tokens dropped `240°` hue → `0 0%` pure neutral. Verified: `--foreground/--primary/--card-foreground/--accent-foreground/--secondary` = `0 0% 4%`, `--text-2` = `0 0% 11%`. *Gotcha: required dev `.next` cache clear + agent-browser `close`/re-`open` to read fresh CSS vars.*
- [x] **P5 Shared motion variants — DONE.** Added `fadeInUpGentle` (y:16, dur:0.4, smooth) + `staggerGentle` (stagger:0.06) to `lib/animations/variants.ts`, exported via index.ts. Migrated popular/how-it-works/principles off local copies (behavior-preserving). Hero keeps local variants (intentional heavier lead-in).

## Verify-ladder results log

`[date] section | rung1(computed-CSS) | rung2(a11y) | rung3(vision) | PASS/PARK`

- `2026-06-24 D-WEIGHT | rung1 ✅ (4 headings weight 500) | rung2 ✅ (clean hierarchy, 7 tool links, 4 CTAs) | rung3 ⚠️ SKIPPED | PASS`
- `2026-06-24 P4 light-neutral | rung1 ✅ (fg/primary/text-2 all 0 0%, neutral:true) | rung2 — | rung3 ⚠️ SKIPPED | PASS`
- `2026-06-24 P5 motion | rung1 ✅ (typecheck/lint/build clean, no orphaned local refs) | — | — | PASS`
- `2026-06-24 P1 grid-gap | rung1 ✅ (gap 16px = polar 16px) | — | — | PASS (no-op)`

## Cumulative change summary (no commits; all in working tree)

- **app/globals.css** — light tokens neutralized (240°→0); global h1/h2 weight 700→500
- **components/home/** (4 files) — hero h1→font-medium; popular/how-it-works/principles h2→font-medium + migrated to shared `fadeInUpGentle`/`staggerGentle`
- **components/ui/section-header.tsx** — h2→font-medium
- **17 tool/game/contribute files** — page-title h1/h2→font-semibold
- **lib/animations/variants.ts + index.ts** — added `fadeInUpGentle`/`staggerGentle`, exported

Gate status throughout: typecheck ✅, lint 0 errors (10 pre-existing warnings), build ✅.
