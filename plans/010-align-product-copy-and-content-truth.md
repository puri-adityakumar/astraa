# Plan 010: Align Astraa copy around precise capability and data-handling truth

> **Executor instructions**: Treat copy as product behavior. Preserve useful SEO
> intent while removing unsupported superlatives, fabricated-looking sample
> data, and ambiguous local/provider claims. Do not redesign the homepage in
> this phase. Update `plans/README.md` only after automated and rendered-copy
> verification pass.
>
> **Drift check (run first)**:
> `git diff --stat 94a1b1f -- app components lib/tools.ts lib/games.ts lib/hash lib/json lib/seo tests README.md`
> `git status --short -- app components lib/tools.ts lib/games.ts lib/hash lib/json lib/seo tests README.md`
> This plan assumes Plans 001–009 are complete in the live worktree. Reconcile
> those intended edits and STOP on an unexplained content or route mismatch.

## Status

- **Priority**: P1
- **Effort**: M
- **Risk**: MED
- **Depends on**: Plans 008 and 009
- **Category**: docs
- **Planned at**: commit `94a1b1f`, 2026-08-09

## Why this matters

Astraa's new visual system feels focused, but several strings still sound like
generic growth copy, overstate cryptographic suitability, imply a local file is
uploaded, or promise a release schedule. Inconsistent tool names also weaken
navigation and metadata coherence. This phase establishes a concise voice,
canonical naming, exact data-boundary language, and complete guidance for all
12 live tools.

## Current state

- `lib/json/defaults.ts:3-28` preloads plausible Astraa product names, future
  release dates, user counts, ratings, and a `premium` field. It can be mistaken
  for real product evidence.
- `components/json/status-bar.tsx:54-57` and JSON metadata say “100% local.”
  The operation is local, but the absolute marketing phrasing is less precise
  than the privacy policy's scoped statement.
- User-facing file controls call local file selection “Upload” in JSON, Base64,
  Image, Markdown, Regex, and Snippet surfaces. Internal handler/store names are
  implementation details and need not be renamed.
- `lib/hash/types.ts:27-40` describes SHA variants as “ideal for critical
  applications,” “highly secure,” and “strongest.” The guide correctly says the
  raw hash tool is not password storage (`lib/seo/tool-guides.ts:188-192`).
- `components/wip.tsx:18-20` says only “Under construction” and promises users
  should check back “after the next release.” It does not identify the feature.
- `/games` currently leads with “Take a quick reset” even though no game is
  playable (`components/games/games-client.tsx:26-35`).
- `/tools` leads with “Tools arsenal” and “powerful tools designed to enhance
  your workflow” (`components/tools/tools-client.tsx:21-30`).
- `components/text/text-generator-client.tsx:66-69,155` repeats “meaningful,”
  “context-aware,” “modern alternative,” and “magic button” without defining
  the actual provider-backed placeholder workflow.
- Registry/UI/metadata names disagree for Text Generator versus AI Text
  Generator, Calculator versus Scientific Calculator, and Markdown Viewer
  versus Markdown Editor.
- “free online” is repeated in root and several tool metadata objects. It is a
  useful query phrase once, but repeated promotional phrasing adds no product
  clarity.
- `lib/seo/tool-guides.ts:3-13` covers 9 live tools. AI Text Generator,
  Scientific Calculator, and Unit Converter have no server-rendered guide.
- Homepage structure and homepage-specific prose are owned by Plan 012; public
  docs/link labels are owned by Plan 011.

## Copy contract

Every edited string must follow these rules:

1. Lead with a verb and concrete object or outcome.
2. State actual formats, limits, and processing boundary where relevant.
3. For a local tool, use “Processed in this browser” or an equally scoped
   sentence; for a provider-backed tool, name that the relevant selection/topic
   reaches Astraa's server/provider.
4. Use “Choose,” “Open,” or “Load” for a local file; reserve “upload” for a real
   network transfer.
5. Use sentence case, quiet confirmations, and literal action labels. Avoid
   “magic,” “powerful,” “arsenal,” and unsupported superlatives.
6. Call unreleased work “planned” or “not available yet”; never promise timing.
7. Use one canonical display name per tool across registry, H1, catalog,
   command menu, metadata, related links, and guide.
8. Preserve “free online” once in root SEO metadata if desired; elsewhere use
   factual “No account, paywall, or install” language.

Canonical names for this phase:

| ID | Canonical display name |
|---|---|
| `text` | AI Text Generator |
| `calculator` | Scientific Calculator |
| `markdown` | Markdown Editor |

Other registered names stay unchanged unless a factual defect is found.

## Commands you will need

| Purpose | Command | Expected on success |
|---|---|---|
| Copy/unit tests | `npm test -- lib/tools.test.ts lib/seo` | all pass |
| Full quality | `npm run check` | exit 0 |
| Production browser artifact | `npm run build:e2e -- --webpack` | exit 0 |
| SEO/content browser tests | `npm run test:e2e -- --grep "seo|guide|copy|coming soon"` | matching tests pass |
| Full browser suite | `npm run test:e2e` | all projects pass |

## Suggested executor toolkit

- Load `astraa-code-quality` for validation and `astraa-feature-workflow` for
  route/metadata/guide consistency.
- Use the privacy policy and typed registry as factual sources; do not invent
  claims from the desired tone.

## Scope

**In scope**:

- `lib/tools.ts`, `lib/games.ts`, `lib/hash/types.ts`, `lib/json/defaults.ts`
- `lib/seo/tool-guides.ts` and related tests/types
- all available tool page metadata under `app/tools/**/page.tsx`
- tool client headings, descriptions, statuses, empty states, and user-facing
  local file-selection strings under `components/**`
- `components/wip.tsx` and all WIP page call sites/tests
- `app/games/page.tsx`, `components/games/games-client.tsx`
- `app/tools/page.tsx`, `components/tools/tools-client.tsx`
- `app/contribute/page.tsx`, `components/contribute/contribute-client.tsx`
- relevant SEO/content/E2E tests

**Out of scope**:

- Homepage body, hero, navigation IA, or homepage-specific metadata; Plan 012
  owns them and consumes this copy contract.
- `/docs`, README badges, footer project links, Notion content; Plan 011 owns them.
- Changing privacy/legal promises without a new technical data flow.
- Renaming internal `uploadFile`, handler, log-operation, or persisted-state keys
  merely because the visible action becomes “Open.”
- Keyword-volume claims or ranking guarantees without production search data.
- Changing actual tool behavior.

## Git workflow

- Suggested branch: `codex/010-product-copy`
- Suggested commits:
  `fix(copy): align tool names and processing claims` and
  `docs(content): complete available tool guides`.
- Do not push or open a PR unless asked.

## Steps

### Step 1: Lock canonical naming in the typed registry

Update the three names in `lib/tools.ts`, then consume registry truth instead of
adding alternate display constants. Change H1s, page metadata, catalog labels,
command-menu labels, related-tool labels, tests, and guide headings so every
user-visible instance agrees.

An SEO keyword may describe a function (“online calculator”) without becoming
an alternate product name. Child metadata titles stay unbranded because the
root template adds `| Astraa` once.

**Verify**: a unit test iterates available tools and asserts the registry name
appears in its catalog/route contract; rendered title/H1 snapshots contain no
old canonical name or duplicate brand suffix.

### Step 2: Replace fabricated-looking starter data

Keep useful nested JSON types, but use unmistakably fictional neutral data. Do
not include Astraa product names, user/review counts, ratings, launch dates,
pricing, or a `premium` flag. Good sample fields exercise strings, numbers,
booleans, arrays, null, and nested objects without looking like telemetry.

Update tests that intentionally depend on the starter shape; do not weaken JSON
parser/converter coverage.

**Verify**:
`rg -n 'users|rating|premium|released|Code Snippet Generator|Markdown Editor|JSON Editor' lib/json/defaults.ts`
returns no matches and JSON default-state tests pass.

### Step 3: Make processing and local-file language exact

Audit all 12 available tools and their metadata/guides. For local tools, prefer
specific sentences such as “Your JSON is parsed in this browser.” For AI text,
say the topic/instructions are sent through Astraa's server to the configured AI
provider. For Currency, say the selected pair reaches the rate endpoint/provider
while the typed amount remains in-browser, matching the current guide.

Change only visible local-file actions from “Upload” to “Choose,” “Open,” or
“Load,” including accessible names and toast text. Do not alter genuine provider
requests or internal source identifiers.

Remove “100% local” from JSON status/metadata. Keep a compact truthful status
such as “Processed in this browser.”

**Verify**: a rendered-copy test checks representative local, server, and file
controls. `rg -n '100% local' app components lib/seo` returns no matches.

### Step 4: Correct cryptographic descriptions

Rewrite `hashAlgorithms` descriptions as neutral facts:

- MD5 and SHA-1 are legacy and collision-broken for security use;
- SHA-2/SHA-3 descriptions state output size/family and common checksum or
  integrity context without declaring one “strongest” or universally suitable;
- the guide retains the explicit warning that a raw digest is not password
  hashing/storage.

Do not add legal/security guarantees or recommend a raw digest for passwords.

**Verify**:
`rg -n -i 'ideal for critical|highly secure|strongest' lib/hash components/hash`
returns no matches; algorithm IDs and hash outputs remain unchanged in unit tests.

### Step 5: Make planned pages route-specific and schedule-neutral

Refactor `WorkInProgress` to require the route's feature name and type or a
preformatted title/description. Each WIP page must render one identifiable H1
such as “SQL Formatter is planned” and concise text saying it is not available
yet. Remove “next release.”

Update all planned tool/game pages, including `/games/2048`, and change route
tests to assert the route-specific name rather than the old generic H1. Keep
`noindex`, canonicals, status codes, and noninteractive catalog behavior intact.

On `/games`, lead with the fact that these are planned games; do not position a
zero-playable catalog as an immediate reset experience. Remove “free games”
keywords until a game ships.

**Verify**: every `comingSoonTools`/`comingSoonGames` path renders its registered
name, “planned” or “not available,” exactly one H1, and no timing promise.

### Step 6: Replace generic catalog and AI prose

For `/tools`, replace “Tools arsenal” and “powerful tools designed to enhance
your workflow” with exact categories/capabilities. For AI Text Generator, state
that it creates topic-based placeholder copy through a provider and make empty,
loading, error, and success copy literal. Remove “magic,” “modern alternative,”
and repeated “meaningful/context-aware” claims unless the string describes a
specific input/output relationship.

For `/contribute`, lead with useful contributor actions: browse assigned/open
issues and read the contribution guide. Keep GitHub star/founder/community
material secondary and concise. Do not invent contributor counts.

**Verify**:
`rg -n -i 'tools arsenal|powerful tools|magic button|modern alternative|check back after the next release' app components lib`
returns no user-facing matches.

### Step 7: Complete the server-rendered guide set

Add typed guide entries for `text`, `calculator`, and `units`; update their page
components to render `<ToolGuide>` before `<RelatedTools>`, matching the nine
existing routes. Each guide must contain unique:

- task-specific steps;
- real supported inputs/limits/capabilities;
- an example that matches actual output behavior;
- correct local/provider disclosure;
- limitations or cautions.

Keep the interactive tool above the guide. Do not duplicate large generic
paragraphs or claim AI generation succeeds without provider configuration.

**Verify**: `GUIDED_TOOL_IDS` equals the set of `availableTools` IDs and a unit
test fails when a future available tool lacks a guide. Built HTML for each live
tool contains `data-seo-guide=<id>` without client JavaScript.

### Step 8: Preserve one intentional “free online” SEO occurrence

Plan 012 owns root metadata. In this phase remove redundant “free online” and
“free tool” promotional prose from individual tool metadata and visible copy.
Retain query-relevant keywords only where they are not rendered hype. Record in
the handoff that Plan 012 may keep one root occurrence.

**Verify**: outside `app/page.tsx` and root layout metadata, user-facing
descriptions contain no repeated “free online” phrase; no title or description
loses the tool's primary functional intent.

### Step 9: Run rendered-content and full gates

Build, then crawl every indexable and WIP route. Assert one H1, canonical naming,
truthful availability/data handling, no duplicate brand, no serious/critical axe
regression, and no runtime/console error. Review mobile line wrapping at 390 px.

**Verify**: targeted tests, `npm run check`, E2E build, and full Playwright all pass.

## Test plan

- Registry tests enforce canonical names and every available tool's guide.
- JSON tests preserve structural coverage while rejecting fabricated product metrics.
- Hash tests prove algorithms/output unchanged; copy assertions reject superlatives.
- Route tests map every planned path to a route-specific schedule-neutral H1.
- SEO/E2E tests inspect rendered metadata, processing disclosure, guide presence,
  and representative local-file labels.

## Done criteria

- [ ] Starter JSON is clearly fictional and contains no product metrics/pricing signals.
- [ ] Canonical tool names are consistent across all user-visible surfaces.
- [ ] Local/server/hybrid claims match registry and privacy boundaries.
- [ ] Local file selection is not called a network upload in visible UI.
- [ ] Hash descriptions contain no unsupported security superlative.
- [ ] Every WIP route names its feature and makes no schedule promise.
- [ ] Every available tool has a unique server-rendered guide.
- [ ] Targeted tests, `npm run check`, E2E build, and Playwright pass.
- [ ] `plans/README.md` marks Plan 010 `DONE`.

## STOP conditions

Stop and report if:

- A processing claim cannot be proven from the code/privacy boundary.
- Product naming requires changing a stable route or ID; this plan changes only display copy.
- A guide would need a capability or limit not established by source/tests.
- A keyword change is justified only by invented search volume or ranking promises.
- Copy changes alter interaction behavior or provider payloads.
- Full verification still fails after two focused attempts.

## Maintenance notes

- The typed registry is the canonical source of display name, status, and
  processing class; do not introduce parallel content constants for them.
- New available features must ship with their guide and data-handling language.
- Plan 012 applies this copy contract to the redesigned homepage; Plan 011
  applies it to public documentation and project-link labels.
