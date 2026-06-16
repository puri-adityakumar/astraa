# Codebase Audit — astraa

**Date:** 2026-06-16 · **Branch:** `major-overhaul` · **Baseline commit:** `8ac7fe6`
**Method:** Deep 9-category audit (correctness, security, performance, tests, tech-debt, dependencies, DX, docs, direction) via parallel read-only finders, each finding adversarially verified against the cited code, then the highest-leverage items re-checked by hand (including a live `npm audit`). 67 findings total — 38 HIGH/MED, 29 LOW. 6 corrected during verification, 0 fabricated.
**Scope note:** This is the *broad* codebase audit. The v2 monochrome UI structural debt (duplicate tokens, dead Tailwind classes, orphaned `shimmer-button`/`floating-navbar`, variant duplication) is catalogued separately in [`refactor-audit-2026-06-16.md`](./refactor-audit-2026-06-16.md) and is **not** repeated here.

**Status legend:** `✓ verified` = re-checked against code by the reviewer · `confirmed` = verifier confirmed against code · `corrected` = real issue, evidence adjusted (see notes) · `lead` = reported, not independently verified (mostly LOW). **Effort** S=hours / M=day-ish / L=multi-day (for the fix incl. tests). **Risk** = chance the fix changes observable behavior.

> **Secret handling:** one finding concerns a committed credential. This document references its **location and type only** and recommends rotation; the value is never reproduced.

---

## Leverage-ranked summary (problem findings)

| # | Finding | Cat | Effort | Risk | Status |
|---|---------|-----|--------|------|--------|
| 1 | Remove dead three.js + postprocessing chain (~700 KB/route) | perf/deps | S | LOW | ✓ verified |
| 2 | Lazy-load niceware 800 KB wordlist | perf | S | LOW | ✓ verified |
| 3 | Add CI lint + typecheck gate | dx/tests | S | LOW | ✓ verified |
| 4 | Rotate committed CoinGecko key → env | security | S | LOW | ✓ verified |
| 5 | Rate-limit the public OpenRouter Server Action | security | M | LOW | ✓ verified |
| 6 | Fix broken `clearOldActivities` date filter | correctness | S | LOW | ✓ verified |
| 7 | Remove unused recharts + react-day-picker | deps/perf | S | LOW | ✓ verified |
| 8 | Delete dead `animations-showcase.tsx` + `colors/` | techdebt | S | LOW | ✓ verified |
| 9 | Remove dead `ActivityProvider` 3 s interval + migration shims | techdebt | M | MED | ✓ verified |
| 10 | Guard currency/crypto stale-response race | correctness | M | LOW | confirmed |
| 11 | Characterization tests: store migrations, FX fallback, openrouter | tests | M | LOW | confirmed |
| 12 | Next.js patch bump + `npm audit fix` hygiene | deps | S | MED | ✓ verified (audit run) |
| 13 | `logError()` never calls `Sentry.captureException` | dx | S | LOW | ✓ verified |
| 14 | Add CSP + bump mermaid/dompurify (markdown XSS hardening) | security | M | MED | confirmed |
| 15 | Calculator accepts `( ) %` but evaluator → NaN | correctness | M | MED | confirmed |
| 16 | Extract `ToolPageHeader` (boilerplate in 13 clients, drifted) | techdebt | M | LOW | ✓ verified |
| 17 | 4 JSON clipboard calls bypass `lib/clipboard` wrapper | techdebt | S | LOW | confirmed |
| 18 | Stale docs: `COMPONENTS.md` + `ARCHITECTURE.md` inventories | docs | S | LOW | confirmed |

Plus ~25 LOW nits (full list in the per-category sections).

---

## Correctness / bugs

**BUG-03 — `clearOldActivities` never prunes (string-vs-Date comparison).** `✓ verified` · MED
`lib/stores/activity-tracking.ts:169` filters `activity.timestamp > cutoffDate`, but `timestamp` (typed `Date` at `types.ts:63`) is an ISO string after JSON rehydration — `onRehydrateStorage` (`:191`) revives only `sessionId`/`sessionStartTime`, not the activity timestamps. The string-vs-`Date` comparison is never true, so the filter does not prune by date (and, depending on coercion, can drop *all* recent activities when invoked). Fix: coerce `new Date(activity.timestamp).getTime()` (or store epoch numbers + revive). Effort S / Risk LOW.

**BUG-02 — Currency/crypto stale-response race.** `confirmed` · MED
`components/currency/fiat-converter.tsx:84` and `crypto-converter.tsx:40` run a 500 ms-debounced async fetch whose cleanup only `clearTimeout`s — an in-flight request is never cancelled, so a slow older response can resolve after a newer one and write a stale rate. Fix: per-effect `cancelled` flag or `AbortController`; optionally thread `AbortSignal` through `getExchangeRate`/`getCryptoPrice`. Effort M / Risk LOW.

**BUG-04 — Calculator accepts `( ) %` from keyboard but the evaluator can't parse them.** `confirmed` · MED
`calculator-client.tsx:137` appends `(`,`)`,`%` via `appendOperator`, but `OPERATOR_SET` (`calculator-utils.ts:33`) is only `+ - * / ^`. `tokenize()` folds the unknown chars into the number buffer → `Number("(2")` = NaN → whole expression errors. Fix: either reject these in the input layer, or extend the shunting-yard tokenizer with parentheses + a percent operator. Effort M / Risk MED (precedence tests).

**BUG-01 — Snake self-collision counts the about-to-vacate tail cell.** `confirmed` · MED
`lib/games/snake/useSnakeGame.ts:64` tests the new head against the full current snake (incl. tail) *before* the tail is popped (`:82`) — moving into the tail's current cell, a legal move, ends the game. Fix: exclude the soon-to-be-popped tail from the collision set. Effort S / Risk LOW.

**BUG-05 — Exponent `^` is left-associative.** `lead` · LOW — `calculator-utils.ts:84` pops on `>=` precedence, so `2^3^2` = 64 instead of 512. Fix: treat `^` right-associative (pop only on strictly-higher precedence) + add a test.

**BUG-06 — Unit dropdown labels Acre as `"Icon"`.** `lead` · LOW — `lib/unit-conversions.ts:29` (symbol `ac`, ratio 4046.86 m² = acre). One-string rename.

**BUG-07 — IndexedDB adapter opens a fresh connection per read/write, never closes.** `lead` · LOW — `lib/stores/storage.ts:17,35,50`; also no `blocked`/`versionchange` handler (future migration hazard). Fix: memoize the DB promise; add upgrade handlers.

**BUG-08 — JSON parse worker never settles pending promises on error/termination.** `lead` · LOW — `lib/json/parse-client.ts:18` wires only `onmessage`; a worker error leaves `parse()` hung and leaks the resolver. Fix: add `worker.onerror` (+ optional per-call timeout).

**BUG-09 — `useMigration` runs side-effecting migration during render.** `lead` · LOW — `lib/stores/migration.ts:123` calls migration in the hook body, not in `useEffect` (StrictMode double-run risk). *Note:* `migration.ts` appears to have no live callers (see DEBT-07); confirm before fixing vs deleting.

**BUG-10 — Regex tester runs the user pattern synchronously before the worker fallback.** `lead` · LOW — `regex-tester-client.tsx:131` runs `runMatches` on the main thread inside `useMemo`; the safe worker only engages *after* `timedOut` (`:148`). A catastrophic-backtracking pattern can freeze the UI on the first attempt. Fix: gate the sync run behind a cheap ReDoS heuristic, or always route through the worker.

**BUG-11 — Snake double `setState` per eat-tick + reseeds food without checking the snake.** `lead` · LOW — `useSnakeGame.ts:73,85` two updates off one stale snapshot; `:76` food can spawn on the body; interval recreated every tick (`:126`). Fix: single functional reducer update, reseed from unoccupied cells, stabilize the interval.

---

## Security

**SEC-01 — Rate-limit / gate the public OpenRouter Server Action.** `✓ verified` · HIGH
`lib/openrouter.ts:9` exports `'use server' generateText(topic, wordCount)` with only length/type validation — no auth, no rate limit. The UI guard is client-side only (`text-generator-client.tsx:107`); the action is directly POST-able in a loop on the project's `OPENROUTER_API_KEY`. Free-tier model, so primary impact is account rate-limit exhaustion (feature denial) + the site acting as a free LLM proxy. Fix: per-IP/session fixed-window limit via the existing Upstash Redis + a small daily cap; friendly error via `getUserFriendlyError()`. Effort M / Risk LOW.

**SEC (from TEST-02) — Rotate the committed CoinGecko API key.** `✓ verified` · MED, floats up (committed credential)
A **CoinGecko demo API key** is hardcoded at `lib/api.ts:1` (used as the `x-cg-demo-api-key` header in `getCryptoPrice`). It is burned in git history the moment it was committed. Verifier correction: it is **not** duplicated in `crypto-data.ts` (that file does not reference it). Impact is bounded (free demo key → rate-limit/cost, not data exposure), but it must still be **rotated** and moved to an env var (`NEXT_PUBLIC_COINGECKO_API_KEY` or a server-proxied var). Effort S / Risk LOW. *Value intentionally omitted from this document.*

**SEC-03 — Add a Content-Security-Policy header.** `confirmed` · MED
`next.config.js:4-30` sets `X-Content-Type-Options`/`X-Frame-Options`/`Referrer-Policy`/`Permissions-Policy` but **no CSP** (repo-wide grep: zero). The markdown preview injects user-controlled content via `dangerouslySetInnerHTML` for mermaid SVG (`preview.tsx:76`, mitigated by `securityLevel:'strict'`) and shiki HTML (`:117`). No CSP = no second line of defense if escaping/sanitization regresses. Fix: add CSP (start Report-Only) with `default-src 'self'`, `object-src 'none'`, `base-uri 'self'`, `frame-ancestors 'self'`, tuned for the inline theme script + shiki styles, then enforce. Effort M / Risk MED.

**SEC-04 — Harden the visitor dedup cookie.** `lead` · LOW — `middleware.ts:28` sets `httpOnly`+`sameSite:'lax'` but no `secure` and no explicit `path`. Cookie carries no secret (only gates a counter), so low impact. Fix: add `secure: NODE_ENV==='production'` + `path:'/'`.

**SEC-05 — `app/api/stats` forwards raw upstream values, no cache header.** `lead` · LOW — `route.ts:36,59,68` returns Redis/GitHub-derived counts with no `Cache-Control`; cache misses across instances amplify unauthenticated GitHub calls. Fix: short `s-maxage`/SWR + coerce the Redis value to a non-negative int.

---

## Performance

**PERF-01 — Remove three.js + postprocessing (dead WebGL chain).** `✓ verified` · HIGH
`components/ui/pixel-blast.tsx:4` statically imports `three` + `postprocessing` (728 LOC renderer). Its only consumer, `components/landing-background.tsx`, is literally `return null` (its own comment says the background was retired in v2). `app/layout.tsx:170` still mounts that null component on every route, so a ~700–740 KB JS chunk containing a full WebGL renderer ships everywhere and is never executed. Fix: delete `pixel-blast.tsx`(+`.css`), strip the import from `landing-background.tsx` (or delete it + its `layout.tsx` mount), remove `three`/`postprocessing`/`@types/three` from `package.json`. Effort S / Risk LOW.

**PERF-02 — Lazy-load niceware (800 KB wordlist).** `✓ verified` · HIGH
`lib/password/password-utils.ts:1` statically imports `niceware`, whose `wordlist.js` is 805 KB. `password-generator.tsx:69` fires `generate()` on mount even in the default "random" mode, so every password-tool visitor downloads the wordlist needed only for "Memorable" passphrases. Fix: `const niceware = await import('niceware')` inside `generateMemorablePassword` — makes it a lazy split point. Effort S / Risk LOW.

**PERF-03 — Remove unused recharts + react-day-picker.** `✓ verified` · MED
`components/ui/chart.tsx:4` (recharts, 7.7 MB) and `components/ui/calendar.tsx:5` (react-day-picker, 4.6 MB) are shadcn scaffolding with **zero consumers** (grep NONE). Fix: delete both files, remove the deps; add a note not to re-add via `shadcn add` without a route that uses them. Effort S / Risk LOW.

**PERF-04 — JSON tool eagerly bundles the full CodeMirror suite.** `corrected` · MED
*Correction:* the markdown `editor.tsx` is **already** correctly `dynamic()`-imported (`markdown-editor-client.tsx:22`). The real offender is `components/json/text-view.tsx:4-12`, which statically imports 7 `@codemirror/*` packages and is statically imported by `json-editor-client.tsx:8` — so the whole CodeMirror suite parses when any visitor opens the JSON tool, even for the Tree/Convert tabs. Fix: wrap `<TextView>` in `next/dynamic(..., { ssr:false })`, mirroring the markdown editor. Effort S / Risk LOW.

**PERF-05 — Calculator `memo` defeated by inline arrow props.** `confirmed` · MED
`calculator-button.tsx:14` is `memo`-wrapped, but `calculator-client.tsx` passes 28+ `onClick={() => appendOperator('(')}` inline arrows — new references every render, so memo's shallow compare always fails and every button re-renders on each keystroke (memo adds cost for no benefit). Fix: wrap each variant in a stable `useCallback`. Effort S / Risk LOW.

**PERF-06 — IBM Plex Mono loaded globally for one consumer.** `confirmed` · MED
`app/layout.tsx:7` loads two weights of IBM Plex Mono into every route's `<body>`, but the only consumer is `markdown/editor.tsx:140`. GeistMono (already global) is a fine fallback elsewhere. Fix: move the font import to the markdown route/component (~60–100 KB off every other route). Effort S / Risk LOW.

**PERF-07 — Password generator re-runs full generation on every render/slider tick.** `lead` · LOW — `password-generator.tsx:69` effect depends on `generate` whose identity changes per state atom; dragging the length slider fires a generation per tick. Fix: debounce slider input. (Compounds with PERF-02 if niceware is deferred.)

**PERF-08 — Home hero/popular/principles are all `'use client'`.** `lead` · LOW — `app/page.tsx:26` renders three client sections for framer-motion, so the primary above-the-fold content isn't server-rendered (hurts LCP). Fix: server shell + thin client `<AnimatedSection>` wrapper; consider `LazyMotion`. Effort M / Risk MED.

**PERF-09 — CI does not cache `.next/cache`.** `lead` · LOW — `ci.yml:17` caches npm but not the build cache, so every push is a full compile. Fix: `actions/cache` keyed on `package-lock.json`.

**PERF-10 — Oversized favicon + orphaned font/image assets.** `lead` · LOW — `public/assets/astraa_pfp.png` (392 KB) served as favicon; `public/fonts/FunnelDisplay-SemiBold.ttf` (36 KB) and `public/assets/astraa.jpg` (248 KB, README-only) are unreferenced at runtime. Fix: emit a small WebP/ico, delete the orphans.

---

## Tests

Coverage is strong on pure logic (`lib/**/*.test.ts`, 42 files) but there is a hard wall: **zero** tests for React components, route handlers, the edge middleware, the server action, and the network/fallback libs.

**TEST-01 — FX rate primary/fallback path untested.** `confirmed` · HIGH — `lib/api.ts:35-75`; both fetch branches and the malformed-shape→null path are uncovered. (Verifier note: the backup *does* guard `undefined`→null, so it's consistently null, not truly silent — but still untested.) Fix: 3 `fetch`-mocked tests (primary ok / primary bad-shape→backup / both fail→null).

**TEST-03 — Store migration logic untested (data-loss risk).** `confirmed` · HIGH — `markdown-editor.ts:145`, `user-preferences.ts:86`, `activity-tracking.ts:198` all have `migrate()` with no test; a wrong field name silently wipes a user's files on next load. Fix: feed v1/v2 blobs through rehydrate and assert surviving shape.

**TEST-05 — OpenRouter server action untested.** `confirmed` · MED — `lib/openrouter.ts` validation + error branches uncovered; drift sends malformed input to the LLM at cost. Fix: mock `@openrouter/sdk` + `process.env`; assert all 5 branches.

**TEST-07 — Persisted stores (activity-tracking, tool-settings, user-preferences) untested.** `confirmed` · MED — `getPopularTools`/`clearOldActivities` date+Map logic is easy to break at boundaries and feeds the home stats. Fix: follow the existing store-test pattern.

**TEST-04 — CI has no lint or typecheck gate.** `confirmed` · MED — *(merged with DX-01; see DX)*.

**TEST-06 — `markdown-editor-client.tsx` (353 LOC, #1 churn file) has no component test.** `confirmed` · MED — dirty-state confirm dialog, drag/drop, export dispatch all unverified. Fix: add a jsdom vitest project scoped to `components/**/*.test.tsx`; characterization tests. Effort L / Risk MED (test-env setup).

**TEST-08 — Async tests lack `expect.hasAssertions()`.** `lead` · LOW — conditional inner assertions (`if (result.ok)`) can run zero assertions yet pass (`repair.test.ts:5`, `image-utils.test.ts:14`). Fix: add the guard or assert the discriminant unconditionally.

---

## Tech debt & architecture

**DEBT-01 — Dead `ActivityProvider` runs a 3 s fake-data interval; dead migration shims.** `✓ verified` · HIGH
*Correction (important):* the finder claimed `tools-context`/`ToolsProvider` was also dead — **it is live** (`command-menu`, `floating-navbar`, `tools-client`, `explore-client` import `useTools` from it). The genuinely dead pieces are: (a) `lib/activity-tracker.tsx` — `ActivityProvider` fires `setInterval` every 3 s mutating fake stats no component reads (`useActivity`/`trackActivity` → grep NONE in app/components, verified); and (b) the `useTools`/`useActivity` shims in `lib/stores/migration.ts`, which have zero app consumers. Fix: remove `ActivityProvider` from `layout.tsx` + delete `activity-tracker.tsx`; delete the migration shims. *Leave `tools-context` alone.* Effort M / Risk MED.

**DEBT-02 — Confirmed-dead `animations-showcase.tsx` (348 LOC) + `components/colors/`.** `confirmed` · MED — grep NONE for either. Fix: delete + `build` to confirm.

**DEBT-03 — Four styling strategies mixed across shell components.** `confirmed` · MED — injected `<style>` blocks with `!important` (`navigation.tsx:163`, `footer.tsx:177`), the same `PALETTE_CSS` injected on both command-menu render paths (`:269` & `:278`), Tailwind arbitrary values (`tcard.tsx`), and direct DOM-style mutation in `password-generator.tsx:369` hover handlers. Fix: declare Tailwind arbitrary values the winner for static token styling; move `:hover`/`:focus` rules to `globals.css @layer`; replace the DOM-mutation hover with CSS; de-dup the command-menu injection. Effort M / Risk MED. *(Overlaps the v2 refactor-audit's styling theme.)*

**DEBT-04 — 4 JSON clipboard calls bypass the `lib/clipboard` wrapper.** `confirmed` · MED — `json/toolbar.tsx:49`, `generate-view.tsx:67`, `convert-view.tsx:73`, `tree-view.tsx:65` call `navigator.clipboard.writeText` raw (unhandled rejection off-HTTPS, toast fires regardless) while 8 other tools use the error-handling wrapper. Fix: mechanical swap to `copyToClipboard()`. Effort S / Risk LOW.

**DEBT-05 — Tool-page header boilerplate copy-pasted across 13 clients, already drifted.** `✓ verified` · MED — same `pt-24 pb-12` + heading + "All processing happens locally" block, but `calculator-client.tsx:157` uses `max-w-5xl`/`text-3xl` while `hash:32` uses `max-w-2xl`/`text-2xl`; snippet uses `max-w-[1400px]`. A real, user-visible width drift buried in duplication. Fix: `components/ui/tool-page-header.tsx` ({title, description, maxWidth?, animate?}), standardize widths intentionally. Effort M / Risk LOW.

**DEBT-06 — `updateToolUsage` call pattern inconsistent / missing.** `lead` · LOW — `.getState()` anti-pattern (`base64:64`, `regex:116`), three id formats (`'base64'` vs `'/tools/markdown'` vs `'regex-tester'`), and 7 tools never track usage at all. Fix: a `useTrackToolUsage(toolId)` hook (or fold into the ToolPageHeader), normalize ids to route paths.

**DEBT-07 — `lib/stores/migration.ts` is a completed migration with no live callers.** `lead` · LOW — reads `*-context-data` localStorage keys never written today; exports `useTools`/`useActivity` shims (name-collides with the live `tools-context`). Fix: delete the module + its barrel exports; `tsc --noEmit` to confirm.

**DEBT-08 — `storage.ts` exports `clearAllStoredData`/`exportAllStoredData`/`importStoredData`, none called.** `lead` · LOW — also hardcodes the store-key list. Fix: delete (or wire to a real reset UI using a shared `STORE_KEYS`).

---

## Dependencies & migrations

**DEP-01 — Remove three.js + postprocessing.** `✓ verified` · HIGH — *(same fix as PERF-01; 39 MB of node_modules, zero live consumers).*

**DEP-02 — Patch Next.js off 16.1.0.** `✓ verified (audit run)` · HIGH→MED
A live `npm audit` confirms a real advisory surface (dompurify, opentelemetry/sentry chain, ajv, brace-expansion, @babel/core — mostly moderate, `npm audit fix` available). The finder additionally cited Next-specific HIGH advisories (RSC deserialization DoS, middleware bypass, image-optimizer DoS) touching live surfaces here (`openrouter.ts:1` server action, `middleware.ts` edge, `images:{unoptimized:false}`). **Confirm the exact Next GHSAs with `npm audit` before claiming HIGH**, but the patch bump (16.1 → latest 16.2.x) is cheap and worth doing regardless. Fix: bump `next`, `npm install`, `build` + `tsc --noEmit` + smoke-test middleware/action/images. Effort S / Risk MED.

**DEP-03 — Drop the redundant `@next/swc-wasm-nodejs` pin.** `corrected` · MED — `package.json:24` pins the 27 MB WASM fallback as a hard dep alongside the native `swc-darwin-arm64` binary (verifier corrected the "four linux variants" detail — only arm64+wasm present locally). The explicit `16.1.0` pin will also drift after DEP-02. Fix: remove the entry; Next manages the platform-native optional dep automatically. Effort S / Risk LOW.

**DEP-04 — Bump js-yaml.** `corrected` · MED→LOW — user YAML is parsed at `lib/json/convert/yaml.ts:14`, but the verifier could not corroborate the cited GHSA, and `schema: yaml.JSON_SCHEMA` materially restricts the merge-key construct the ReDoS would exploit. Treat as optional hygiene (bump to latest 4.x), not a confirmed vuln.

**DEP-05 — Mermaid 11.x bundled DOMPurify advisories.** `confirmed` · MED — `npm audit` confirms real DOMPurify advisories (`GHSA-x4vx-rjvf-j5p4` et al.) via the version mermaid bundles; user diagrams render through `mermaid.render()` (`preview.tsx:49`, strict mode). Fix: bump mermaid to latest patch + rerun audit; pairs with the CSP work (SEC-03, `frame-src 'self'`). Effort S / Risk LOW.

**DEP-06 — framer-motion v11 → v12.** `lead` · LOW — 29 files import it; documented breaking changes. **Verdict: not worth doing now**; revisit when shadcn/Radix confirm v12. 

**DEP-07 — tailwindcss v3.4 → v4.** `lead` · LOW — full config rewrite + every shadcn component; zero visual-regression coverage. **Verdict: not now**; use the official codemod after establishing visual tests and when v3 nears EOL.

**DEP-08 — HIGH audit flags in fast-uri/flatted/minimatch/picomatch/rollup are build/dev-tool transitive only.** `lead` · LOW — none execute in the deployed app or at request time. Fix: `npm audit fix` on a branch; document in CONTRIBUTING that these are build-tool-only to reduce CI-log confusion.

---

## DX & tooling

**DX-01 / TEST-04 — CI has no lint gate and no typecheck gate.** `✓ verified` · HIGH
`ci.yml` runs only `npm test` + `npm run build`. `lint` exists (`--max-warnings 50`) but isn't invoked; there's no `typecheck` script and `tsc --noEmit` never runs in CI — so the strict tsconfig (`noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `noUnusedLocals`) catches nothing on PRs, and lint warnings (currently ~10/50 per the finder) can grow silently to 50 before failing. Fix: add `npm run lint` + a new `"typecheck": "tsc --noEmit"` step to `ci.yml`; inventory existing issues locally first; consider lowering `--max-warnings`. Effort S / Risk LOW. **Do this early — it guards every other change.**

**DX-04 — `logError()` never forwards to Sentry.** `✓ verified` · MED — `lib/error-handler.ts:97` only `console.error`s; `ErrorBoundary.componentDidCatch` has no Sentry call either. Only uncaught errors reaching `global-error.tsx:13` hit Sentry, so the *entire* canonical error path is invisible in the dashboard (contradicts CLAUDE.md's observability guidance). Fix: `Sentry.captureException(error, { extra: context })` inside `logError` + the ErrorBoundary. Effort S / Risk LOW.

**DX-02 — No formatter / pre-commit hooks; style drift already present.** `confirmed` · MED — no Prettier/husky/lint-staged/.editorconfig; `lib/openrouter.ts` + `middleware.ts` already use single quotes / 4-space indent against CLAUDE.md. Fix: Prettier (`semi:true`, double quotes, 2-space, trailing-all) + husky + lint-staged + `.editorconfig`. Effort S / Risk LOW.

**DX-03 — Required `KV_REST_API_URL` / `KV_REST_API_TOKEN` missing from `.env.sample` + CONTRIBUTING.** `confirmed` · MED — `middleware.ts:7` and `lib/redis.ts:5` use non-null assertions; a contributor copying the sample hits a `UrlError` crash in edge middleware on first home-page load. Fix: add the vars (empty + comments) to `.env.sample` + CONTRIBUTING; guard the Redis client construction for graceful degradation. Effort S / Risk LOW.

**DX-05 — Node version only in README (18.17+), CI uses 20, no `.nvmrc`/`engines`.** `lead` · LOW — Fix: add `.nvmrc` (`20`) + `engines`, update README.

**DX-06 — ESLint config excludes all test files (`ignores:["**/*.test.ts"]`).** `lead` · LOW — test files accumulate lint debt unseen. Fix: remove the ignore, add the vitest globals/plugin, fix fallout.

**DX-07 — Sentry `tracesSampleRate: 1` in all three configs.** `lead` · LOW — 100% tracing in prod inflates quota/latency. Fix: `NODE_ENV==='production' ? 0.1 : 1`.

---

## Docs

**DOC-01 — `COMPONENTS.md` documents the dead `FloatingNavbar` pattern as active.** `confirmed` · MED — `COMPONENTS.md:100-131` describes a Navigation that imports `floating-navbar` (orphaned/dead); the real `navigation.tsx` is a unified component. Misleads contributors/agents. Fix: rewrite the Navigation section to match reality.

**DOC-02 — `ARCHITECTURE.md` tool/route inventory is stale.** `confirmed` · MED — omits base64, regex, snippet-generator, markdown (and 2048 in games) that exist in `lib/tools.ts`/`lib/games.ts`. Fix: update the structure tree + routing diagram.

**DOC-03 — AGENTS.md TS-flag list diverges from CLAUDE.md (3 flags missing).** `lead` · LOW — drops `noUnusedParameters`, `noFallthroughCasesInSwitch`, `noImplicitOverride`. CLAUDE.md says keep them in sync.

**DOC-04 — AGENTS.md missing the Sentry structured-logging section.** `lead` · LOW — agents working from AGENTS.md won't know `Sentry.startSpan`/`logger.fmt`. Fix: copy the section from CLAUDE.md.

---

## Direction (options for the maintainer — not ranked against bugs)

- **DIR-01 — Ship the 3 finished games (Snake, Dino, Memory).** `confirmed` — fully playable but hidden behind `<WorkInProgress>` + `comingSoon` (`games.ts:12-64`, `wip.tsx:14`). Near-zero cost to launch; delivers the "and games" half of the product. *Effort S (coarse).*
- **DIR-05 — Build the SQL Formatter** (`/tools/sql` route exists, `comingSoon`). Pure-logic, perfect fit for the `lib/<tool>` + client pattern; natural sibling to JSON/Base64. *Effort M (coarse).*
- **DIR-03 — Surface the usage data already persisted.** `tool-settings` tracks `usageCount`/`lastUsed` but no UI reads it, and only 5/13 tools even record it. A "recent/most-used" row + optional favorites is one selector away (after backfilling the 7 missing `updateToolUsage` calls). *Effort M (coarse).*
- **DIR-04 — Reuse the OpenRouter action beyond the text tool** (explain-regex, explain-SQL). The server-action + key plumbing is amortized across one feature; opt-in helpers are cheap. *Depends on SEC-01 rate-limiting first. Effort M (coarse).*
- **DIR-06 — Bring the Notion roadmap on-repo (`ROADMAP.md`).** Intent currently drifts across Notion, `comingSoon` flags, and GitHub issues (built games still flagged). *Effort S (coarse).*
- **DIR-02 (command palette) — stale, already shipped.** `command-menu.tsx` is the live ⌘K registry-bound palette. The only real nugget: the cmdk `ui/command.tsx` primitive is orphaned (command-menu hand-rolls its own) — a minor consolidation, not a feature.

---

## Suggested plan bundling + dependency order

1. **Dead-weight purge** — PERF-01/DEP-01, PERF-03, DEBT-02, DEBT-01 (+ DEBT-07/08). One coordinated removal + `build` verify.
2. **Bundle diet** — PERF-02 (niceware), PERF-04 (JSON CodeMirror), PERF-06 (font scope).
3. **CI quality gate** — DX-01/TEST-04 (+ `typecheck` script). *Do early; guards every later plan.*
4. **Secrets + server-action hardening** — CoinGecko key rotation+env, SEC-01 rate-limit, DEP-02 Next bump, DX-04 Sentry wiring.
5. **Persisted-store correctness + tests** — BUG-03, BUG-02, with TEST-01/03/07 characterization tests landing alongside.
6. *(optional)* **Markdown render hardening** — SEC-03 CSP + DEP-05 mermaid. **Docs refresh** — DOC-01/02. **`ToolPageHeader`** — DEBT-05.

---

## Not audited (carry-forward)

`lib/regex-tester/explain.ts` + token-labels; `lib/json/patch.ts` + `generate/*` internals; `lib/markdown/*` export/image utils; dino/memory game hooks; `lib/snippet-generator/export.ts` + validators; the edge middleware visitor-count logic + `lib/redis.ts` deeply; `app/api/stats/route.ts` deeply; the IndexedDB concurrency-lock (`storage.ts` `enqueue`) edge cases; Zustand subscription-selector granularity; React Compiler / PWA-caching assessment.

## Verification corrections (transparency)

- **PERF-04** — markdown editor is *already* dynamic; the static-CodeMirror offender is the JSON tool's `text-view.tsx`.
- **DEBT-01** — `tools-context` is *live*; the dead layer is `ActivityProvider` + `migration.ts` shims (finder had it inverted).
- **DEP-03** — only arm64+wasm binaries present locally (not "four linux variants").
- **DEP-04** — js-yaml GHSA uncorroborated; `JSON_SCHEMA` mitigates → downgraded to optional.
- **TEST-02** — CoinGecko key is in `api.ts` only, not duplicated in `crypto-data.ts`; reclassified as a security finding.
- **DIR-02** — command palette already exists (`command-menu.tsx`); finding is stale.
