# Plan 009: Repair verified route, control-semantics, and mobile defects

> **Executor instructions**: Fix only the defects enumerated here. Preserve
> current tool behavior and visual design. Add regression tests before declaring
> any item complete. Run the targeted verification after each group, then the
> full repository gates. Update `plans/README.md` when done.
>
> **Drift check (run first)**:
> `git diff --stat 94a1b1f -- app/games components/hash components/image components/units components/password components/snippet-generator components/calculator components/contribute tests/e2e`
> `git status --short -- app/games components/hash components/image components/units components/password components/snippet-generator components/calculator components/contribute tests/e2e`
> This plan targets the uncommitted completion state of Plans 001–008. Reconcile
> expected earlier changes and STOP on any unexplained behavioral drift.

## Status

- **Priority**: P1
- **Effort**: M
- **Risk**: LOW
- **Depends on**: Plan 008
- **Category**: bug
- **Planned at**: commit `94a1b1f`, 2026-08-09

## Why this matters

A complete desktop/mobile sweep found that all 12 available tools work, but
several primary controls have no accessible name or selected-state semantics,
dynamic results are silent, one registered game path returns 404, and the
mobile contribution CTAs lose their rounded edges outside the viewport. These
are narrow, reproducible defects with low-risk semantic fixes. Expanding the
route-derived test matrix prevents the same class from escaping again.

## Current state

- `lib/games.ts:75-80` registers `/games/2048`; no matching page exists. Every
  other planned game has a `200 + noindex` WIP page such as
  `app/games/snake/page.tsx:4-17`.
- `components/hash/hash-selector.tsx:25-27` renders an unnamed algorithm
  combobox; lines 42-43 render an unnamed icon-only help button.
- `components/image/image-resizer.tsx:138-143` overlays an unnamed file input.
  Width/height labels are unbound at `image-controls.tsx:59-67,93-101`, quality
  is unbound at lines 122-133, and Format is unbound at
  `format-selector.tsx:21-24`.
- `components/units/unit-converter-form.tsx:41-70,84-113` has visible From/To
  labels that are not programmatically related to the amount/unit controls;
  result updates are not announced.
- `components/password/password-generator.tsx:105-136` represents Random,
  Memorable, and PIN selection through CSS only.
- Snippet sliders have visible but disconnected labels at
  `panel/font-section.tsx:50-54` and `panel/bg-section.tsx:236-237,290-291`.
- `components/calculator/calculator-client.tsx:198-199` displays the committed
  answer in a plain span with no output/status semantics.
- `components/contribute/contribute-client.tsx:30-50` forces two padded buttons
  into one row. At 390 CSS px their measured bounds are approximately
  `x=-16..187` and `x=203..391`, clipping both outer rounded edges.
- `tests/e2e/accessibility.spec.ts:6-18` omits several live tool routes, and its
  explicit label test at lines 83-106 covers only home, Password, Currency, and
  Regex.
- `playwright.config.ts:3,23-32` lets `PLAYWRIGHT_BASE_URL` change the URL that
  Playwright probes while the start command remains hard-coded to port 3002.
  Local `reuseExistingServer` is also implicit, so an unrelated site already on
  that port can be mistaken for Astraa and produce misleading route results.
- The newly registry-derived axe sweep revealed four additional live-route
  defects that the former narrow matrix could not see: a non-focusable
  horizontally scrollable Hash guide output, three low-contrast AI Text empty
  states, two Base64 Radix tab triggers whose `aria-controls` targets do not
  exist, and a low-contrast JSON status plus non-focusable JSON scroll region.

## Commands you will need

| Purpose | Command | Expected on success |
|---|---|---|
| Isolated browser smoke | `PLAYWRIGHT_BASE_URL=http://127.0.0.1:<free-port> npm run test:e2e -- --grep "available route / survives"` | Playwright starts Astraa on the same free port and the smoke passes |
| Targeted accessibility | `npm run test:e2e -- --grep "accessible|label|announce|2048|contribute"` | matching tests pass |
| Full quality | `npm run check` | exit 0 |
| Production browser artifact | `npm run build:e2e -- --webpack` | exit 0 |
| Full browser suite | `npm run test:e2e` | all projects pass |

## Suggested executor toolkit

- Load `astraa-code-quality` and `astraa-architecture` from Plan 008.
- Use semantic HTML first; use ARIA only where native relationships are not
  available through the Radix primitive.

## Scope

**In scope**:

- new `app/games/2048/page.tsx`
- `components/hash/hash-selector.tsx`
- `components/image/image-resizer.tsx`
- `components/image/image-controls.tsx`
- `components/image/format-selector.tsx`
- `components/units/unit-converter-form.tsx`
- `components/password/password-generator.tsx`
- `components/snippet-generator/panel/font-section.tsx`
- `components/snippet-generator/panel/bg-section.tsx`
- `components/calculator/calculator-client.tsx` and display component only if required
- `components/contribute/contribute-client.tsx`
- `components/tool-guide.tsx`
- `components/text/text-generator-client.tsx`
- `components/base64/base64-mode-tabs.tsx`
- `components/base64/base64-input.tsx`
- `components/json/status-bar.tsx`
- `components/json/text-view.tsx`
- new `lib/testing/playwright-server.ts` and co-located unit test
- `playwright.config.ts`
- `tests/e2e/accessibility.spec.ts`, `tests/e2e/routes.spec.ts`, and a focused
  interaction spec if that is the clearest test home

**Out of scope**:

- Rewriting the tools or changing their visual direction.
- Launching any coming-soon game.
- Copy-system changes beyond literal accessible names; Plan 010 owns prose.
- Homepage redesign; Plan 012 owns it.
- Successful provider calls, downloads, or unrelated interaction coverage.

## Git workflow

- Suggested branch: `codex/009-route-a11y-fixes`
- Suggested commit: `fix(a11y): label tool controls and repair mobile actions`
- Do not push or open a PR unless asked.

## Steps

### Step 0: Prevent Playwright from reusing an unrelated local site

Derive the production-server hostname and port from the same validated local
`PLAYWRIGHT_BASE_URL` used by browser contexts. The `webServer.command` and
`webServer.url` must always agree. Disable implicit reuse by default; permit it
only behind an explicit opt-in environment flag for an operator who knowingly
started the matching Astraa production artifact. CI must never reuse an
existing server even if that local opt-in flag is accidentally present.

Reject non-loopback or malformed override URLs before spawning a command. Do
not interpolate unchecked URL text into a shell command. Preserve the CI
worker/retry behavior and the production fixture environment.

**Verify**: occupy one candidate port with a disposable non-Astraa HTTP server
and confirm the suite refuses to attach to it. Then choose a free loopback port
through `PLAYWRIGHT_BASE_URL` and confirm Playwright starts Astraa on that exact
port and the focused route smoke passes. Stop only the disposable processes
created by this verification. Keep the URL parsing, safe command construction,
origin/port agreement, and local-only reuse decision in a pure helper with
table-driven unit tests for valid and rejected URLs plus CI/local reuse cases.

### Step 1: Make every registered planned game path resolve consistently

Add `app/games/2048/page.tsx` by matching the existing WIP page contract:

- one unbranded title;
- accurate schedule-neutral description;
- `robots: { index: false, follow: true }`;
- canonical and Open Graph URL `/games/2048`;
- exactly one H1 through `WorkInProgress`.

Do not mark the game available or add it to the sitemap.

**Verify**: the existing unavailable-route loop receives HTTP 200 for
`/games/2048`, finds one H1, and finds `noindex`.

### Step 2: Name Hash and Image controls

For Hash:

- give the algorithm `SelectTrigger` an accessible name such as
  “Hash algorithm”;
- label the icon-only help button with the selected algorithm, e.g.
  “About SHA-256”;
- mark `HelpCircle` decorative.

For Image:

- give the file input a stable ID and a real label that describes choosing an
  image; keep the whole drop surface clickable;
- bind Width and Height labels to stable input IDs;
- label the Format trigger and Quality slider with stable IDs or
  `aria-labelledby`;
- preserve disabled semantics before a file is selected.

Do not rely on placeholder or `title` as the only accessible name.

**Verify**: Playwright can locate the Hash combobox/help button and every Image
file/spinbutton/combobox/slider by role and intended name, before and after a
fixture image is loaded.

### Step 3: Expose Unit Converter direction and result

Give source amount, source unit, destination amount, and destination unit
distinct stable names. Prefer associated `<Label htmlFor>` for native inputs
and explicit trigger names for Radix Select.

Represent the changing result with a labelled `<output>` or an equivalent
read-only control plus a separate polite status. Announce only meaningful
computed-value changes, not every intermediate keystroke. Include value and
unit in the accessible result.

**Verify**: after entering `100` for Celsius to Fahrenheit, Playwright resolves
all four controls by unique names and observes a polite result containing
`212` and Fahrenheit.

### Step 4: Expose selection and dynamic result semantics

- Password: implement a labelled tablist/radiogroup, or a labelled button group
  with `aria-pressed={mode === ...}`. The selected mode must be programmatically
  determinable and keyboard reachable without changing generation behavior.
- Snippet: connect names for Font size, Gradient angle, and Background image
  opacity sliders; preserve current value/min/max semantics.
- Calculator: render a named output and announce only a committed calculation
  result politely. Avoid making every digit/key press noisy.

**Verify**: tests assert exactly one selected password mode, all three sliders
by accessible name, and a `2 + 3 = 5` committed calculator announcement.

### Step 5: Prevent mobile contribution CTA clipping

Make the CTA group wrap or stack below the small breakpoint, keep every target
at least 44 px, and constrain each button/link within the content box. Preserve
the desktop two-button row and visible rounded edges.

Add a 390×844 assertion that each CTA bounding box satisfies
`left >= 0` and `right <= document.documentElement.clientWidth`; also assert no
horizontal page overflow.

**Verify**: the mobile test passes for both `Star on GitHub` and `Report Issue`.

### Step 6: Make accessibility coverage registry-derived

Expand the axe route matrix to include every available tool path using
`getIndexablePaths()` or the typed registry, while retaining intentional static
and 404 cases. Avoid duplicating a stale hard-coded tool list.

Add explicit role/name/state checks for the defects above. Axe alone does not
detect every unnamed composite-control workflow or missing live announcement.
Run both normal and reduced-motion projects.

**Verify**:

- every `availableTools` path appears in the accessibility matrix;
- no visible button on any available route has an empty accessible name;
- axe reports no serious/critical WCAG 2.2 issues;
- all new semantic assertions pass.

### Step 6A: Repair serious defects exposed by the complete matrix

Fix the four newly evidenced route-local failures without weakening axe or
excluding routes:

- make ToolGuide example code regions keyboard-scrollable with useful names,
  preserving visible code and semantics;
- use accessible semantic foreground tokens for AI Text's provider notice and
  empty-state text in light and dark themes;
- replace the two Base64 selector-only Radix Tabs instances with correctly
  labelled pressed-button groups (or wire real controlled panels); never emit
  `aria-controls` references to absent elements;
- make JSON's valid status text meet 4.5:1 and make its actual overflow region
  keyboard reachable without obscuring the CodeMirror editor.

Keep the fixes in the narrow owning components above. Do not modify the shared
Radix Tabs primitive or change Base64/JSON behavior.

**Verify**: rerun the exact registry-derived axe sweep in light mode and the
reduced-motion project. `/tools/hash`, `/tools/text`, `/tools/base64`, and
`/tools/json` have zero serious/critical violations; Base64's selectors retain
one selected state per group and remain keyboard reachable.

### Step 7: Run full gates and re-sweep affected routes

Run the full commands. Manually verify affected routes at 1440×900 and 390×844
in light/dark modes, including keyboard operation. Treat console errors,
hydration warnings, clipped controls, and new horizontal overflow as failures.

**Verify**: `npm run check`, E2E build, and full Playwright suite all pass.

## Test plan

- WIP route regression: `/games/2048` is 200, canonical, noindex, one H1.
- Role/name tests: Hash, Image, Units, Password, Snippet, and Calculator.
- State/update tests: password selected mode, Unit and Calculator live results.
- Responsive test: Contribute CTAs remain inside a 390 px viewport.
- Registry-derived axe sweep: every available route under normal and reduced
  motion, no serious/critical findings.
- Newly exposed live routes: Hash scroll region, AI Text contrast, Base64
  selector relationships, and JSON contrast/scroll focus all regress directly.
- Test-server isolation: a conflicting local site is never reused implicitly,
  and an overridden loopback port drives both the probe and start command.
- Playwright configuration units: valid 127.0.0.1/localhost/IPv6 loopback
  origins, malformed/remote/injectable inputs, safe command construction, and
  local-versus-CI reuse decisions.

## Done criteria

- [ ] `/games/2048` matches peer planned routes and remains non-indexable.
- [ ] All enumerated controls have unique programmatic names.
- [ ] Password selection and Unit/Calculator result changes are exposed to assistive technology.
- [ ] Both contribution CTAs fit at 390 px without page overflow.
- [ ] Accessibility coverage cannot omit a newly available tool silently.
- [ ] The complete matrix has no serious/critical Hash, AI Text, Base64, or JSON
  violations, and no route is suppressed to obtain that result.
- [ ] Playwright cannot silently run the Astraa suite against another local
  application, and its URL override controls the actual server port.
- [ ] `npm run check`, E2E build, and full Playwright pass.
- [ ] `plans/README.md` marks Plan 009 `DONE`.

## STOP conditions

Stop and report if:

- Fixing a label requires changing a shared primitive API for all consumers;
  propose that separately instead of broadening this patch silently.
- A live region becomes noisy during typing or duplicates browser announcements.
- The 2048 registry entry has intentionally been removed by an approved product decision.
- A tool's behavior changes beyond the semantic/responsive defect described here.
- The configured E2E URL is non-loopback or cannot be converted into a safe
  hostname/port pair without shell interpolation.
- A full verification gate fails twice after a focused fix.

## Maintenance notes

- Axe is a floor, not proof of accessible interaction; keep explicit name,
  selected-state, live-result, and viewport assertions.
- When a registry item becomes available, route-derived tests must pick it up
  without a manual route-list edit.
