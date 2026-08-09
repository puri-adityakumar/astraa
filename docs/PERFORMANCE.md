# Performance baseline

This is a repeatable local lab baseline, not a deployment SLA or Lighthouse score gate. Field Core
Web Vitals can differ with geography, hardware, CDN state, and real user behavior.

## Baseline 2026-08-08

- Source: uncommitted Phase 001–007 working tree based on `94a1b1f` on `astraa-v2`.
- Build: Next.js 16.3.0 production output with webpack; all measured routes were statically
  prerendered.
- Browser: Playwright 1.62.1, Chromium 151.0.7922.34, headless.
- Device: 390 × 844 CSS pixels, 3× device scale, mobile and touch enabled.
- Throttling: 4× CPU slowdown, 150 ms latency, 1.6 Mbps download, 0.75 Mbps upload.
- Cache: disabled; each route used a new browser context.
- Sample: median of three runs captured at 2026-08-08 21:46 IST.
- Command: build with `npm run build:e2e -- --webpack`, then run
  `npm run measure:performance`.

| Route                      | JS transfer |    LCP |    CLS | Command menu open |
| -------------------------- | ----------: | -----: | -----: | ----------------: |
| `/`                        |    343.7 KB | 876 ms | 0.0392 |           62.3 ms |
| `/tools/password`          |    545.7 KB | 856 ms | 0.0000 |           64.8 ms |
| `/tools/json`              |    488.9 KB | 876 ms | 0.0000 |           68.8 ms |
| `/tools/markdown`          |    408.5 KB | 848 ms | 0.0001 |           66.8 ms |
| `/tools/snippet-generator` |    686.5 KB | 880 ms | 0.0239 |           63.1 ms |

JS transfer is the sum of transferred `/_next/static/*.js` resources. LCP and CLS use buffered
Performance Observer entries. Interaction latency starts on a trusted click of the visible command
trigger and ends when its dialog enters the DOM; on the mobile profile, the navigation is opened
before this timed interaction.

The Phase 007 server-rendered guides did not add a material client JavaScript or layout-shift
regression in this profile. Every sampled median remained below 900 ms LCP and 0.04 CLS; production
field data is still required before setting budgets.

## Product-led homepage comparison 2026-08-09

This comparison uses the same machine, browser build, webpack E2E artifact, route order, and
measurement script before and after the Phase 012 homepage change. The machine was an Apple-silicon
Mac mini running macOS 26.5.2 (build 25F84), Node.js 25.4.0, and npm 11.7.0. Every profile used
Playwright 1.62.1 and headless Chromium 151.0.7922.34 with the baseline profile above: 390 × 844 at
3× scale, touch and mobile enabled, 4× CPU slowdown, 150 ms latency, 1.6 Mbps down, 0.75 Mbps up,
and a disabled cache.

- Pre-change capture: 2026-08-09 05:44 IST (`2026-08-09T00:14:45.750Z`) on a confirmed-free
  loopback port after `npm run build:e2e -- --webpack`.
- Final post-change capture: 2026-08-09 06:33 IST (`2026-08-09T01:03:07.436Z`) on a separate
  confirmed-free loopback port after a fresh build with the same command.
- Measurement command: `PERFORMANCE_BASE_URL=<owned-loopback-url> npm run measure:performance`.
- Every complete homepage profile is retained below. The first post-change profile exposed a
  relative regression; the post-fix profile passed, and the final profile followed the cold-review
  accessibility and primary-CTA corrections. No sample was omitted or replaced.

| Profile            | Run | JS transfer |    LCP |    CLS | Command menu open |
| ------------------ | --: | ----------: | -----: | -----: | ----------------: |
| Pre                |   1 |    343.9 KB | 928 ms | 0.0392 |           53.5 ms |
| Pre                |   2 |    343.9 KB | 868 ms | 0.0392 |           45.3 ms |
| Pre                |   3 |    343.9 KB | 876 ms | 0.0392 |           46.9 ms |
| First post-change  |   1 |    551.3 KB | 880 ms | 0.1222 |           57.3 ms |
| First post-change  |   2 |    551.3 KB | 860 ms | 0.1222 |           56.4 ms |
| First post-change  |   3 |    551.3 KB | 872 ms | 0.1222 |           52.6 ms |
| Post-fix           |   1 |    330.9 KB | 868 ms | 0.0008 |           58.4 ms |
| Post-fix           |   2 |    330.9 KB | 860 ms | 0.0008 |           53.6 ms |
| Post-fix           |   3 |    330.9 KB | 860 ms | 0.0008 |           52.1 ms |
| Final current tree |   1 |    336.1 KB | 852 ms | 0.0008 |           58.8 ms |
| Final current tree |   2 |    336.1 KB | 876 ms | 0.0008 |           51.7 ms |
| Final current tree |   3 |    336.1 KB | 860 ms | 0.0008 |           50.4 ms |

| Metric      | Pre median | Final median | Relative ceiling                | Result |
| ----------- | ---------: | -----------: | ------------------------------- | ------ |
| JS transfer |   343.9 KB |     336.1 KB | 361.095 KB (`343.9 × 1.05`)     | Pass   |
| LCP         |     876 ms |       860 ms | 976 ms (`876 + max(87.6, 100)`) | Pass   |
| CLS         |     0.0392 |       0.0008 | 0.0442 (`0.0392 + 0.005`)       | Pass   |

The final medians meet the main absolute targets of CLS at or below 0.02, LCP at or below 900 ms,
and JavaScript at or below the historical 343.7 KB budget. JavaScript is 7.8 KB (2.3%) below the
same-machine pre-change median. It remains 16.1 KB above the 320 KB stretch target; the remaining
initial transfer is the shared application/navigation shell plus the deliberately prefetched primary
`/tools` destination, while the server-rendered homepage page chunk transferred about 0.5 KB in the
focused resource audit. A future shell-specific pass can address that stretch target without moving
static homepage content into a client boundary.

### Layout-shift attribution and the complete post profile

The pre-change 0.039222 layout-shift entry moved the oversized 620 px hero ring down 8.875 px and
shifted the visible proof grid from y=755.469 to y=799.625. Focused attribution of the retained first
post-change profile found two implementation causes:

1. Above-fold Next.js link prefetch loaded the `/tools`, JSON, Image, Regex, and Currency route
   chunks. Multi-target catalog/tool lists now navigate without eager route-client transfer. The
   single primary `/tools` direction keeps default prefetch for interaction quality.
2. The hero copy changed from 140 px in the fallback font to 112 px after Geist loaded, then four
   wrapping tool links changed from two rows to a three-plus-one arrangement. Reserved responsive
   text geometry and a fixed two-column mobile link grid removed both moving nodes.

The final current-tree layout-shift audit measured 0.0008467131 before rounding. Its only attribution
source had no DOM node and identical previous/current geometry (`x=21`, `y=314.140625`, `w=348`,
`h=103`), so it introduced no attributable moving element. The theme control's JavaScript-disabled
placeholder and hydrated radiogroup both measured exactly 138 × 50 px. Final normal- and
reduced-motion production diagnostics on `/` and `/tools/json` captured no console or page errors.
The reduced-motion correction preserves the same page-transition wrapper through server rendering
and hydration, then applies the final static state without a repeating animation.

### Primary CTA prefetch tradeoff

The hero CTA was also profiled in an isolated same-throttle A/B on the final machine/browser profile.
Each click measurement started on the trusted hero click and ended after the `/tools` H1 was visible
for two animation frames:

| Hero `/tools` behavior | Click-to-visible samples |   Median | Initial JS | Click-loaded JS |
| ---------------------- | -----------------------: | -------: | ---------: | --------------: |
| `prefetch={false}`     | 505.3 / 504.1 / 498.8 ms | 504.1 ms |   331.0 KB |          5.1 KB |
| Default prefetch       | 178.9 / 172.9 / 181.1 ms | 178.9 ms |   336.1 KB |          0.0 KB |

Default prefetch improved the median by 325.2 ms for 5.1 KB of initial JavaScript, stayed inside the
relative and absolute JavaScript gates, and produced no console or page errors in any A/B sample.
The duplicate below-fold final CTA remains non-prefetched because the above-fold primary direction
already primes the same destination.

Final medians for every route emitted by that unchanged profile were:

| Route                      | JS transfer |    LCP |    CLS | Command menu open |
| -------------------------- | ----------: | -----: | -----: | ----------------: |
| `/`                        |    336.1 KB | 860 ms | 0.0008 |           51.7 ms |
| `/tools/password`          |    539.7 KB | 860 ms | 0.0000 |           46.7 ms |
| `/tools/json`              |    483.5 KB | 864 ms | 0.0000 |           50.3 ms |
| `/tools/markdown`          |    405.1 KB | 840 ms | 0.0001 |           46.7 ms |
| `/tools/snippet-generator` |    683.2 KB | 864 ms | 0.0239 |           46.4 ms |

## SQL formatter Worker decision 2026-08-09

The SQL formatter was measured from a production webpack E2E build in Playwright 1.62.1 with
headless Chromium 151.0.7922.34. The formatter dependency was warmed first, each input was populated
at normal CPU speed, and Chrome DevTools Protocol 4× CPU throttling covered the trusted Format click
through the live-result update. A Performance Observer recorded main-thread Long Task durations.
The representative fixtures were ASCII SQL at exactly 10,240 bytes and the public limit of exactly
102,400 bytes.

| Implementation                       | SQL bytes | Click-to-result | Main-thread Long Tasks |
| ------------------------------------ | --------: | --------------: | ---------------------: |
| Main-thread formatter                |    10,240 |         77.0 ms |                [68] ms |
| Main-thread formatter                |   102,400 |      1,889.2 ms |        [1,851, 120] ms |
| Worker, before preflight fast path   |    10,240 |         61.7 ms |                     [] |
| Worker, before preflight fast path   |   102,400 |        860.4 ms |                [51] ms |
| Final Worker and preflight fast path |    10,240 |         59.7 ms |                     [] |
| Final Worker and preflight fast path |   102,400 |        888.1 ms |                     [] |
| Final Worker, nine-test repeat       |    10,240 |         74.9 ms |                     [] |
| Final Worker, nine-test repeat       |   102,400 |        866.2 ms |                     [] |

In the instrumented intermediate Worker run, the 51 ms entry was attributed as
`window` / `unknown`. It began 0.8 ms before the measured click origin and ended 810.2 ms before the
result; the Worker response arrived at 853.4 ms. It was therefore the caller-side click/preflight
task, not formatter execution or result rendering. The final limitation-keyword fast path removed
that observed task. Final Worker responses arrived at 57.4 ms for 10 KB and 880.9 ms for 100 KB;
both samples had an empty Long Task array. The browser test asserts a Worker-response mark for both
sizes, an exactly empty 10 KB array, and no task at or above 100 ms for either size.

The exact-max main-thread result breached both the 100 ms wall-time threshold and the Long Task
threshold, so the launch path was moved to a Web Worker. Full Worker wall time can still exceed
100 ms because formatting work remains substantial, but it no longer blocks the measured main
thread. The client has no production main-thread formatting fallback; timeout, malformed response,
or load failure terminates the Worker and makes a subsequent attempt start a fresh one.

The same production resource test read raw decoded JavaScript response bodies and compressed them
locally with Node zlib at gzip level 9. Initial `/tools/sql` JavaScript was 1,096,972 decoded body
bytes / 356,428 local gzip-level-9 bytes across 25 chunks, with zero overlap with either lazy SQL
resource. Format then requested one 6,825 decoded / 2,859 local gzip-level-9-byte Worker script and
one 292,085 decoded / 74,498 local gzip-level-9-byte formatter dependency, totaling 298,910 decoded
/ 77,357 local gzip-level-9 bytes. The homepage loaded 1,074,645 decoded / 348,511 local
gzip-level-9 bytes across 24 chunks and also had zero overlap with both lazy URLs, so attributable
homepage SQL JavaScript growth was zero bytes. Chromium reported the Worker entry as `script` and
its dynamic formatter dependency as `other`.

These are single-machine local lab results and locally derived body sizes, not observed network
transfer claims or an SLA. They record why the Worker boundary is required and keep both
representative sizes under an executable main-thread Long Task gate.

## Follow-ups before setting budgets

1. Inspect `/tools/snippet-generator`, the heaviest final sampled route at 683.2 KB, and attribute
   its Shiki/export chunks before setting a route-specific JavaScript budget.
2. Inspect the shared application/navigation shell before pursuing the homepage's remaining 16.1 KB
   gap to the 320 KB stretch target.
3. Repeat this profile on CI and production hosting to establish machine and network variance. Set
   thresholds only after those distributions are stable; do not derive a generic score-of-100 gate
   from this local sample.
