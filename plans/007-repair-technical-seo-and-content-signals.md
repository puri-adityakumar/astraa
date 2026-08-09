# Plan 007: Make crawl, metadata, schema, and content signals accurate

> **Executor instructions**: Separate technical corrections from keyword/content
> experiments. Never fabricate freshness, availability, reviews, usage counts,
> or local-processing claims. Run all verification gates and update
> `plans/README.md` when complete.
>
> **Drift check (run first)**:
> `git diff --stat 94a1b1f..HEAD -- app/layout.tsx app/page.tsx app/sitemap.ts app/robots.ts app/tools app/games app/explore app/contribute app/privacy components/home components/explore components/content-grid.tsx lib/tools.ts lib/games.ts`
> Plans 001, 005, and 006 intentionally change some of these paths. Reconcile
> their final registry/route behavior first; unexplained drift is a STOP
> condition.

## Status

- **Priority**: P2
- **Effort**: M
- **Risk**: LOW
- **Depends on**: Plans 001, 005, and 006
- **Category**: direction
- **Planned at**: commit `94a1b1f`, 2026-08-08

## Why this matters

Astraa already has useful fundamentals—canonical URLs, per-route metadata,
Open Graph fields, robots, a sitemap, semantic H1s, and strong internal
navigation. The damaging issues are inaccurate signals: current-time freshness,
double-branded titles, a schema search action with no search UI, “available”
counts that include coming-soon items, and local-only claims for networked
tools. Correcting those signals builds trust before adding intent-specific
content and internal links.

## Current state

- Root title template is `%s | Astraa` (`app/layout.tsx:20-23`), while regex and
  Markdown page titles already include `| astraa`
  (`app/tools/regex/page.tsx:5`, `app/tools/markdown/page.tsx:6`). Rendered titles
  are `Regex Tester | astraa | Astraa` and
  `Markdown Editor | astraa | Astraa`.
- Root metadata and homepage claim 15+ tools and all-local processing
  (`app/layout.tsx:24-26,57-72`, `app/page.tsx:5-18`). The hero says 14+
  (`components/home/hero-section.tsx:8-18`). The audited registry contains 14
  tools, 12 available tools, and 2 coming soon.
- All seven registered games are `comingSoon`
  (`lib/games.ts:12-64`), but `/games` is indexable, included in the sitemap,
  and says users can play free games (`app/games/page.tsx:4-20`).
- `/explore` labels raw registry lengths as “available”
  (`components/explore/explore-client.tsx:47-69,104-106`), so it reports
  unavailable tools/games as available.
- `components/content-grid.tsx:54-60` turns coming-soon items into focusable
  links to `#` with `aria-disabled`; they are not useful crawl targets or honest
  controls.
- Global JSON-LD emits a `WebApplication` on every route and sets
  `dateModified` to today (`app/layout.tsx:110-125`). It also emits a
  `SearchAction` to `/explore?q=...` (`app/layout.tsx:126-135`), but
  `components/explore/explore-client.tsx` never reads search params and renders
  no search input.
- Google retired the sitelinks search box in November 2024, removing the only
  practical reason for this nonfunctional SearchAction:
  <https://developers.google.com/search/blog/2024/10/sitelinks-search-box>.
- Every sitemap entry uses `new Date()` and declares priority/change frequency
  (`app/sitemap.ts:8-67`). Google ignores priority/changefreq and may stop
  trusting inaccurate lastmod:
  <https://developers.google.com/search/blog/2023/06/sitemaps-lastmod-ping>.
- Twelve tool pages compute and display the current month as “Last updated” on
  each render/build (for example `app/tools/password/page.tsx:36-47` and
  `app/tools/regex/page.tsx:36-47`), regardless of content changes.
- Rendered main-content sampling found many utility pages with 26–61 words.
  Utility function can satisfy intent without long prose, but key pages lack
  server-rendered usage, limitation, privacy, and related-tool context.
- `/contribute` was an indexable error page during audit; Plan 001 must fix it
  before this phase validates crawl output.
- No production Google Search Console query/page export or field Web Vitals was
  available, so keyword priority and ranking-loss diagnosis remain unverified.

Google's title guidance favors concise, descriptive, non-repetitive titles:
<https://developers.google.com/search/docs/appearance/title-link>. Next's title
template behavior is documented at
<https://nextjs.org/docs/app/api-reference/functions/generate-metadata>.

## Commands you will need

| Purpose | Command | Expected on success |
|---------|---------|---------------------|
| SEO unit tests | `npm test -- lib/seo` | metadata/sitemap invariants pass |
| Browser SEO | `npm run test:e2e -- --grep @seo` | all indexability assertions pass |
| Typecheck | `npm run typecheck` | exit 0 |
| Lint | `npm run lint` | exit 0, zero warnings |
| Build | `npm run build` | exit 0, expected static/dynamic routes |

## Scope

**In scope**:

- `app/layout.tsx`, `app/page.tsx`, `app/sitemap.ts`, `app/robots.ts`
- page metadata under `app/tools/**`, `app/games/**`, `app/explore`,
  `app/contribute`, and `app/privacy`
- `lib/tools.ts`, `lib/games.ts`
- a small typed SEO/content module under `lib/seo/`
- `components/home/hero-section.tsx`
- `components/explore/explore-client.tsx`
- `components/tools/tools-client.tsx`, `components/games/games-client.tsx`
- `components/content-grid.tsx`
- a reusable server-rendered tool guide/related-tools component and unique
  content data
- SEO tests under `lib/seo/` and Plan 006's `tests/e2e/`

**Out of scope**:

- Buying links, mass-generated keyword pages, or generic word-count padding.
- Promising a ranking position or traffic result.
- Implementing the retired SearchAction target solely for schema.
- Publishing/removing production URLs, submitting sitemaps, or requesting
  indexing without operator approval.
- Legal/privacy wording beyond consuming Plan 004's approved factual copy.
- Changing the Astraa brand name.

## Git workflow

- Branch: `codex/007-technical-seo`
- Suggested commits:
  `fix(seo): make metadata and crawl signals truthful` and
  `feat(content): add useful tool guidance and related links`.
- Target `development`; do not deploy, submit, or request recrawl without the
  operator.

## Steps

### Step 1: Capture a production search baseline before changing copy

If the operator can provide access/exports, collect the last 3 and 6 months from
Google Search Console and Bing Webmaster Tools:

- page/query clicks, impressions, CTR, and average position;
- indexed/excluded URL counts and reasons;
- submitted sitemap status;
- Core Web Vitals by route group;
- manual actions/security issues;
- top landing pages and query cannibalization.

Store only aggregate data in a dated internal audit document; do not commit user
identifiers. Build a query-to-page intent map and label each planned title/copy
change `evidence-backed` or `technical-only`.

If no access exists, record that limitation and continue with technical truth
fixes. Do not invent keyword volumes or claim a traffic drop.

**Verify**: baseline has source, export date/range, site property, and a list of
unavailable data. No credential or personal query data is committed.

### Step 2: Make the registry the source of availability and processing truth

Extend the typed registry minimally so each item can answer:

- stable ID and canonical path;
- status (`available` or `coming-soon`);
- processing (`local`, `server`, or `hybrid`);
- concise truthful description;
- optional explicit `updatedAt` date only when maintained from a real release;
- related tool IDs for internal links.

Export pure selectors such as `availableTools`, `availableGames`, and lookup by
path. Use them for counts, catalog rendering, sitemap, metadata claims, and WIP
tests. Do not duplicate status/count constants in components.

Classify text generation and currency/crypto conversion as server/networked;
classify mixed tools accurately. “Most processing stays on your device” is
acceptable only where the registry supports it.

**Verify**: unit tests assert the audited 12/0 available count at the starting
state (or the reconciled post-Plan-005 count) and fail when a new route lacks
status/processing metadata.

### Step 3: Correct titles, descriptions, counts, and indexability

Remove `| astraa` from child `metadata.title` values so the root template adds
the brand once. Keep Open Graph/Twitter titles readable and branded once where
appropriate. Derive homepage/catalog counts from available items or avoid a
number entirely when it adds little value.

Rewrite claims to match processing classification. In particular, do not say
all tools process locally on root/tools/privacy pages. Keep descriptions concise
and intent-specific; use Search Console evidence where available.

When `availableGames.length === 0`:

- make `/games` an honest coming-soon page with `robots: { index: false,
  follow: true }`;
- remove it from sitemap;
- do not advertise playable games from homepage/explore metadata;
- keep individual WIP routes noindex.

Define a test/launch switch so shipping the first complete game forces a review
that enables indexability and content rather than silently inheriting noindex.

**Verify** in built HTML:

- no `<title>` contains `Astraa`/`astraa` twice;
- descriptions contain no false all-local or playable-game claim;
- available counts exactly match registry selectors;
- WIP/empty game routes emit noindex.

### Step 4: Simplify and validate structured data

Keep only globally accurate Organization and WebSite nodes. Remove the global
WebApplication node, its fabricated daily modification date, and SearchAction.
Use stable, evidence-backed dates only. Serialize JSON-LD with a helper that
escapes `<` if any registry/user-maintained content enters it.

Add per-tool `SoftwareApplication` or other schema only when the visible page
supports every field and the type is useful. Do not add ratings, review counts,
usage counts, author claims, FAQ schema, or features not visible on the page.
Validate output against Schema.org/Google tools but remember that valid schema
does not guarantee a rich result.

**Verify**: JSON parses, has one consistent canonical URL per node, contains no
SearchAction/current-time field, and the E2E suite finds no duplicate global
node IDs.

### Step 5: Make sitemap and visible freshness evidence-based

Remove `priority` and `changeFrequency`. Include only canonical indexable URLs.
Use `lastModified` only for entries with an explicit maintained `updatedAt`;
otherwise omit it. Do not derive it from the build time.

Replace all render-time “Last updated” months with the same explicit release
date or remove the line. Centralize the UI in one component so a future date
cannot drift from the sitemap. Privacy policy may keep its separately maintained
effective date.

Keep `robots.ts` allowing public pages and disallowing API paths; verify it does
not conflict with page-level noindex. Robots disallow is not a substitute for
noindex because blocked pages cannot expose the directive.

**Verify**:

- `rg -n "lastModified: new Date|new Date\(\).*toLocaleDateString|changeFrequency|priority:" app`
  returns no matches for SEO freshness.
- `/sitemap.xml` contains every and only indexable canonical route once.
- Every sitemap `lastmod`, if present, matches an explicit registry/policy date.

### Step 6: Fix catalog semantics and internal links

Render coming-soon cards as non-interactive `<article>`/`div` cards, not links
to `#`. Count only available items as available; label total/planned separately
only when useful. Make every actual internal navigation a crawlable `<a href>`
through Next Link with descriptive text.

Add a short related-tools block to each available tool based on typed registry
IDs. Links should connect genuine adjacent tasks—for example JSON ↔ Base64 /
Markdown / regex where relevant—not repeat the same generic list everywhere.
Avoid orphan pages and avoid linking to WIP routes as if usable.

Google's crawlable-link/internal-link guidance is at
<https://developers.google.com/search/docs/crawling-indexing/links-crawlable>.

**Verify**:

- `rg -n 'href=\"#\"' components app` finds no coming-soon navigation.
- Every available tool has at least two valid related internal links where
  genuine adjacent tools exist; targets are indexable and return 200.
- Keyboard tab order skips noninteractive coming-soon cards.

### Step 7: Add useful server-rendered tool guidance by search intent

Create one semantic server-rendered guide component placed after each client
tool UI. Feed it unique typed content, not copied boilerplate. For prioritized
pages, include only useful sections:

- concise how-to steps;
- supported input/output formats and limits;
- one or two concrete examples;
- local/server processing disclosure;
- limitations and safety notes;
- related tools.

Start with the pages that have Search Console demand. Without that data,
prioritize high-utility/complex pages: password, JSON, regex, Markdown, Base64,
hash, currency, image, and snippet generator. Do not add claims such as “secure,”
“real-time,” or “private” unless the implementation and Plan 004 support them.

Keep the interactive tool above the guide so utility intent is satisfied
immediately. Avoid FAQ markup unless there is a genuine visible FAQ and an
eligible search feature.

**Verify**: built HTML contains the guide text without JavaScript, heading order
is valid, examples match actual tool output, and no two pages share a large
identical paragraph block.

### Step 8: Validate, deploy, and monitor as separate gates

Run unit, browser SEO, type, lint, and build gates. Crawl the production build
locally and assert status, canonical, robots, H1, title, description, JSON-LD,
and sitemap membership for every route. Check mobile rendering and ensure guide
content does not create excessive layout shift.

After an operator-approved deployment:

- inspect the live headers/HTML, not only local output;
- validate structured data on representative URLs;
- submit the corrected sitemap in Search Console/Bing if access is authorized;
- annotate the deployment date and compare 28-day and 90-day query/page trends;
- investigate CTR/ranking changes page by page rather than reverting all copy
  from aggregate noise.

**Verify**: the automated crawl has zero inconsistent/indexable error route and
the post-deploy checklist records live URL, deployment SHA, and observation
dates.

## Test plan

- `lib/seo` unit tests cover registry selectors, unique canonicals, title suffix,
  availability/indexability, processing claims, structured-data JSON, and
  sitemap membership.
- Plan 006's production E2E crawl adds `@seo` assertions for every canonical
  route and makes console/error-boundary failures fatal.
- Snapshot only small stable metadata objects; do not snapshot entire pages.
- Manually review examples/content for functional truth and readability.

## Done criteria

- [ ] Titles contain one brand suffix and descriptions/counts are registry-true.
- [ ] Zero-available games and all WIP routes are noindex and absent from sitemap.
- [ ] Global schema has no fake daily freshness or nonfunctional SearchAction.
- [ ] Sitemap has only canonical indexable URLs and evidence-backed dates.
- [ ] Visible “Last updated” dates are explicit or removed.
- [ ] Coming-soon cards are not fake links and related links are contextual.
- [ ] Priority tools contain unique, useful, server-rendered guidance.
- [ ] SEO unit/browser gates, typecheck, lint, and build pass.
- [ ] Deployment/search-console actions occur only with operator authorization.
- [ ] `plans/README.md` status is updated.

## STOP conditions

- Search Console shows a page/query mapping that conflicts with the proposed
  title or canonical. Preserve evidence-backed intent and report the conflict.
- An apparently WIP route has real indexed traffic and a planned immediate
  launch. Coordinate migration/redirect/launch rather than changing signals in
  isolation.
- Registry status cannot describe actual production feature flags. Fix that
  source of truth before generating sitemap/metadata.
- Content requires claims the implementation, provider policy, or privacy review
  cannot substantiate.
- A requested action changes production indexing/submits URLs without explicit
  operator authorization.

## Maintenance notes

- A feature launch must atomically update registry status, metadata, sitemap,
  guide content, privacy classification, tests, and related links.
- Update explicit dates only when user-visible content or functionality changes.
- Review search performance monthly using page/query evidence; do not chase
  day-to-day ranking volatility.
