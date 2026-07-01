# Design System Semantic Map

**Purpose:** maps each design token / primitive → its file → current state. The
"functional core" of the redesign. Edit tokens/primitives here first; sections inherit.

This is the inventory, NOT the changelog. For progress see `progress.md`.

---

## Tokens (`app/globals.css`)

Two token layers coexist (mid-migration). **Target = converge to the `--xxx` names**;
deprecate the old shadcn `--text-2`/`--surface-3` aliases.

### Core semantic (shadcn-style, HSL triplets)
| Token | Dark | Light | Notes |
|-------|------|-------|-------|
| `--background` | `0 0% 3.5%` | `0 0% 97%` | neutralized iter-1 ✓ |
| `--foreground` | `0 0% 93%` | `240 6% 4%` | ⚠️ light still has 240° hue → **P4** |
| `--card` | `0 0% 6%` | `0 0% 100%` | neutralized ✓ |
| `--primary` | `0 0% 98%` | `240 6% 4%` | ⚠️ light has 240° → **P4** |
| `--muted-foreground` | `0 0% 56%` | `0 0% 42%` | neutralized ✓ |
| `--border` | `0 0% 13%` | `0 0% 90%` | neutralized ✓ |
| `--ring` | `0 0% 83%` | `0 0% 25%` | neutralized ✓ |

### Blueprint-specific (raw rgba / resolved)
| Token | Dark | Light | Component use |
|-------|------|-------|---------------|
| `--hairline` | `rgba(255,255,255,.09)` | `rgba(10,10,11,.10)` | card borders |
| `--hairline-strong` | `rgba(255,255,255,.15)` | `rgba(10,10,11,.18)` | hover borders |
| `--hairline-faint` | `rgba(255,255,255,.05)` | `rgba(10,10,11,.06)` | row dividers |
| `--marker` | `rgba(255,255,255,.30)` | `rgba(10,10,11,.35)` | CornerMarkers cross |
| `--bracket` | `rgba(255,255,255,.22)` | `rgba(10,10,11,.40)` | CornerMarkers bracket |
| `--track` | `rgba(255,255,255,.10)` | `rgba(10,10,11,.08)` | sliders/switches off |
| `--glow` / `--vignette` / `--atmosphere` | ✓ | ✓ | Atmosphere + hero |
| `--radius` | `0.75rem` | `0.75rem` | global |

### Legacy aliases (to deprecate)
- `--surface` → alias of `--card` (system.css compat)
- `--surface-2` / `--surface-3` → used by password/tcard internals
- `--text-2` → `--muted-foreground`? used in nav + hero sub
- `--faint` → used in tcard arrow, blueprint-art

---

## Primitives (`components/ui/`)

| Primitive | File | State | Notes |
|-----------|------|-------|-------|
| `TCard` | `tcard.tsx` | ✅ shipped | the blueprint card. icon box + dashed foot + arrow + hover lift |
| `CornerMarkers` | `corner-marker.tsx` | ✅ shipped | cross + bracket variants, 4 corners |
| `SectionHeader` | `section-header.tsx` | ✅ shipped | eyebrow + h2 + optional desc/action |
| `SectionDivider` | `section-header.tsx` | ✅ shipped | the 18px hairline tick |
| `BlueprintArt` (Rings/Radiate/Cross/Arrows) | `blueprint-art.tsx` | ✅ shipped | decorative line-art SVGs |
| `Button` | `button.tsx` | ⚠️ check | shadcn base — may need pill variant |
| `AnimatedButton` | `animated-button.tsx` | ⚠️ check | legacy? |

---

## Sections (`components/home/`)

| Section | File | Polar status | Notes |
|---------|------|--------------|-------|
| Hero | `hero-section.tsx` | ✅ iter-1 | pill CTAs, glow, devanagari |
| Popular | `popular-section.tsx` | ⚠️ uses gap-4 grid | **P1 seamless grid** |
| How it works | `how-it-works-section.tsx` | ✅ iter-1 | numbered steps + blueprint art |
| Principles | `principles-section.tsx` | ✅ | uses TCard |
| StatsBar | `stats-bar.tsx` | ⚠️ check | **P3 stat/data-table** candidate |

---

## Motion (`lib/animations/`)

| Item | File | State |
|------|------|-------|
| `variants.ts` | shared fadeInUp/stagger | **P5 — create & adopt** |
| `hooks.ts` | `useReducedMotion()` | ✅ exists |
| Per-section `fadeInUp`/`stagger` copies | hero/popular/how-it-works/principles | ⚠️ **P5 — dedupe** |
