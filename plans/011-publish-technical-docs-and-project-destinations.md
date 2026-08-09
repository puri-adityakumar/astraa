# Plan 011: Publish technical docs and correct every project destination

> **Executor instructions**: Make the existing repository documentation the
> canonical source for a statically generated, indexable `/docs` section. Keep
> Roadmap, Changelog, and Hall of Fame as direct Notion destinations; do not
> scrape, iframe, or duplicate their content. Use the tracked skills from Plan
> 008 and preserve one source of truth. Update `plans/README.md` after all gates.
>
> **Drift check (run first)**:
> `git diff --stat 94a1b1f -- docs app/docs components/docs components/footer.tsx components/home/landing-navigation.tsx README.md lib/docs lib/seo/site.ts app/sitemap.ts package.json scripts tests/e2e`
> `git status --short -- docs app/docs components/docs components/footer.tsx components/home/landing-navigation.tsx README.md lib/docs lib/seo/site.ts app/sitemap.ts package.json scripts tests/e2e`
> Plans 008–010 intentionally change contributor procedures, copy, and tests.
> Reconcile their completed worktree and STOP on an unexplained mismatch.

## Status

- **Priority**: P1
- **Effort**: L
- **Risk**: MED
- **Depends on**: Plans 008–010
- **Category**: docs
- **Planned at**: commit `94a1b1f`, 2026-08-09

## Why this matters

“Docs” currently opens the Roadmap in both the site footer and README, while the
real architecture and development material exists only as repository Markdown.
At the same time, the Notion `/documentation` page is a gallery of community X
posts, not technical documentation. This phase creates a first-class `/docs`
section from the existing files, exposes architecture to users/contributors,
and gives Roadmap, Changelog, and Hall of Fame stable, truthful destinations.

## Current state

- Public Markdown sources are indexed in `docs/README.md:1-8`:
  Architecture, Components, Server interfaces, Development, Performance, SEO.
- `app/privacy/page.tsx:18-27` establishes a simple server-read and
  server-rendered Markdown pattern.
- `react-markdown`, `remark-gfm`, `remark-math`, `rehype-katex`, and Mermaid are
  already dependencies (`package.json:64,72-75`); do not add a docs framework
  solely for seven documents.
- Architecture and Components contain Mermaid fences (`docs/ARCHITECTURE.md:8`,
  `docs/COMPONENTS.md:10`). The editor preview dynamically loads Mermaid with
  `securityLevel: "strict"` (`components/markdown/preview.tsx:30-38`).
- Every docs source has exactly one Markdown H1 today.
- `components/footer.tsx:15-18` points Roadmap and Docs to the same Roadmap URL.
- `README.md:17-22` repeats that defect and has a generic Blog badge.
- `lib/seo/site.ts:14` omits `/docs` and all documentation pages from the static
  indexable path list.
- `lib/seo/site.test.ts:26` hard-codes `5 + availableTools.length` paths.
- `tests/e2e/routes.spec.ts` and `tests/e2e/seo.spec.ts` already loop over
  `getIndexablePaths()`, so a correct manifest can extend baseline route/SEO
  coverage automatically.
- The browser audit on 2026-08-09 verified these live Notion titles:
  - `https://astraa.notion.site/roadmap` → Roadmap
  - `https://astraa.notion.site/changelog` → Changelog
  - `https://astraa.notion.site/documentation` → Tweets/Posts

## Canonical ownership and public-link contract

Plan 008 established this ownership split:

- `docs/*.md`: public factual/explanatory documentation rendered at `/docs`;
- `CONTRIBUTING.md`: human issue/PR/release policy;
- `.agents/skills/astraa-*`: agent-only procedures/checklists;
- `AGENTS.md`/`CLAUDE.md`: thin skill registries;
- package scripts/CI: executable verification truth.

Use exactly these destinations:

| Label | Site destination | README destination |
|---|---|---|
| Docs | `/docs` | `https://www.astraa.tech/docs` |
| Roadmap | `https://astraa.notion.site/roadmap` | same |
| Changelog | `https://astraa.notion.site/changelog` | same |
| Hall of Fame | `https://astraa.notion.site/documentation` | same |

The Notion `/documentation` destination must never be labelled Docs. Removing
or renaming content inside Notion is external work and not authorized here.

## Public docs manifest

Use an explicit immutable typed manifest:

| Route | Source |
|---|---|
| `/docs` | `docs/README.md` |
| `/docs/architecture` | `docs/ARCHITECTURE.md` |
| `/docs/components` | `docs/COMPONENTS.md` |
| `/docs/server-interfaces` | `docs/API.md` |
| `/docs/development` | `docs/DEVELOPMENT.md` |
| `/docs/performance` | `docs/PERFORMANCE.md` |
| `/docs/seo` | `docs/SEO.md` |

Each entry also owns a concise title, description, slug, source key, and order.
Do not discover routes by recursively reading arbitrary filenames.

## Commands you will need

| Purpose | Command | Expected on success |
|---|---|---|
| Docs invariant gate | `npm run check:docs` | exit 0 |
| Docs/unit tests | `npm test -- lib/docs lib/seo` | all pass |
| Full quality | `npm run check` | exit 0 |
| Production artifact | `npm run build:e2e -- --webpack` | all docs routes prerender |
| Docs/SEO/accessibility E2E | `npm run test:e2e -- --grep "docs|@seo|accessib"` | matching tests pass |
| Full browser suite | `npm run test:e2e` | all projects pass |

## Suggested executor toolkit

- Load `astraa-feature-workflow`, `astraa-architecture`, and
  `astraa-code-quality`.
- Prefer the current server-rendered Privacy page as the starting pattern, then
  add the strict manifest and link handling required here.

## Scope

**In scope**:

- `docs/*.md`
- new `lib/docs/catalog.json`, `lib/docs/catalog.ts`, `lib/docs/content.ts`, and tests
- new `lib/project-links.json`, `lib/project-links.ts`, and tests
- new `app/docs/page.tsx`, `app/docs/[slug]/page.tsx`
- new `components/docs/**`
- `components/footer.tsx`
- `components/home/landing-navigation.tsx` for the planned Docs link
- `README.md`
- `lib/seo/site.ts`, `lib/seo/site.test.ts`, `app/sitemap.ts` if required
- new `scripts/check-docs.mjs`
- `package.json`
- relevant `tests/e2e/**`

**Out of scope**:

- A CMS, Notion API/sync, docs search, versioning, i18n, comments, or auth.
- Scraping/embedding Roadmap, Changelog, or Hall of Fame.
- Editing the external Notion page title/content.
- Raw HTML/MDX execution or arbitrary filesystem routing.
- Hall of Fame tweet ingestion, cards, metrics, or moderation.
- Rewriting generic third-party skills.
- Invented last-modified dates.

## Git workflow

- Suggested branch: `codex/012-public-docs`
- Suggested commits:
  `feat(docs): publish repository documentation routes` and
  `fix(navigation): correct project destinations`.
- Do not push, deploy, submit a sitemap, or request indexing unless asked.

## Steps

### Step 1: Separate public facts from procedures without losing content

Review every `docs/*.md` against Plan 008's ownership contract:

- retain factual architecture, component topology, server-interface contracts,
  setup/environment variable names, dated performance evidence, SEO baseline,
  and operator checks that make sense to human readers;
- replace duplicated step-by-step agent page templates, code-style matrices,
  and feature completion checklists with concise links to the three tracked
  skills and `CONTRIBUTING.md`;
- keep all issue/assignment/PR/release rules only in `CONTRIBUTING.md`;
- never replace dated measured evidence with timeless marketing claims.

Every source must retain exactly one H1 and a unique introductory description.

**Verify**: `npm run check:docs` (added in Step 6) reports one H1 per source,
unique manifest mapping, and no broken local Markdown link.

### Step 2: Create a browser-safe docs catalog and server-only content loader

Create `lib/docs/catalog.json` as the one machine-readable manifest and
`lib/docs/catalog.ts` as its typed, immutable wrapper. The wrapper must contain
no `fs`, `path`, or `server-only` import so sitemap/navigation/tests can consume
route metadata safely. `scripts/check-docs.mjs` must read the JSON source
directly rather than regex-parsing TypeScript or duplicating the manifest.

Create `lib/docs/content.ts` with `import "server-only"`. Resolve content only
through the manifest's fixed source keys and an allowlisted absolute mapping.
Never join an untrusted slug directly into a filesystem path. Return a typed
not-found result for unknown entries.

Add pure helpers that rewrite known relative `.md` links to manifest routes and
reject links that point outside the documented source map.

**Verify**: unit tests cover every manifest entry, unknown slug, traversal-like
input, unique route/source/order, and all relative Markdown link rewrites.

### Step 3: Build statically generated `/docs` routes

Implement:

- `app/docs/page.tsx` for `docs/README.md`;
- `app/docs/[slug]/page.tsx` with `generateStaticParams()` and
  `dynamicParams = false` for the six child routes;
- manifest-derived unbranded metadata, canonical, Open Graph/Twitter URL, and
  unique descriptions;
- `notFound()` for any unknown slug.

The Markdown source supplies the sole H1. Do not add a second route-shell H1.
Keep all prose server-rendered and usable before JavaScript.

**Verify**: production build lists all seven docs routes as prerendered; unknown
`/docs/nope` is 404/noindex; every real page has one H1 and its canonical.

### Step 4: Add semantic docs layout and safe Markdown rendering

Create small server-first components for breadcrumbs, current-page navigation,
previous/next links, and the Markdown article. Requirements:

- visible skip/focus behavior inherited from the application shell;
- current navigation indicated programmatically;
- mobile navigation fits 320 px without horizontal page overflow;
- GitHub-flavored Markdown and math render from existing dependencies;
- raw HTML remains escaped/rejected—do not add `rehype-raw`;
- headings receive stable linkable IDs without duplicate IDs;
- tables/code blocks scroll within their own container;
- internal `.md` links use manifest routes, external links are identifiable and
  use safe `rel` behavior if opened in a new tab.

For Mermaid, use a narrow optional Client Component that loads the existing
package only on explicit request or when the diagram enters the viewport, sets
strict security, and progressively enhances a visible source/prose fallback.
Use deterministic IDs and a cancellation guard. A diagram error must leave
readable source, not an empty block; Mermaid must not enter global or initial
non-diagram bundles.

**Verify**: JavaScript-disabled docs remain complete; Mermaid source remains
available on load/error; axe and keyboard navigation pass in both themes.

### Step 5: Add docs to indexability and sitemap truth

Export docs paths from the browser-safe catalog and include all seven in
`getIndexablePaths()`. Do not hard-code an aggregate count in the test; derive
expectations from static base paths, docs paths, and available registries.

Do not assign `lastModified` unless a source has an explicitly maintained,
evidence-backed date. The dated Performance content may state its measurement
date in prose without becoming sitemap freshness.

The existing route/SEO loops must cover all docs pages automatically. Add docs
routes to the accessibility matrix through the same manifest, not another
independent list.

**Verify**: sitemap contains each docs canonical once, every docs route is
indexable, and unknown docs routes are absent/noindex.

### Step 6: Add docs and project-link drift validation

Create `lib/project-links.json` as the machine-readable canonical link contract
and a typed immutable `lib/project-links.ts` wrapper for the footer/tests. The
README necessarily duplicates these URLs as Markdown, so the validator compares
it against the JSON contract.

Create `scripts/check-docs.mjs` with Node standard-library APIs. It reads both
JSON contracts directly and must fail on:

- missing/duplicate manifest source, slug, route, title, or description;
- missing source file or source with not exactly one H1;
- unresolved relative `.md` link;
- footer/README project labels that violate the exact link contract;
- a README Docs link that points to Notion;
- the Hall of Fame URL labelled Docs or Blog;
- Roadmap/Changelog URL swap.

Add `check:docs` to `npm run check`, alongside Plan 008's `check:skills`.

**Verify**: `npm run check:docs` exits 0; a disposable fixture mutation makes it
fail nonzero, then is restored without disturbing user work.

### Step 7: Switch footer, README, and navigation destinations

Update the footer project column to consume the typed project-link wrapper for
Docs, Roadmap, Changelog, Hall of Fame, and Privacy. Internal `/docs` stays
same-tab; Notion links retain safe external behavior.

Replace README's duplicate Roadmap/Docs and generic Blog badges with the exact
four labels/destinations. Add a concise documentation section linking the public
site and repository sources without duplicating the docs corpus.

Add Docs to main navigation as required by Plan 012. Verify mobile/desktop
active states for `/docs` and `/docs/*`.

**Verify**: the link validator and Playwright tests confirm every label/href,
internal/external behavior, and mobile menu accessibility.

### Step 8: Test rendering, metadata, mobile, and failure behavior

Add unit and Playwright coverage for:

- manifest and allowlisted read mapping;
- internal Markdown link conversion;
- exactly one H1 and stable heading IDs;
- docs navigation, previous/next, active state, and keyboard reachability;
- 320/390 px no overflow and dark/light readability;
- Mermaid fallback with JavaScript disabled and forced render failure;
- canonical/title/description/robots/sitemap membership;
- external project-link labels and safe semantics;
- zero serious/critical WCAG 2.2 violations and zero console/hydration errors.

**Verify**: targeted docs/SEO/accessibility tests pass in normal and
reduced-motion projects.

### Step 9: Run full gates and inspect the production artifact

Run the full quality, production E2E build, and Playwright suite. Inspect the
built HTML for `/docs`, `/docs/architecture`, and `/docs/components` to confirm
source content is present without client execution. Review at 390 and 1440 px.

**Verify**: all commands exit 0 and only in-scope files are modified.

## Test plan

- Unit: manifest completeness/uniqueness, allowlisted loading, traversal denial,
  link rewrite, heading uniqueness, sitemap membership, project-link constants.
- Static gate: every Markdown source and footer/README link contract.
- E2E: all seven routes, unknown route, navigation, mobile/dark/light,
  JavaScript-disabled content, Mermaid fallback, keyboard/axe, metadata/sitemap.
- Existing full route/SEO loops must include docs without duplicating route lists.

## Done criteria

- [ ] `/docs` and six child routes render the canonical Markdown sources statically.
- [ ] No route accepts an arbitrary filesystem path or raw HTML execution.
- [ ] Every docs route has one H1, one canonical, unique metadata, and sitemap membership.
- [ ] Docs are usable at 320 px, with keyboard, reduced motion, dark/light, and JavaScript disabled.
- [ ] Footer/README use the exact Docs, Roadmap, Changelog, Hall of Fame contract.
- [ ] `astraa.notion.site/documentation` is never labelled Docs or Blog.
- [ ] `npm run check:docs`, full quality, E2E build, and Playwright pass.
- [ ] Plan 011 is marked `DONE` in `plans/README.md`.

## STOP conditions

Stop and report if:

- A fact cannot be assigned to exactly one canonical ownership source.
- Rendering would require raw HTML, unsanitized diagram output, or arbitrary filesystem access.
- A source needs credentials, private links, or secret values to be public.
- The external Notion destinations no longer match the verified roles.
- Symlink/skill migration from Plan 008 is incomplete and docs would reintroduce duplicated procedures.
- Docs cause a serious axe, metadata/sitemap mismatch, hydration error, or material bundle regression.
- Any full gate still fails after two focused attempts.

## Maintenance notes

- Add public docs by extending the explicit manifest and its tests; never expose
  the whole repository filesystem.
- Roadmap/Changelog/Hall of Fame remain external sources. An internal mirror or
  Notion sync is a separate product/operations decision.
- Plan 012 depends on this plan so its main navigation can ship a valid Docs link.
