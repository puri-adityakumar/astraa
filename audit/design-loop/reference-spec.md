# Reference spec: claude.dev/terminal/ (verified from live CSS + screenshots, 2026-10-11)

Sources: fetched HTML + 2 stylesheets (chunks `37ug3ugc7bqbl.css`, `09d4k6axjd-pi.css`); screenshots ref-1440-top/scrolled, ref-1920-top.
CRITICAL: `html{font-size:112.5%}` → **1rem = 18px**, not 16. All rem values below already converted (px first).
Verified values cite CSS; "(measured)" = from 1440x900 screenshot; "(inferred)" = extrapolated.

## 1. Column geometry
- App shell: `height: calc(100dvh - var(--chrome))`, `overflow:hidden` on body — full-viewport terminal, NO page scroll. Inner list scrolls.
- CSS grid: `grid-template-columns: 243px 1fr` (13.5rem). Sidebar divider = 1px solid `--line-soft` at x=242 (measured).
- Main column: `max-width: 990px` (55rem) incl. `padding: 0 36px 20px 36px` (--gutter=2rem). Content text/rules span x=280 → x=1198 (measured; 918px inner). Column is LEFT-anchored after sidebar, not centered; right side is open space.
- At 1920 the column does NOT widen — same 990px cap, content stays at x=280 (measured). Excess width becomes empty space.
- Vertical: content starts at top (banner `margin-top:32px`), list block is pushed to the BOTTOM via `margin-top:auto` on `.feeds-bottom`; prompt dock is last, in normal flow at viewport bottom (not `position:fixed` — it's a flex column: `banner → sub → feeds-bottom(flex) → term-dock`).

## 2. Sidebar anatomy (`.side`, 243px)
- Padding: 36px all sides. Same bg as page (no fill), separated only by the 1px `--line-soft` right border.
- Logo: top of sidebar (pixel-art glyph ~56x38px, coral accent). Left edge = 36px padding.
- Nav (`.menu`): **bottom-anchored** — `margin-top:auto` pushes it down. Order: logo (top) … nav stack (bottom) → CTA.
- Nav rows: mono, 15.75px, `gap:4px` between rows; each link `padding:5px 0` → row box ≈36px, pitch ≈40px (measured ~39).
- Row anatomy: key chip `[H]` in `--ink-3` + 6px margin-right + label in `--ink-2`. Hover: whole link `translateX(4px)` (.2s --ease-out) and label brightens to `--ink`; chip brightens to `--ink-2`. Active page (`.on`) = `--ink` persistent.
- Bottom CTA `.btn.solid` "Try Claude Code": mono 15.75px, `height:36px; padding:8px 12px`, background `--paper` (cream), color `--bg` (near-black), NO border-radius (sharp corners; site uses `--fig-radius:0` everywhere). Hover: `box-shadow: 0 0 0 2px var(--paper)` (2px ring, not a color swap). Sits 18px below nav (`margin-top:18px`).
- CTA bottom edge aligns with prompt-dock baseline (measured y≈828-864 vs prompt y≈830-880).

## 3. Prompt anatomy (`.term-dock`)
- Structure: 1px `--line-soft` border-TOP and border-BOTTOM (a banded rule sandwich), `padding:14px 2px` → ≈54px tall band (measured ~815→883 incl. rules). Full main-column width (280→1198).
- Content: mono 15.75px. `guest@claude.dev` in `--ink` (bright), ` > ` separator, then muted placeholder-style command text (`/theme`) in `--ink-3` (measured; input is JS-rendered, exact classes not extractable — inferred: real `<input>` with color swap on typing, block cursor).
- Left-aligned with content column start (x=280); no icon, no send button, no box — text on bare background between two hairlines.
- Echo of executed commands appears above the dock in `#termOut` (`margin-top:24px`), command line padded `0 1ch`.

## 4. List row anatomy (`.frow`)
- Grid: `grid-template-columns: 125px 1fr auto` (fixed key columns), `column-gap:24px`, `align-items:baseline`, `padding:4px 2px`.
  - Col 1 (125px): date or "Featured" label — `--ink-3`, muted. Featured section: only FIRST row shows its label; other labels `opacity:0` until section hover (label column reads as empty gutter).
  - Col 2 (1fr): title — `--ink`, `white-space:nowrap; text-overflow:ellipsis; overflow:hidden`.
  - Col 3 (auto): duration/read-time — `--ink-3`, right-aligned to column edge (x=1198).
- Row pitch ≈34px (26px line + 8px padding). Titles, dates, durations ALL mono 15.75px — one size for the whole list.
- Hover / keyboard-focus (`.kb-on`): **full inversion** — row bg `--paper` (cream on dark theme), ALL spans flip to `--bg`; title `translateX(+12px)`, duration `translateX(-12px)` (.18s --ease-out; bg .12s). Cursor:pointer.
- Filter tabs (`.tabs-line`): `border-top+bottom 1px --line-soft`, `margin:16px 0 10px`, `padding:12px 2px`; uppercase mono, active `--ink`, rest `--ink-3` (measured; sizes ≈ type-term).
- Load row (`.load-row`): same 3-col grid — empty 125px key col, "LOAD MORE" in `--ink`, right hint "/posts for more" in `--ink-3` that `translateX(-12px)` on hover; inverts bg like rows. `letter-spacing:.02em`.
- Empty state (`.f-empty`): mono `--ink-3`, `padding:14px 2px`, accent-colored `>` prefix (6px gap: `margin-right:8px`... CSS: 8px).

## 5. Typography
- Fonts (site-wide vars): `--sans: "Anthropic Sans", -apple-system, "Helvetica Neue", sans-serif`; `--mono: "Anthropic Mono", ui-monospace, "SF Mono", Menlo, monospace` (variable woff2, self-hosted). Terminal page is ~100% mono; sans only for buttons (.btn base).
- Scale (desktop, 1rem=18px):
  - ASCII banner: preformatted ASCII art, char grid ≈ 10px/char (measured 525px wide / ~53 chars); rendered in muted ink-3/ink-2 tone, role="img" aria-label="claude.dev".
  - Tagline (`.sub`): mono `--type-term` 15.75px, lh 1.65, `--ink-2`, `max-width:660px` (wraps at ~2 lines), inline command tokens (`.cmd` = `/help`) brightened to `--ink`.
  - Rows/tabs/prompt/nav: mono 15.75px (`--type-term: clamp(12px→15.75px, vw-based, hits max ≈1096px viewport)`).
  - Feature card title/body: mono 14.06px (.875rem); card CTAs 13.5px (.75rem), uppercase, letter-spacing .02em.
  - Global: terminal layout forces `line-height:1.65` on everything (mobile switches to 1.8).
- Letter-spacing: 0 for rows; .02em for uppercase/chrome text (tabs, CTAs, load-row).

## 6. Color tokens (from :root CSS; dark = default scheme, light = `[data-scheme=light]`)
| Token | Dark (screenshots) | Light |
|---|---|---|
| `--bg` page background | `#141413` | `#faf9f5` |
| `--paper` (invert/solid btn/hover row) | `#faf9f5` | `#141413` |
| `--bg-raised` | `#1a1a18` | `#f1efe8` |
| `--bg-panel` | `#1e1d1b` | `#ece9e0` |
| `--ink` primary text | `#faf9f5` | `#141413` |
| `--ink-2` (tagline, nav labels) | `#b0aea5` | `#4c4b45` |
| `--ink-3` (dates, durations, keys, placeholder) | `#87867f` | `#7b7a72` |
| `--ink-4` (faintest) | `#a8a69d` | `#5e5d59` |
| `--line` strong border (feature card) | `#faf9f529` (16% ink) | `#14141338` |
| `--line-soft` hairlines (all rules) | `#faf9f517` (9% ink) | `#1414131c` |
| `--accent` coral (logo, `>` prefixes, links) | `#d97757` | `#c15f3c` |
| `--accent-deep` | `#a94e2f` | `#c15f3c` |
- Border recipe: hairlines are alpha-% of the ink color, 1px, used everywhere (divider, tabs band, dock band, card CTAs). Only the floating feature card uses the stronger `--line`.
- Accent is SPARSE on this page: logo glyph, empty-state `>`, occasional links. List/hover states are pure ink/paper inversions, never accent.

## 7. Spacing rhythm
- Sidebar padding 36px; main gutter 36px L/R + 20px bottom.
- Vertical chain: banner `margin:32px 0 8px` → tagline `margin:8px 0 48px` → (flex gap) list block pinned to bottom → tabs band `margin:16px 0 10px`, `padding:12px 2px` → rows `padding:4px 2px` (34px pitch) → dock `padding:14px 2px`.
- Horizontal: the 125px key column + 24px gap creates the "typed at a prompt" indent — label col reads as dead space, titles all start at x=280+125+24=429 (measured 430). Rules/padding use tiny 2px insets, not cards.
- Unit feel: 4/8px micro (row padding), 12/16px bands, 36px gutters, 48px section gap. Multiple of 4 throughout.

## 8. Empty-space philosophy
- Content is top-anchored (banner+tagline) and list is BOTTOM-anchored; the middle ~250-500px is intentionally empty background (measured gap y≈216→420 at 900h; larger at 1080p). Never center-stacked.
- Whitespace is structured by the fixed 125px label gutter (empty col 1 in featured rows, tabs, load row) — emptiness repeats a grid, it isn't random margin.
- Right of the 990px column: raw background at every viewport. Floating elements (feature card, cookie dialog) occupy that right margin, fixed to viewport edge (card: `right:26px; top:22px; width:292px`).
- No fills, no cards for content rows — hierarchy comes from ink tiers (faf9f5 / b0aea5 / 87867f) and the 125px gutter, not boxes.

## 9. Notable behaviors (from CSS + screenshots)
- Prompt pinned by flex (`margin-top:auto` + dock last), NOT fixed; list area (`#rows-hold`) is the only scroll container, scrollbar fully hidden (`scrollbar-width:none` + `::-webkit-scrollbar{display:none}`).
- Scroll affordance = gradient veils, not scrollbars: 72px bottom fade + 56px top fade to `--bg`, opacity-toggled.
- Row hover doubles as keyboard selection (`.kb-on` gets identical inversion) — keyboard-first UI; sidebar links carry `data-key` ([H]/[M]/[C]/[D]/[T]) as shortcuts.
- Hover motion is directional: label→right +12px, duration/meta→left -12px (row "stretches" outward); nav links slide +4px. Easing `cubic-bezier(.19,1,.22,1)` (ease-out-expo feel), 180-200ms; bg 120ms.
- Feature card: fixed top-right, 292px, 1px `--line` border, bg = page bg, internal 16px padding, CTA strip split by hairlines (DISMISS | READ MORE →), hidden below 1180px viewport.
- Mobile (≤900px): sidebar hidden, top nav bar appears (--nav-h:73px), single column, ≤640px drops the date column (`grid-template-columns:1fr auto`).
- Reduced-motion: honored site-wide (`prefers-reduced-motion` blocks shown in CSS).
