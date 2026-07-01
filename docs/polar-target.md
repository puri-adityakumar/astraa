# Polar.sh Redesign — Target Spec & Working Set

**Branch:** `major-overhaul` · **Created:** 2026-06-24 · **Status:** IN PROGRESS (no commits)

This is the **durable working set** for the long-horizon redesign loop. It survives
context summarization. Update it every iteration — it is the source of truth for
*what polar looks like* (extracted values) and *what we've decided* (decisions log).

Companion files:
- `docs/polar/semantic-map.md` — what each token/primitive is + done-state
- `docs/polar/progress.md` — phase + per-section checklist
- `docs/design-direction-v3.md` — original analysis + iter-1 ship list (READ ONLY ref)

---

## 1. Astraa identity to KEEP (out-blueprints polar)

Non-negotiable. These are what make astraa distinct, not a polar clone:

- Crosshair `+` **corner-markers** (`CornerMarkers` / `.xmark`) — optional L-brackets
- **Mono uppercase microcopy** eyebrows (`tick` + label) + `LOCAL`/`WIP` tags
- Atmospheric **glow + vignette + grain** (Linear-style depth, NO grid — grid rejected)
- Devanagari `अस्त्र` bilingual signature
- 100% grayscale; depth via lightness/opacity only

## 2. Polar DNA to graft (the queued work, from design-direction-v3.md)

Priority order = polar×blueprint payoff. Strike through as completed in §5.

| # | Item | Status |
|---|------|--------|
| P1 | **Seamless hairline grid** — connected-card grid (shared 1px-gap edges) for tool/explore catalogs | ☐ |
| P2 | **Nav/footer pill polish** — GitHub/search to pill language; consistent segmented controls | ☐ |
| P3 | **Stat/usage data-table** styling — big numbers, muted col headers, right-aligned numerics, color as signal only (audit DIR-03) | ☐ |
| P4 | **Light-mode neutralize** — drop residual `240°` hue on `--foreground`/`--primary`/`--text-2` | ☐ |
| P5 | **Shared motion variants** — replace per-component `fadeInUp`/`stagger` copies with `@/lib/animations/variants` (refactor #3) | ☐ |
| ~~P6~~ | ~~Numbered "How it works" (01—/02—/03—) with line-art motifs~~ | ✅ DONE (iter-1, commit 88446e8) |

---

## 3. Extracted polar.sh values (filled by Phase 2 recon)

> These get populated by `agent-browser eval` against live polar.sh. Until then,
> the **target** column is the direction; the **actual** column is the verified number.

### 3.1 Color (pure-black neutral canvas)

| Token | Target (from DNA) | Actual (polar) | astraa dark (current) | Δ action |
|-------|-------------------|----------------|-----------------------|----------|
| background | near-#000, neutral | `rgba(0,0,0,0)` over canvas; body text `rgb(113,114,122)` ≈ muted | `0 0% 3.5%` | ✓ PARITY |
| card/surface | hair lighter, near-flat | **`rgb(16,16,17)` = `hsl(0 0% 6%)`** (computed-CSS) | `0 0% 6%` | **✓ EXACT PARITY** |
| headline fg | off-white | `rgb(255,255,255)` (h1) | `0 0% 93%` | ✓ close (polar uses pure white on hero) |
| body/muted fg | neutral | `rgb(113,114,122)` ≈ `hsl(240,4%,46%)` | `0 0% 56%` | ✓ close |

### 3.2 Typography (huge, LIGHTER headlines — the key lesson)

> Polar uses **regular weight (400)** for ALL display type, never bold. Depth comes from size + color contrast, not weight. font: InterDisplay (h1) / Inter (body).

| Element | Target | Actual (polar, computed) | astraa (current) | Δ action |
|---------|--------|--------------------------|------------------|----------|
| hero h1 weight | regular | **`400`** | `font-bold` (700) | **CHANGE → font-medium/normal** |
| hero h1 size | huge | **`96px`**, lh `96px` (1.0!) | `clamp(40px,6.7vw,72px)` lh 1.04 | consider bigger, keep tight lh |
| hero h1 letter-spacing | normal | `normal` | `-0.03em` | ✓ ok (astraa tighter is fine) |
| section h2 weight | regular | **`400`** | `font-bold` (700) | **CHANGE → font-medium** |
| section h2 size | big | **`48px`**, lh `60px` | `clamp(24px,3.4vw,32px)` | **consider bigger** (polar 1.5×) |
| lede/h6 | muted, regular | `24px` / `400` / lh 33px / muted | `clamp(15px...)` | ✓ similar pattern |
| eyebrow | mono, 0.2em tracking | (polar has none — astraa keeps its own) | ✓ blueprint-unique | KEEP |

### 3.3 Geometry

| Element | Target | Actual (polar, computed) | astraa (current) | Δ action |
|---------|--------|--------------------------|------------------|----------|
| pill radius (CTAs) | fully rounded | **`3.35e7px` (= full pill)**, pad `12px 20px` | `rounded-full` | ✓ PARITY |
| CTA colors | white pill, black text | `bg rgb(255,255,255)`, `color rgb(0,0,0)`, `14px/600` | ✓ matches | — |
| card radius | flat | **`0px`** (polar cards are FLAT) | `--radius: 0.75rem` | **KEEP astraa's** (blueprint identity) |
| card border | none on polar | **`0px`** | `1px hairline` | **KEEP** (blueprint identity) |
| **grid gap** | consistent | **`16px`** | `gap-4` (16px) | ✓ PARITY |

### 3.4 Section structure

| Pattern | Polar | astraa | Action |
|---------|-------|--------|--------|
| Section header | h2 (regular, 48px) + h6 lede (24px muted) | `SectionHeader` (eyebrow + h2) | ✓ supported |
| Numbered steps `01 — Label` | (polar doesn't use) | ✅ how-it-works | blueprint-unique, KEEP |
| Feature grid | 3-col, 16px gap, **flat borderless cards** | 3-col, 16px gap, **hairlined tcards** | **KEEP hairlines** (identity) |

### 3.5 The big design-tension finding (P1)

Polar's "seamless grid" is NOT 1px-shared-edges. It is: **flat, borderless, border-radius-0 cards + a uniform 16px gap**, where card surface (`#101011`) sits one step above body. Astraa's blueprint identity is the **opposite**: hairline-bordered, corner-marked, rounded cards.

**Decision (D-GRID):** Astraa keeps its hairlined + corner-marked tcards (identity). The polar lesson we DO adopt for P1: tighten grid to a uniform 16px gap (already there) and ensure card surface lift reads as "seamless cluster." Do NOT go borderless — that erases the blueprint identity.

---

## 4. Decisions log

Record every design decision with rationale. Newest first.

- **2026-06-24 (D-GRID)** — **P1 "seamless grid" redefined.** Polar's grid is flat/borderless/0-radius cards + 16px gap (verified via computed CSS: card `border:0`, `borderRadius:0`, grid `gap:16px`). Going borderless would erase astraa's blueprint identity (hairlines + corner-markers). **Decision: KEEP hairlined tcards; the "seamless" feel comes from uniform 16px gap + consistent surface lift, not shared edges.** P1 scope reduced to gap/spacing audit + surface-lift consistency.
- **2026-06-24 (D-WEIGHT)** — **Headline weight is the #1 polar lesson.** Polar uses **regular weight (400)** for ALL display type (h1 `400`/96px, h2 `400`/48px). Astraa hero/section are `font-bold` (700). **Decision: shift hero h1 → `font-medium` (500), section h2 → `font-medium`/semibold.** Astraa's tracking (-0.03em) and tight leading are already polar-aligned. This is the single highest-impact, lowest-risk change.
- **2026-06-24 (D-PARITY)** — **Token parity confirmed.** Polar card `rgb(16,16,17)` = astraa `--card 0 0% 6%` EXACTLY. Background near-black. CTA white pill + black text + 14px/600 matches. **No token color changes needed for dark mode** — iter-1 already landed parity.
- **2026-06-24 (D-VISION)** — **Vision linchpin VALIDATED.** `analyze_image` MCP works, but ONLY on **JPG/JPEG** — it rejects PNG with error 1210 "图片输入格式/解析错误" even for canonical test images. Confirmed via a .jpg control (Google gstatic) succeeding where identical .png failed. **Rule: all vision captures MUST be `agent-browser screenshot --screenshot-format jpeg`.** Local-serving over `python3 -m http.server 8765` on `docs/polar/shots/` works. Phase 1 = PASS.
- **2026-06-24** — Plan approved: long-horizon verify-loop (observe→design→edit→verify→gate→checkpoint). Vision via `analyze_image` MCP on localhost-served screenshots, validated first as linchpin. No commits.
- **2026-06-26 (D-P2)** — Nav/footer icon buttons rounded. Agent-browser snapshot + styles audit on polar.sh (header buttons "Get Started"/"Sign in" full pill; limited icon buttons). Astraa uses rounded-[9px] 38px for search/github/theme icons + footer social. **Decision: KEEP rounded-[9px] squircles** for nav/footer icon buttons. Rationale: preserves unique blueprint identity (squircles align with CornerMarkers, TCard icon boxes at 8px, hairline language). Polar primary CTAs are pills — astraa hero CTAs already match that (full rounded-full). Changing icons would erase astraa differentiation. No code change.
- **2026-06-26 (D-HERO-SCALE)** — Hero h1 scale vs polar. Polar h1 ~96px weight 400 (from prior computed + agent-browser recon). Astraa clamp max 72px (medium weight). Rung1 (source + polar agent-browser) + structure. **Decision: bump max to 84px** — change to `clamp(40px,6.8vw,84px)`. Gives stronger visual weight closer to polar DNA while keeping fluid responsive on small screens. Only hero-section.tsx edited (globals h1 separate for other pages). Weight stays medium.

---

## 5. Done checklist

- [x] Iter-1: foundation purge, pure-black neutralize, pill CTAs, hero refactor (pre-existing)
- [x] Iter-1: numbered "How it works" section + blueprint line-art primitives (commit 88446e8)

## 6. Open questions / risks

- **Vision reliability** — unvalidated. Phase 1 de-risks. Fallback: Rungs 1+2 only (computed-CSS + a11y snapshot).
- **Light-mode completeness** — dark-first per HANDOVER, but light must be fully themed. P4.
- **Connected-grid vs tcard hover** — seamless grid breaks the per-card hover lift (cards share edges). Resolve in P1.
