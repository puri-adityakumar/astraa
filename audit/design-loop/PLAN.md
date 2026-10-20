# Terminal Design Polish Fleet — 50-Pass Loop Plan

Status: PLAN (awaiting user verification — do not execute until approved)
Branch: `feat/terminal-browser-panel` (all work stays terminal-only; legacy `app/(site)/**` untouched)

---

## 1. Objective

Polish the terminal flavour's UI/UX to the quality bar of claude.dev/terminal — layout,
sidebar, logo treatment, typography rhythm, prompt, panels, themes — through an iterative,
evidence-based improvement loop driven by browser captures and screenshots, gated by a
measured verification harness and a blind visual jury, run to **50 consecutive passing
verification passes** (with early-stop on a stable perfect score).

Explicit user asks: sidebar, logo, layout polishing, layout fixing, general polish —
always benchmarked against the reference site.

## 2. Ground rules (learned this session, non-negotiable)

- Terminal-only files: `lib/terminal/**`, `components/terminal/**`, `app/terminal/**`,
  `app/globals.css` (terminal blocks only). Never touch `app/(site)/**` or shared tool
  clients unless a bug is proven to affect both flavours (AGENTS.md rule).
- Commit hooks reject multi-line messages → one-line conventional commits per round.
- Dev server gotchas: Turbopack watcher may miss tool-written edits → full restart
  (`pkill next dev` + `next-server`); browser disk cache serves stale chunks → verify on a
  never-visited origin (`127.0.0.1` → `192.168.1.6:3000` → `[::1]:3000`) or after restarts.
  A "1 Issue" hydration badge + broken layout = stale bundle, not a site bug — re-verify on
  a fresh origin before believing any finding.
- Screenshots of the calculator freeze Chromium capture → inject the animation-freeze
  `<style>` before screenshots, and separately check its reduced-motion compliance (finding).
- Keyboard/pointer events don't reach the page from the in-app browser — drive interactions
  via `dispatchEvent` / `el.click()` / `fill()`; real users are unaffected.
- Every claim must be a measurement (`getBoundingClientRect`) or a screenshot; no eyeballing.

## 3. Fleet roster (subagents)

| Role | Subagent type | Runs | Job |
|---|---|---|---|
| **Orchestrator** | main agent | continuously | Owns the loop: captures (browser-use + screenshots), dispatches subagents, keeps the ledger, runs gates, commits per round. Browser access is orchestrator-only (one shared in-app browser). |
| **Reference Analyst** | `general-purpose` (has node_repl + WebFetch) | Round 0, then on demand | Produces the **Reference Spec**: claude.dev/terminal's measurable design system — column geometry, type scale, spacing rhythm, sidebar/nav placement, prompt anatomy, borders, colors, empty states, scroll/prompt behaviors. Saved to `audit/design-loop/reference-spec.md`. |
| **UI/UX Auditor** | `Explore` (read-only) ×1–2 | every round | Audits the round's capture matrix (PNGs + measurement JSON + code) against the Reference Spec and the rubric. Emits prioritized findings (P0/P1/P2) with file-level fix pointers. Cannot edit — read-only by design. |
| **Design Jury** | `documents:visual-judge` / `presentations:visual-judge` ×3 | every round | Blind acceptance: each juror gets only the round's PNGs + the rubric (no code, no context) and returns per-surface pass/fail verdicts with evidence. Three jurors, majority rules; anonymity prevents anchoring. |
| **Implementer** | `general-purpose` ×1 (serial) | every round | Applies the Auditor's accepted findings (max 5 per round), runs `tsc`/lint/`npm test` locally, self-reports diffs. Serial to avoid edit conflicts; scoped file list per finding. |
| **Red Team** | `general-purpose` (has node_repl) | rounds 3 and 6 | Tries to break the UI: longest strings, empty/maximum states, all 6 themes + auto, zoom 80–200%, keyboard-only paths, reduced-motion, rapid panel switching. Findings join the backlog. |

Parallelism per round: captures (orchestrator) → **Auditor ×2 + Jury ×3 in parallel** (all
read-only) → Implementer (serial) → orchestrator verification harness → commit.

## 4. Surfaces × viewports matrix (what every round captures)

- Surfaces: home, `/help` output, each live panel (calculator, units, base64, hash, regex,
  json, password, currency, text, image, markdown, snippet, browser), suggestions dropdown,
  sidebar (collapsed + scrolled), drawer (mobile), theme picker.
- Viewports: 1440×900 (primary), 1920×1080, 1024×768, 768×900, 390×844 (mobile).
- Themes: auto (mocha) primary; dracula and solarized-light for contrast checks; all six in
  the theme round.
- States: empty (fresh), mid-scrollback (3+ commands), panel open (cold + warm), scrolled
  25/50/90%, suggestions open.
- Each capture set is saved to `audit/design-loop/round-XX/` with a `measurements.json`.

## 5. The rubric (10 criteria, each scored 0–2 by the Jury; ≥18/20 = pass)

1. **Alignment** — every surface on one column grid: prompt/scrollback/panel/home left+right
   edges identical; chips on the fixed key column; help kv on the shared grid (harness-verified).
2. **Sidebar & logo** — structure and rhythm vs reference: logo treatment, chip column,
   row spacing/hover, section order, bottom-anchored utilities, scrollbar styling.
3. **Prompt** — pinned at every scroll position, continuous background, slim anatomy,
   focus ring, gutter alignment, placeholder, suggestions styling.
4. **Panels** — consistent toolbar rule (switcher left / actions right), header rhythm,
   card edges on the column, empty states, close affordances.
5. **Typography** — mono/sans usage, size hierarchy, fluid behavior at breakpoints, line length.
6. **Color & contrast** — AA text contrast per theme, frame borders, accent discipline.
7. **Responsive** — 390/768/1024/1440/1920 all clean, drawer behavior, no overflow.
8. **Interaction** — keyboard-only paths, focus visibility, Esc/Tab/↑↓/Ctrl+L, scroll feel,
   hover states.
9. **Polish** — spacing rhythm vs reference spec, transitions (reduced-motion safe), pixel-level
   details (dividers, badges, truncation, tabular numbers).
10. **Regressions** — prior fixes intact (panel top = 0, prompt pinned, zero scrollbar space,
    no hydration issues, both flavours untouched).

Harness checks (measured, must be green every pass regardless of jury): panel top = 0 (3
panels), prompt pinned at 25/50/90% scroll, column equality, zero scrollbar space, chips on
grid, help kv on grid, suggestion key column, no horizontal overflow, no hydration error.

## 6. Round plan

| Round | Theme | Notes |
|---|---|---|
| R0 | Baseline | Full capture matrix, Reference Spec, jury baseline scores, ledger initialized. No edits. |
| R1 | Sidebar + logo | User's explicit asks. Logo treatment vs reference, rail spacing, section order, hover/focus states. |
| R2 | Home + typography | Banner area, intro copy block, category tabs, row rhythm, type scale. |
| R3 | Panels consistency | Toolbar rule, headers, empty states + **Red Team** pass. |
| R4 | Prompt + scroll | Suggestions styling, prompt anatomy, scroll feel, frame borders refinement. |
| R5 | Themes + responsive | All 6 schemes contrast-checked, 1920/1024/768/390 polish. |
| R6 | Red team + final polish | Edge cases, loose ends, backlog drain. |
| Soak | **50 consecutive harness passes** + final jury acceptance | All 10 rubric criteria green on every pass; commits checkpointed. |

Early-stop: if two consecutive rounds yield no P0/P1 findings AND jury plateaus ≥18/20 on all
surfaces, skip to the Soak phase. Hard cap: 8 improvement rounds regardless.

## 7. Ledger & evidence (verifiable artifacts)

- `audit/design-loop/PLAN.md` — this plan.
- `audit/design-loop/reference-spec.md` — the Reference Spec (R0 artifact).
- `audit/design-loop/ledger.md` — per-round: findings in, fixes applied, harness JSON, jury
  verdicts, commit hash. Every "pass" is a row: pass #, commit, harness result, jury score.
- `audit/design-loop/round-XX/` — screenshots + `measurements.json` per round.
- Final: before/after gallery + updated `audit/terminal-ui-audit.html` postscript.

## 8. Budget & risk

- Per round ≈ 100–150k tokens (captures + 5 subagents + harness); 8 rounds + soak ≈ 1.2–1.5M
  tokens total. Soak passes are cheap (~40s, ~5k tokens each) — 50 passes ≈ 250k.
- Risks: browser flakiness (mitigated by fresh-origin discipline), subagent edit conflicts
  (serial implementer), scope creep (max 5 fixes/round, backlog holds the rest), theme
  contrast regressions (contrast check in harness for R5+).

## 9. Out of scope

- Legacy flavour redesign; new features/commands; backend changes; dependency additions;
  renaming routes or changing flavour routing; touching shared tool clients beyond proven
  both-flavour bugs.
