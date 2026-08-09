# Plan 012: Build a product-led, server-rendered Astraa homepage

> **Executor instructions**: Rebuild the homepage as a concise product page,
> not a generic animation showcase. Preserve the Geist design language and the
> truthful copy contract from Plan 010. Keep static content in Server Components
> and isolate only necessary interactions. Capture before/after mobile
> performance and screenshots. Update `plans/README.md` after all gates pass.
>
> **Drift check (run first)**:
> `git diff --stat 94a1b1f -- app/page.tsx app/layout.tsx components/home components/content-grid.tsx components/command-menu.tsx components/footer.tsx app/globals.css lib/tools.ts lib/games.ts tests/e2e scripts/measure-performance.mjs docs/PERFORMANCE.md`
> `git status --short -- app/page.tsx app/layout.tsx components/home components/content-grid.tsx components/command-menu.tsx components/footer.tsx app/globals.css lib/tools.ts lib/games.ts tests/e2e scripts/measure-performance.mjs docs/PERFORMANCE.md`
> Plans 008–011 intentionally affect registries, copy, navigation, and tests. Compare this
> plan against their completed worktree and STOP on unexplained drift.

## Status

- **Priority**: P1
- **Effort**: L
- **Risk**: MED
- **Depends on**: Plans 008–011
- **Category**: direction
- **Planned at**: commit `94a1b1f`, 2026-08-09

## Why this matters

The current homepage is visually polished but stops after one oversized hero
and three proof tiles. It does not expose the 12 usable tools, uses Explore and
Tools as competing destinations, pushes product proof below the first mobile
viewport, and hydrates a mostly static hero. A product-led page should show a
real workflow immediately, route users to available tools, explain local versus
provider-backed processing, and preserve Astraa's restrained visual identity.

## Current state and measured baseline

- `app/page.tsx:27-28` renders only `<HeroSection />`.
- `components/home/hero-section.tsx:1` is a Client Component even though it has
  no state, effects, event handlers, or browser APIs.
- The hero imports registry counts and icons into the client graph
  (`hero-section.tsx:3-8`) and uses `min-h-[680px]`/`sm:min-h-[720px]` at line 44.
- At 390×844, the audited H1 measured about 177 px tall and the first proof tile
  began around y=800. The keyboard shortcut hint was visible on the touch layout.
- The hero's primary CTA goes to `/explore` (`hero-section.tsx:63-71`), while
  main navigation exposes both Explore and Tools (`landing-navigation.tsx:27-31`).
  `/explore` mixes tools and planned games; `/tools` is the actual live tool
  catalog.
- The hero badge says “Browser-native utility suite,” while 10 available tools
  are local and 2 are provider-backed. The counts themselves are correct.
- Repeatable production mobile baseline (`docs/PERFORMANCE.md:5-27`): homepage
  JS transfer 343.7 KB, LCP 876 ms, CLS 0.0392. CLS is the highest sampled route.
- No high-impact visual defects were found on the other catalog/tool routes;
  this plan should not redesign the entire application.

## Target information architecture

Render this order:

1. Compact hero: concrete jobs, one primary `/tools` CTA, secondary source link.
2. Fixed-size Astraa-specific SVG workflow preview showing input → local/provider
   boundary → output, with links or adjacent links to real tools.
3. Popular available tools, rendered from typed registry IDs.
4. Privacy/data-boundary proof: 10 local and 2 provider-backed from live selectors.
5. Catalog status: 12 available, planned tools/games clearly non-launchable.
6. Open-source/contributor proof with repository and contribution-guide actions.
7. One final `/tools` CTA, then the existing footer.

Main navigation should use `Tools`, `Games`, `Docs`, and `Contribute`. Plan 011
creates the Docs route. Keep
`/explore` as the combined catalog route and in secondary navigation if useful,
but do not present Explore and Tools as equivalent primary actions.

## Motion and SVG contract

- The workflow SVG is original Astraa product imagery, not a generic orbit,
  particle field, or external asset.
- Server-render fixed `viewBox`, explicit aspect ratio/size, semantic token
  colors, no external requests, and no layout shift.
- Decorative SVG is `aria-hidden="true"` and `focusable="false"`; the same
  meaning exists in adjacent HTML text.
- Animate at most a few layers with opacity/transform only. Use a short entrance
  or state transition, not continuous parallax/looping.
- `prefers-reduced-motion: reduce` renders the final static state with zero
  repeating animation. Content must never depend on motion.
- Prefer CSS on server-rendered markup. If a client island is demonstrably
  necessary, keep it smaller than the current full hero and document why.

## Commands you will need

| Purpose | Command | Expected on success |
|---|---|---|
| Homepage/browser tests | `npm run test:e2e -- --grep "homepage|home|navigation|reduced-motion"` | matching tests pass |
| Full quality | `npm run check` | exit 0 |
| Production artifact | `npm run build:e2e -- --webpack` | exit 0 |
| Mobile performance | `npm run measure:performance` | JSON includes improved homepage medians |
| Full browser suite | `npm run test:e2e` | all projects pass |

## Suggested executor toolkit

- Load `astraa-feature-workflow`, `astraa-architecture`, and
  `astraa-code-quality`.
- Use Playwright screenshots and the existing performance harness; do not add a
  screenshot-testing dependency solely for this page.

## Scope

**In scope**:

- `app/page.tsx` and `app/layout.tsx` global/homepage metadata only
- `components/home/**` (new server sections and the workflow SVG)
- `components/home/landing-navigation.tsx`
- a small shared server-rendered home tool card component if needed
- minimal homepage-specific CSS in `app/globals.css`
- homepage-related `tests/e2e/**`
- `scripts/measure-performance.mjs` and `docs/PERFORMANCE.md` only to record the
  comparable post-change result

**Out of scope**:

- Redesigning tool, game, Explore, Docs, Contribute, Privacy, header shell, or
  footer layouts beyond the explicit homepage navigation labels.
- New branding, logo, font, color system, external image, or video.
- Creating fake testimonials, usage counts, ratings, customers, or logos.
- Turning coming-soon entries into links.
- A carousel, canvas/WebGL scene, infinite animation, or scroll-jacking.
- Adding analytics or changing provider/data flows.

## Git workflow

- Suggested branch: `codex/011-product-homepage`
- Suggested commit: `feat(home): add product-led landing experience`
- Do not push, deploy, or open a PR unless asked.

## Steps

### Step 1: Capture a same-machine baseline, then make homepage data server-safe

Before the first source edit, build the current production E2E artifact and run
`npm run measure:performance`. Record the raw three samples, median, machine,
browser, and timestamp in the implementation handoff. Also capture the current
`layout-shift` entry sources so the redesign targets the actual moving node.
This same-run baseline—not the historical measurement—is the hard comparison
for Step 8.

Define a small typed `HOME_FEATURED_TOOL_IDS` list near the home components or
in a home content module. Every ID must resolve to an available tool; add a unit
test that fails for missing/coming-soon IDs. Derive these values at server render:

- available count from `availableTools.length`;
- local count from `localTools.length`;
- provider-backed count from available tools whose processing is not `local`;
- planned tool/game counts from the registries.

Do not duplicate names, paths, descriptions, icons, status, or counts in JSX.

**Verify**: the untouched baseline has three homepage samples and attributed
layout-shift sources; registry tests pass and no numeric catalog count is
hard-coded in `components/home`.

### Step 2: Convert the static hero to a Server Component

Remove the full-hero `"use client"` boundary. Keep the existing grid/border
language, but reduce mobile vertical padding and eliminate fixed minimum height
that pushes product proof below 844 px.

Apply Plan 010's voice:

- describe concrete developer/creator tasks;
- say “browser-first” rather than suggesting every tool is local;
- use `/tools` as the one primary catalog CTA;
- retain View source as a clear external secondary action;
- hide the keyboard shortcut hint on touch/small layouts or replace it with an
  actually reachable mobile search affordance.

Align `app/page.tsx` and the global defaults in `app/layout.tsx`: keep the useful
phrase “free online” at most once across root title/description, describe actual
capabilities and browser-first boundaries, and preserve one brand suffix through
the existing title template.

At 390×844, the primary CTA and at least one real tool/workflow/search affordance
must be fully visible without scrolling.

**Verify**: built HTML contains hero text, CTA, counts, and first product proof;
React hydration logs contain no mismatch; the hero module has no `"use client"`.

### Step 3: Add the fixed-size workflow SVG and product explanation

Create a server-rendered component such as
`components/home/tool-workflow.tsx`. Show an honest, simple sequence such as:

```text
input (JSON / image / value) → in-browser tool boundary → formatted/exported output
                                ↘ provider-backed rate/text badge
```

The HTML heading/copy describes the boundary; the SVG is visual reinforcement.
Use the motion/SVG contract above. Ensure strokes/text meet theme contrast and
no SVG text is the sole source of information.

**Verify**: no SVG external network requests; fixed dimensions prevent layout
shift; reduced-motion project reports no infinite animation and all layers are visible.

### Step 4: Render popular tools as server content

Build a compact grid from the curated available IDs. Each card/link must have:

- registry name and exact one-line description;
- processing badge (`In browser` or `Provider-backed`);
- valid internal `href` and visible focus;
- no Framer Motion or client state merely for entrance effects.

Do not reuse `ContentGrid` if doing so pulls its current Client Component and
Framer Motion dependency into the homepage. A small server card is preferable.

**Verify**: every card target returns 200/indexable, is keyboard reachable, and
server HTML contains its name/link before hydration.

### Step 5: Add trust, catalog, open-source, and final-action sections

Use short sections with existing tokens/components:

- explain that local tools keep input in the browser and provider-backed tools
  identify the network boundary;
- show available/planned counts from registry selectors;
- render planned entries as text/badges, never launchable cards;
- link to the repository, `/contribute`, and `CONTRIBUTING.md`'s GitHub URL as
  appropriate; do not invent social proof;
- end with one final `/tools` action.

Avoid repeating the same heading/copy/CTA in every section. Keep the footer as
the page footer rather than rebuilding its project links here.

**Verify**: a browser test checks derived counts against imports, planned items
have no anchors, and exactly the intended primary catalog CTAs target `/tools`.

### Step 6: Resolve main-navigation ambiguity

Change main navigation to `Tools`, `Games`, `Docs`, `Contribute`. Plan 011 has
created `/docs`; confirm it resolves before changing the link. Keep `/explore` reachable
through secondary catalog navigation/search if product owners still value the
combined view.

Update active-state, mobile-menu, and navigation E2E expectations. Preserve the
command menu, theme control, escape-to-close, and focus behavior.

**Verify**: desktop/mobile navigation has one unambiguous tool-catalog label,
all links resolve, and menu interaction tests pass.

### Step 7: Add explicit responsive, accessibility, and motion tests

At 320, 390, 768, 1024, and 1440 px assert:

- no horizontal overflow;
- exactly one H1 and valid heading order;
- primary CTA and first product affordance are inside the first 390×844 viewport;
- controls are at least 44 px and have visible focus/accessibility names;
- planned items are noninteractive;
- SVG has an accessible HTML equivalent;
- reduced motion has zero infinite animations and no hidden final content;
- axe has no serious/critical WCAG 2.2 violation.

Keep homepage reduced-motion assertions in `tests/e2e/accessibility.spec.ts`,
because `playwright.config.ts:42-47` intentionally limits the
`chromium-reduced-motion` project to that file. Other homepage tests run in the
normal Chromium project; do not claim every spec ran in every project.

**Verify**: normal homepage tests pass, and
`npm run test:e2e -- --project=chromium-reduced-motion tests/e2e/accessibility.spec.ts`
passes the homepage motion assertions.

### Step 8: Measure comparable performance and CLS

Compare the post-change `layout-shift` entry sources with Step 1. In particular,
compare the client-only ThemeToggle placeholder and hydrated control geometry;
make their dimensions identical if they are implicated rather than hiding the
shift with delayed content.

Build the production E2E artifact, then run the unchanged 390×844, 4× CPU,
throttled-network harness. Append a dated post-change row/section to
`docs/PERFORMANCE.md`, retaining the baseline instead of overwriting it.

Targets for the comparable median-of-three profile:

- homepage CLS <= 0.02;
- homepage LCP <= 900 ms;
- homepage JS transfer does not exceed 343.7 KB and should target <= 320 KB;
- no hydration/console error.

The hard non-regression gates compare the same-machine pre/post medians:

- JavaScript transfer <= pre-change median × 1.05;
- LCP <= pre-change median plus the greater of 10% or 100 ms;
- CLS <= pre-change median + 0.005 and no new attributable shift source;
- no hydration/console error.

If an absolute target is missed but every relative gate passes, document the
result and a focused follow-up instead of blocking or cherry-picking runs. If a
relative gate fails, repeat one complete three-run profile. STOP only when the
same relative regression reproduces twice.

**Verify**: `npm run measure:performance` emits three homepage samples; the
recorded pre/post comparison meets every relative gate and reports each absolute
target as met or missed.

### Step 9: Run full verification and visual review

Run all repository gates. Capture desktop and 390 px light/dark screenshots and
compare hierarchy, wrapping, alignment, focus, and SVG contrast. Review at 200%
zoom and with JavaScript disabled: the product story and links must remain usable.

**Verify**: `npm run check`, E2E build, performance, and full Playwright pass.

## Test plan

- Unit: curated home IDs all resolve and are available; derived counts match registries.
- E2E: first-viewport product proof, primary destinations, navigation/menu,
  planned semantics, responsive overflow, keyboard/focus, axe, reduced motion.
- Performance: median of three with the exact established mobile profile.
- Manual: light/dark desktop/mobile screenshots, zoom, JavaScript-disabled content.

## Done criteria

- [ ] Homepage exposes real available tools and honest processing boundaries.
- [ ] Root metadata contains one brand suffix and at most one intentional “free online” phrase.
- [ ] Hero is server-rendered and no longer pushes all proof below the mobile fold.
- [ ] `/tools` is the unambiguous primary destination; main nav labels are distinct.
- [ ] Original SVG adds product meaning, fixed layout, and restrained reduced-motion-safe motion.
- [ ] Planned entries remain visibly non-launchable.
- [ ] 320–1440 px has no horizontal overflow; keyboard/axe checks pass.
- [ ] Same-machine JS/LCP/CLS relative non-regression gates pass; absolute targets are recorded.
- [ ] Full repository gates pass and Plan 012 is marked `DONE`.

## STOP conditions

Stop and report if:

- The page needs invented users, ratings, customer logos, reviews, or usage proof.
- A visual requires external media/licensing or a new heavy dependency.
- `/docs` cannot be available before the navigation link ships.
- The workflow SVG becomes the only accessible source of information.
- Motion cannot render a complete static reduced-motion state.
- A same-machine performance regression crosses a relative gate in two complete profiles.
- Fixing a homepage concern requires redesigning unrelated product routes.

## Maintenance notes

- Keep home counts and cards derived from the typed registry; availability
  changes should update the page without copy edits.
- Revisit featured IDs intentionally when a new tool launches; do not promote a
  planned item to fill space.
- Field Core Web Vitals remain the post-deployment source of truth; this plan's
  lab profile is a repeatable regression signal, not a production SLA.
