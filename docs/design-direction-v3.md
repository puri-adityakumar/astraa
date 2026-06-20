# Design Direction v3 — Polar × Blueprint

**Date:** 2026-06-20 · **Branch:** `major-overhaul` · **Goal:** evolve the v2 monochrome UI toward polar.sh's premium-minimal language while keeping astraa's "blueprint" identity (corner-markers, hairlines, mono spec-labels).

Recon screenshots: `docs/design-recon/polar/` (polar.sh home/sections/pricing/docs) and `docs/design-recon/astraa/` (before/after).

## Polar.sh DNA (what to graft)

1. **Pure-black canvas** — near-#000, neutral (no hue tint); cards a hair lighter, nearly flat.
2. **Huge, lighter headlines** — large sans, regular/medium weight (not black/extrabold), tight leading, generous size.
3. **Fully-rounded pill buttons** — primary = white pill + black text + small chevron; secondary = ghost/text.
4. **Numbered steps** — `01 — Ingest`, `02 — Aggregate` mono numeric + em-dash. (Blueprint-native.)
5. **Thin white line-art illustrations** — concentric circles, radiating lines, plus/cross, arrows on dark cards. Strong polar×blueprint crossover.
6. **Asymmetric section headers** — big title left, muted descriptive paragraph right.
7. **Seamless hairline card grid** — cards share 1px-gap edges (connected-grid look).
8. **Data-table / dashboard aesthetic** — big numbers, muted column headers, right-aligned numerics, color only as signal (green/red).
9. **Generous vertical rhythm**; grayscale logo cloud; centered announcement bar.

## Astraa identity to KEEP (out-blueprints polar)

- Crosshair `+` **corner-markers** on cards (`.xmark`), optional L-brackets.
- **Mono uppercase microcopy** eyebrows + `LOCAL`/`WIP` tags.
- Atmospheric **glow + vignette + grain** (Linear-style depth, no grid — grid was rejected).
- Devanagari `अस्त्र` bilingual signature.
- 100% grayscale; depth via lightness/opacity.

## Done — iteration 1 (this pass)

- **Foundation purge** (both audits' step 1): deleted three.js/postprocessing/pixel-blast/landing-background, recharts+chart.tsx, react-day-picker+calendar.tsx, shimmer-button, floating-navbar, animations-showcase, colors/. Removed 10 dead Tailwind animations + 11 dead `@layer` classes + 4 duplicate `--surface` `:root` injections. Added missing `.dark --border-strong`. Build ✓ / 330 tests ✓ / lint 0 errors.
- **Pure-black neutralize** — dark tokens dropped the `240°` hue → `0 0%` grayscale (bg `0 0% 3.5%`, card `0 0% 6%`, etc.).
- **Pill CTAs** — hero `BTN_BASE` → `rounded-full`.
- **Hero refinement** — headline `font-extrabold`→`font-bold`, size `clamp(40px,6.7vw,72px)`, looser tracking.

## Next iterations (queued)

- **Numbered "How it works" section** (01—/02—/03—) with thin line-art SVG motifs — new home section. Highest polar×blueprint payoff.
- **Seamless hairline grid** option for tool/explore catalogs (connected-grid variant of TCard).
- **Stat/usage data-table** styling (ties to audit DIR-03: surface persisted usage data).
- **Nav/footer pill polish**; consider pill for GitHub/search to match.
- **Light-mode neutralize** (drop residual `240°` on `--foreground`/`--primary`/`--text-2`).
- **Shared motion variants** — replace per-component `fadeInUp`/`stagger` copies with `@/lib/animations/variants` (refactor #3); extract `SectionHeader`/`SectionDivider` (refactor #8) + `ToolPageHeader` (audit DEBT-05).
- Bigger hero type exploration; grayscale logo/trust row.

## Guardrails

- Verify every change with screenshots in **both** themes; dead-CSS/token changes shouldn't move pixels unintentionally.
- Respect `useReducedMotion()`; touch targets ≥44px; keep `cn()` + Tailwind class order.
- Keep light + dark complete (dark-first, light-complete).
