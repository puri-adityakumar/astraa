# Development guide

This guide records the local setup, project boundaries, and executable development context for
human contributors working on Astraa.

## Local commands

```bash
npm ci
npm run dev
npm run check
npm run build:e2e -- --webpack
npm run test:e2e
npm run measure:performance
```

The development server defaults to `http://localhost:3000`. Use another port
with `npm run dev -- --port 3002` when the default is occupied.

## Project layout

```text
app/                         Next App Router pages, metadata, errors, API routes
components/                  Feature components and used UI primitives
hooks/                       Cross-feature client hooks
lib/                         Pure logic, server resources, focused stores
lib/observability/           Sanitization and Sentry policy
lib/rates/                   Rate contracts, providers, and client resource
lib/stores/                  JSON/Markdown/regex/snippet stores and storage adapter
public/                      Static assets
plans/                       Reviewed implementation plans and status
```

## Contributor workflow

Human issue, assignment, commit, pull-request, review, and release rules live only in
[CONTRIBUTING.md](https://github.com/puri-adityakumar/astraa/blob/development/CONTRIBUTING.md).
Coding-agent feature orchestration, placement decisions, and completion checks live in the tracked
[feature workflow](https://github.com/puri-adityakumar/astraa/blob/development/.agents/skills/astraa-feature-workflow/SKILL.md),
[architecture](https://github.com/puri-adityakumar/astraa/blob/development/.agents/skills/astraa-architecture/SKILL.md),
and
[code-quality](https://github.com/puri-adityakumar/astraa/blob/development/.agents/skills/astraa-code-quality/SKILL.md)
skills. The package scripts and CI workflow remain the executable verification truth.

## State decisions

Prefer, in order:

1. a derived value;
2. component-local state;
3. URL state when the user should share or restore it;
4. a focused Zustand store when one editor needs durable state.

Persisted stores must use `createZustandStorage()`, own a schema version and
migration, cap stored data, and remain usable when storage fails. Add a selector
for each component instead of subscribing to the whole store.

## Remote data and caching

Keep provider keys and policy on the server. Validate query parameters before
fetching, set explicit upstream timeouts, validate provider payloads, map errors
to stable public codes, and document cache behavior.

Client caches must have a key strategy, TTL, size bound, invalidation path,
in-flight deduplication, and cancellation semantics. Derived inputs such as a
currency amount should not change the resource key.

## Error handling

```typescript
import { getUserFriendlyError, logError } from "@/lib/error-handler";

try {
  await riskyOperation();
} catch (error) {
  const details = getUserFriendlyError(error);
  toast({
    title: details.title,
    description: details.message,
    variant: "destructive",
  });
  logError(error, { operation: "feature/action" });
}
```

Never log credentials, user-entered documents, prompts, clipboard values,
request bodies, or raw provider output. Extend the tests in
`lib/observability/` before adding a new sensitive diagnostic field.

## Testing strategy

Pure logic receives co-located Vitest tests, including empty, maximum, malformed, timeout, abort,
race, and migration cases where relevant. Playwright exercises the built production app across the
registry, persisted editors, remote-boundary fixtures, keyboard interactions, reduced motion, and
serious/critical WCAG 2.2 axe checks. Provider calls stay fixture-backed in browser tests.

`npm run check` is the deterministic fast gate: format, zero-warning lint, strict TypeScript, Vitest,
and Knip. Build once with `npm run build:e2e -- --webpack` before `npm run test:e2e`; Playwright
starts that artifact and does not rebuild it. See `docs/PERFORMANCE.md` before proposing budgets.

Run `npm run knip` after deleting or moving files. `knip.jsonc` explicitly marks
framework entries, browser workers, and preserved coming-soon implementations;
do not widen an ignore pattern to hide unexplained dead code.

## Environment

Copy `.env.sample` to `.env.local`. Production-backed features use:

- `OPENROUTER_API_KEY` for text generation;
- `COINGECKO_API_KEY` for crypto rates;
- `KV_REST_API_URL`, `KV_REST_API_TOKEN`, and `RATE_LIMIT_SALT` for durable AI rate limiting;
- Sentry DSN/environment pairs for optional sanitized error monitoring;
- `SENTRY_AUTH_TOKEN` only in CI for optional source-map upload;
- `ASTRAA_ENABLE_ANALYTICS=false` to omit Vercel analytics at build time.

Never prefix server secrets with `NEXT_PUBLIC_`.
