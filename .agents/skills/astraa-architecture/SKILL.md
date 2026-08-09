---
name: astraa-architecture
description: Decide where Astraa work belongs and which architectural invariants apply. Use when work involves route or layer placement, server/client boundaries, tool or game registries, Zustand state or browser persistence, server interfaces, provider caching, privacy or observability boundaries, SEO or indexing architecture, or review of any of those decisions.
---

# Astraa Architecture

Determine ownership and boundaries before editing. State the chosen layers and the
invariants that constrain them.

## Decide placement

1. Inspect the requested change, neighboring implementation, and current repository state.
2. Assign each responsibility to its narrowest owner:
   - route composition and metadata: `app/` server pages;
   - browser interaction and view state: focused `components/` clients;
   - parsing, validation, conversion, and reusable domain logic: `lib/<feature>/`;
   - durable editor state: a focused `lib/stores/` module using the shared adapter;
   - credentials, upstream policy, and shared remote data: server routes, actions, or
     server-only helpers;
   - stable identity, canonical path, availability status, processing classification, and
     related IDs: the immutable tool or game registry;
   - route robots and canonical metadata: the route's server page;
   - indexable-path and sitemap membership: `lib/seo/site.ts`, including the separate
     `GAMES_INDEXING_ENABLED` launch gate for games.
3. Keep provider credentials and sensitive policy out of client bundles. Prefer local
   processing when the feature contract does not require a remote provider.
4. Avoid global providers, mirrored catalogs, generic stores, or new abstractions unless
   multiple current consumers justify them.
5. Verify the decision against live callers, tests, and configuration. Call out any
   deliberate exception and its cost.

## Load canonical context conditionally

- Read [Architecture](../../../docs/ARCHITECTURE.md) for rendering, registries, state,
  remote-data, privacy, observability, accessibility, and quality boundaries.
- Read [Server interfaces](../../../docs/API.md) before changing an API route, server
  action, provider helper, cache, timeout, fallback, or client remote-resource hook.
- Read [Component guide](../../../docs/COMPONENTS.md) before choosing component, store,
  primitive, motion, error-feedback, or accessibility patterns.
- Read [SEO baseline](../../../docs/SEO.md) before changing metadata, canonical URLs,
  indexability, sitemap membership, structured data, or launch visibility.
- Read a subsystem README, such as
  [focused stores](../../../lib/stores/README.md) or
  [animation utilities](../../../lib/animations/README.md), when work enters that
  subsystem. Treat live code and configuration as authoritative if prose has drifted.

## Produce an architecture decision

Describe the affected route, client, pure-logic, state, and server boundaries; identify the
canonical registry or interface; separate registry availability from route indexability and
sitemap membership; classify data as local, server-owned, or provider-bound; and list the
tests or documentation surfaces implied by the placement. Keep human workflow policy in
`CONTRIBUTING.md` and code-quality judgment in `$astraa-code-quality`.
