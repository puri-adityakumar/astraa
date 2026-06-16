# astraa v2 — UI Overhaul Handover

**Branch:** `major-overhaul`
**Status:** Mockups complete & approved-in-principle ("much better"). Not yet locked into a spec. No production code touched yet.
**Date:** 2026-06-16

---

## 1. What this is

The user wants to retire the current "vibecoded gradient" look (emerald + generic gradients + Funnel Display) and move astraa to a **monochrome, premium, minimal, dark-first** aesthetic — a hybrid of **Linear** (cinematic dark, bold type, atmospheric glow/vignette, hairline borders) and **Blueprint** (corner-marker / crosshair cards as connective tissue).

The mockups in `mockups/v2/` are the approved visual reference. The next step is to write a design spec, then an implementation plan, then port it into the real Next.js app.

---

## 2. Locked design decisions

| Area | Decision |
|------|----------|
| **Look** | Monochrome (black/white + grayscale variants). Premium, minimal. |
| **Theme** | Dark-first. Light kept and fully themed (toggle works), but dark is the hero. |
| **Type** | Geist Sans + Geist Mono. **Retire Funnel Display.** |
| **Devanagari** | `अस्त्र` bilingual signature **stays** (Noto Sans Devanagari). |
| **Logo** | lowercase `astraa` wordmark + arrowhead mark (SVG path `M4 20 L14 4 L16 14 L4 20 Z`) + `अस्त्र`. |
| **Background** | **Grain + same-color (grayscale) radial gradient atmosphere.** NOT a grid. (User explicitly rejected the grid.) |
| **Cards** | Blueprint "tcard": crosshair `+` corner markers, icon box, dashed-top footer with a tag + an arrow that nudges on hover, surface-3 hover lift. |
| **Color** | Retire emerald and all hues. Grayscale only. |

---

## 3. What was built — `mockups/v2/`

Static multi-page HTML mockup site (no framework). Served over LAN for phone preview:

```bash
python3 -m http.server 8000 --bind 0.0.0.0 --directory /Users/aditya/Projects/astraa/mockups
# Phone: http://192.168.1.7:8000/v2/
# Server dies if the Mac sleeps — just restart it.
```

### Files
- `system.css` — the full design system. Faithful port of `mockups/hybrid.html`'s stylesheet (the approved reference). Tokens + all components.
- `system.js` — theme toggle (persists to `localStorage` key `astraa-theme`), ⌘K command palette (open/close/filter), `data-theme-btn` sync.
- `_template.html` — shared shell: head (fonts), `.atmosphere` + `.grain` divs, `.nav` (logo / nav-links / search / theme seg / github), footer, command palette. Copy this to start a new page.
- `index.html` — Home: hero with glow + 6 popular tcards + principles.
- `tools.html` — 12 tcards, grid-4.
- `tool-json.html` — complex JSON editor mock: seg tabs, toolbar, 2-pane editor (crosshair-cornered panel + line numbers + tree).
- `tool-password.html` — mirrors the hybrid phone screen: `.pw-out`, strength bar, switches, slider.
- `games.html` — 8 game tcards (one `tcard soon`).
- `about.html` — 720px reading column + facts tcard.

All 6 pages share nav/footer/palette and use the canonical card markup. Verified serving HTTP 200, monochrome-clean.

### Older mockups (superseded, still on disk)
`mockups/linear-dark.html`, `mockups/blueprint-light.html`, `mockups/hybrid.html` (the approved reference), `mockups/index.html` (old 2-direction gallery).

---

## 4. Design system reference (from `system.css`)

### Tokens — dark (`:root`)
```
--bg:#0A0A0B  --surface:#141416  --surface-2:#161618  --surface-3:#1B1B1E
--text:#EDEDED  --text-2:#B4B4B4  --muted:#8A8A8A  --faint:#5C5C60
--border:rgba(255,255,255,.09)  --border-strong:rgba(255,255,255,.15)  --border-faint:rgba(255,255,255,.05)
--marker:rgba(255,255,255,.30)
--btn-bg:#FAFAFA  --btn-fg:#0A0A0B  --on-fill:#EDEDED
--glow: radial-gradient(... near-white ...)   --vignette: ...
--r-sm:8px  --r-md:12px
```
Light (`:root.light`) inverts these.

### Key components
- **`.xmark`** — crosshair `+` corner marker. `11×11px`, `::before` = vertical 1px line, `::after` = horizontal 1px line. Variants `.tl/.tr/.bl/.br` offset by `-5.5px`. Color `var(--marker)`.
- **`.tcard`** — the blueprint card. `background:var(--surface); border:1px solid var(--border); border-radius:var(--r-md); padding:20px`. Contains `.ic` (38px icon box, surface-2 bg), `h4`, `p`, `.foot` (`border-top:1px dashed var(--border)`) with `.tag` + `.arr`. Hover → surface-3, border-strong, shadow, `translateY(-2px)`; `.arr` does `translate(2px,-2px)`.
- **`.hero .glow` / `.vignette`** — Linear-style atmosphere.
- **`.atmosphere` / `.grain`** — grayscale radial gradient + SVG `feTurbulence` grain (replaces the rejected grid).
- Buttons, `.eyebrow` (with `.tick`), `.tag`, and password primitives (`.pw-out`, `.strength`, `.switch[data-on]`, `.slider`, `.field`).

### Canonical `.tcard` markup
```html
<a class="tcard" href="HREF">
  <span class="xmark tl"></span><span class="xmark tr"></span><span class="xmark bl"></span><span class="xmark br"></span>
  <span class="ic"><!-- 19px line icon --></span>
  <h4>TITLE</h4>
  <p>DESC</p>
  <span class="foot">
    <span class="tag">TAG</span>
    <svg class="arr" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17L17 7M9 7h8v8"/></svg>
  </span>
</a>
```

---

## 5. PR fixes (already merged to development + main, done before the overhaul)

7 Greptile P1 blockers fixed across 4 PRs. All shipped with tests/typecheck/lint green:
- **base64** — `lib/base64/validate.ts` whitespace class `/[\t\n\r\f\v ]/g` to match codec; `base64-output.tsx` surfaces encode errors too.
- **regex** — `code-emit.ts` PHP modifier strip `/[^imsu]/g`; `match.ts` + `redos-worker.ts` add `d` flag and populate `groupIndices` from `m.indices`; `types.ts` adds `groupIndices`; `highlight-overlay.tsx` uses offsets not `indexOf`. Test `code-emit.test.ts` was enshrining the bug — corrected expectation to `'/\d+/i'`.
- **json** — `patch.ts`/`flatten.ts`/`types.ts` + tree components: wired TreeEditPopover/TreeAddMenu, object-add fix, `value` on TreeRow.
- **snippet** — `layout-section.tsx` draft-state for custom W/H using render-time sync (`if (s.aspect !== prevAspect)`) not `useEffect`, to dodge `react-hooks/set-state-in-effect`.

---

## 6. Git state
- On `major-overhaul` (off `development`).
- `mockups/` is **untracked** — nothing committed yet for v2.
- `development` and `main` are in sync (the earlier "1 commit behind" was a harmless release merge commit; back-merge produced zero file changes).
- Contribution flow: feature → `development` → `main`. PRs target `development`.

---

## 7. Next steps (brainstorming flow)
1. **Confirm lock** — user said "much better"; get an explicit go before spec.
2. **Write v2 design spec** → `docs/superpowers/specs/YYYY-MM-DD-v2-monochrome-design.md`. Self-review against the CLAUDE.md Feature Spec Review Checklist.
3. **Transition to writing-plans skill** — plan the real implementation:
   - Replace `app/globals.css` emerald/gradient tokens with the monochrome token set.
   - Swap fonts in `app/layout.tsx` (drop Funnel Display; Geist already imported).
   - Update `components/logo.tsx` to the arrowhead + wordmark + अस्त्र.
   - Build the grain/atmosphere layer, `.tcard` component, crosshair markers as React components.
   - Re-skin nav, command palette, tool/game cards, hero.
4. Execute plan in the Next.js app on `major-overhaul`.

### Watch out
- The first v2 attempt diverged from hybrid (weak L-bracket ticks, simpler card). User flagged it hard: "Not at all matches the cards and design of hybrid." Fix was porting hybrid.html's actual CSS verbatim. **Keep fidelity to `mockups/hybrid.html` / `system.css`.**
- Ignore the interrupted "weight/height workout module" message — wrong project, user disowned it.
