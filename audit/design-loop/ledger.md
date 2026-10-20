# Design Loop Ledger — feat/terminal-browser-panel

Plan: `PLAN.md` · Reference: `reference-spec.md` · Baseline commit: `5f7fe0d`

## Scoring

Jury: 3 blind jurors × 5 criteria × 0–2 per surface. Harness: measured checks must be green every pass.

## Round 0 — Baseline (2026-10-11, commit 5f7fe0d)

**Jury baseline** (avg score/2 across surfaces): JuryA ≈ 0.93 · JuryB ≈ 1.15 · JuryC ≈ 1.27 → **baseline ≈ 1.1**

**Harness**: all green (panel tops 0, prompt pinned 900, columns 464=464, scrollbar space 0, chips/kv grids aligned, no overflow).

### Findings backlog (deduped; source tags: A1=UI/UX auditor, A2=code auditor, JA/JB/JC=jurors)

| # | Pri | Finding | Fix pointer | Round |
|---|---|---|---|---|
| F1 | P1 | Sidebar truncates 5 tool labels at every width | short rail names in `tool-names.ts` + `sidebar.tsx` | R1 |
| F2 | P1 | JSON editor renders Courier (CodeMirror default) + chunky scrollbar | `components/json/text-view.tsx` EditorView.theme (pattern: markdown/editor.tsx:140) | R3 |
| F3 | P1 | Buttons render icon flush to label (Generate/Copy) | `components/ui/button.tsx` base: `gap-2` + svg sizing — touches shared file, verify both flavours | R3 |
| F4 | P1 | Mono drift: sidebar rows/tabs/panel header/tip card are font-sans; reference is mono-everything | `tool-row.tsx`, `category-tabs.tsx`, `panel-frame.tsx`, `home-view.tsx` | R2 |
| F5 | P1 | Dracula theme indistinguishable from mocha (4 sources: A1, JA, JB, JC) | verify `data-term-theme` swap, then differentiate `themes.ts` dracula tokens | R5 |
| F6 | P1 | Prompt caret invisible in dark themes (dark-on-dark) | themed caret-color / block cursor on `#term-prompt` | R4 |
| F7 | P2 | /help "· live" status orphan-wraps to its own line | `output-blocks.tsx` kv: glue status to last word, nowrap | R2 |
| F8 | P2 | Home vertical rhythm: 1920 dead zone under tip card; tip below fold at 1024×768 | `home-view.tsx` flex anchoring + spacing | R2 |
| F9 | P2 | Native `<select>` chrome (scheme picker, unit field) breaks the custom look | Radix Select swap; portal tokens exist | R5 |
| F10 | P2 | 768px: tool name truncates before summary | `tool-row.tsx` summary `sm:` → `md:`, name priority | R2 |
| F11 | P2 | Calculator dead grid cell under "=" (row-span-2 vs h-14) | `calculator-button.tsx` h-full | R3 |
| F12 | P2 | RAD/DEG duplicated (toolbar toggle + pad keys) | `calculator-client.tsx` remove pad keys | R3 |
| F13 | P2 | Snippet default gradient off-palette | `background-layer.tsx` theme-aware default | R3 |
| F14 | P2 | Focus-visible bg parity (rows have it, tabs/links/close don't) | sidebar.tsx, category-tabs.tsx, panel-frame.tsx | R1 |
| F15 | P2 | Scheme select double focus ring | `scheme-picker.tsx` drop ring utilities | R1 |
| F16 | P2 | Framed-box radius drift (tip card rounded-lg vs md everywhere) | home-view.tsx | R2 |
| F17 | P2 | Copy/Reveal buttons shift width on state change | output-blocks.tsx min-w ch | R2 |
| F18 | P2 | Drawer scrim raw `bg-black/60` off-token | sidebar.tsx scheme-aware scrim | R1 |
| F19 | P2 | Hover treatment: tabs color-only vs rows bg | category-tabs.tsx | R2 |
| F20 | P2 | TERM_COLUMN re-implemented inline in prompt-bar; overlay magic width | reuse constant + derived overlay width | R4 |
| F21 | P2 | Panel title responsive size (only responsive text in family) | panel-frame.tsx pin one size | R2 |
| F22 | P2 | Suggestion key bare vs chip elsewhere — unify key recipe toward reference (bare muted key column, hierarchy from ink tiers not boxes) | prompt-bar.tsx + tool-row.tsx (deliberate design decision) | R2 |
| F23 | P2 | Mobile: prompt flush to viewport edge (safe-area) | prompt-bar safe-area padding | R5 |
| F24 | P2 | JSON toolbar stacks 3 chrome rows before content | json-editor-client grouping | R3 |
| — | — | Sidebar bottom "Privacy" hidden behind dev N badge — dev-only, not a site bug | — | — |
| — | — | Hover inversion + directional motion (title +12px/duration −12px, ~180ms) is the reference's signature row treatment — adopt on sidebar rows | tool-row.tsx | R1 |
| — | — | Reference: left-anchored 990px column vs astraa centered 768px — DELIBERATE DEVIATION (centered column + frame borders chosen) | — | — |

## Round 1 — Sidebar + logo (in progress)

Scope: F1, F14, F15, F18, hover-inversion signature, logo/grid polish.
Result: pending.

**R1 result (commit after this entry):** truncation 9→0 (all 15 short labels fit), logo `text-lg tracking-wide`, focus parity + single focus ring on scheme select, scrim tokenized (`bg-term-fg/50`), hover signature applied (brighten + slide). Harness: prompt pinned 900, no overflow, no hydration issue on fresh origin. Jury A/B/C baseline findings F1/F14/F15/F18 closed.

## Round 2 — Typography + home rhythm (done)

F4/F7/F8/F10/F16/F17/F19/F21/F22 applied (9 fixes). Verified: sidebar+chrome mono (GeistMono), status glued to summaries (0 orphans), tip card bottom-anchored, suggestion keys chip-consistent, tabs hover parity, panel title single size, Copy/Reveal width-stable, tip radius unified. Harness green (pinned 900, no overflow, no hydration issue). Commit: this round.

## Round 3 — Panels consistency (done)

F2 (json GeistMono), F3 (button gap-2, shared file — additive, reaches legacy), F11 (= stretches, dead cell gone), F12 (1/x + abs replace rad/deg keys), F13 (muted Surface gradient default, presets kept), F24 (divider regrouped; the 3-row premise was stale — current single-toolbar structure kept). Verified in browser: calculator grid correct, json font GeistMono, snippet muted. Test updated: defaults.test.ts 12→13 presets. Commit: this round.

## Round 4+5 — Prompt/scroll + themes/responsive (done, combined)

Red Team (browser, independent Playwright driver): 2×P2 word-break holes (punctuation-run echo clipping; long-token error overflow) — both fixed (`overflow-wrap:anywhere` on echo + text/error blocks). 5 scenarios clean (rapid switching, all themes, keyboard, weird URLs, 390px). Also: F6 themed caret (`caret-color: --term-accent`), F20 (TERM_COLUMN reuse in prompt-bar), F23 (safe-area bottom padding), F9 (scheme select appearance-none + drawn chevron, native dropdown kept for a11y), F5 (dracula accent → #ff79c6 pink — now visibly distinct; theme fixture tests updated to record the deliberate change). Verified: caret themed, chevron drawn, dracula pink across chips/buttons, select appearance none. Commit: this round.

## Round 6 — Red team + polish (done, folded into R4/R5 commit)

Red Team (independent Playwright driver): 2×P2 word-break holes fixed; 7 scenarios clean (rapid switching, 5 themes, keyboard tab/esc, weird URLs, clear/Ctrl+L, 390px).

## Soak — 50 consecutive verification passes (2026-10-11)

Passes 1–50: **ALL GREEN** (each pass: fresh reload → /help → /calculator → measured checks:
panel top = 0, columns equal, prompt pinned to viewport bottom, zero scrollbar space, no
overflow, no hydration error). Passes 1–5 also covered the pre-R1 state transitions; 6–50 ran
on the final build (port 3004). Mobile 390×844 spot-check: pinned + aligned + no overflow.

## Final jury acceptance

Jury C rerun on final captures (dracula, home + calculator):
- final-home: appeal 2, alignment 2, typography 2, polish 1, trust 2
- final-panel: appeal 2, alignment 2, typography 2, polish 1, trust 2
- **VERDICT: ACCEPT** — "every surface moved from ~1/2 baseline to a disciplined, thematically
  distinct state; remaining issues are minor nits, not blockers."
- Nits: (a) sidebar footer avatar overlap — that is the Next.js dev overlay, dev-only, not the
  site; (b) the RAD/DEG divider still reads slightly stray — documented as a future nit.

## Loop summary

9 commits · 6 rounds · 24 findings raised, 24 addressed or deliberately dispositioned ·
baseline jury ≈ 1.1/2 → final ≈ 1.8/2 · 50/50 soak passes green · branch feat/terminal-browser-panel.
