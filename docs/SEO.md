# SEO baseline and release checks

This reference records Astraa's evidence-backed indexability policy and the operator checks that
remain necessary after an approved deployment.

## Baseline limitation — 2026-08-08

This technical SEO pass was prepared from the local production build at commit
`94a1b1f` plus the uncommitted engineering phases in this workspace. No Google
Search Console, Bing Webmaster Tools, production analytics, or field Core Web
Vitals export was available.

Unavailable baseline data:

- page and query clicks, impressions, click-through rate, and average position;
- indexed and excluded URL counts with reasons;
- submitted sitemap status;
- field Core Web Vitals by route group;
- manual actions, security issues, and query cannibalization evidence.

Consequently, metadata and copy changes in this pass are `technical-only`. They
correct false counts, availability, processing, freshness, canonical, and
structured-data signals. They do not claim keyword demand, a traffic decline,
or a likely ranking outcome.

## Implemented technical contract

- The registries own stable IDs, canonical paths, availability, processing
  modes, and related-tool links.
- The sitemap contains only canonical indexable paths. Its only `lastmod` is
  the explicit privacy-policy date.
- The games catalog and available game routes enter the sitemap only when the
  separate game-indexing switch is enabled. Memory passed that first-game
  launch review; all six unfinished game routes remain noindex and excluded.
- Global JSON-LD contains stable Organization and WebSite nodes only.
- Every available tool includes unique server-rendered guidance and contextual,
  crawlable related links.
- `npm run test:e2e -- --grep @seo` crawls titles, descriptions, canonicals,
  robots directives, headings, schema, guides, related links, and sitemap
  membership from the production build.

## Operator-approved post-deployment check

Do not submit or request indexing as part of a local code change. After an
operator-approved deployment, record:

- live URL and deployment commit;
- deployment date;
- rendered title, canonical, robots directive, and JSON-LD validation result;
- sitemap fetch and submission status;
- 28-day and 90-day observation dates for page/query comparison.

Review individual landing pages and queries rather than attributing an aggregate
change to one metadata edit.
