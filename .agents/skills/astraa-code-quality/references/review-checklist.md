# Astraa review checklist

Use this matrix in proportion to the change. A release-readiness review must cover every
section; an implementation may mark a section not applicable with a reason.

## Behavior and scope

- Confirm the requested behavior, non-goals, and current implementation before editing.
- Preserve unrelated work and public behavior unless the change explicitly alters it.
- Cover empty, loading or hydration, success, recoverable error, unrecoverable error, and
  retry states when the flow can enter them.
- Define refresh, navigation, and unsaved-data behavior for persistent or long-running work.
- Gate destructive actions with confirmation and make recovery clear.

## Architecture and dependencies

- Use `$astraa-architecture` when layer placement, state, provider, cache, registry,
  privacy, observability, or indexing boundaries are involved.
- Reuse current UI primitives and shared helpers before adding an abstraction or dependency.
- Justify heavy browser dependencies and dynamically load them when they are not required
  for the initial route.
- Keep components focused, pure logic outside React, and server-only concerns outside the
  client bundle.

## TypeScript and repository style

- Satisfy strict TypeScript, including unused symbols, implicit returns, unchecked indexed
  access, and exact optional properties. Prefer `unknown` plus narrowing over `any`.
- Add explicit return types to public functions and model domain states with precise types.
- Use double quotes, semicolons, two-space indentation, trailing commas in multiline
  structures, and lines no longer than 100 characters unless tooling requires otherwise.
- Order imports as external libraries, internal utilities, components, then types.
- Use PascalCase components and types, camelCase functions and variables,
  UPPER_SNAKE_CASE constants, and kebab-case filenames.
- Compose conditional classes with `cn()` and order Tailwind classes as layout, spacing,
  sizing, typography, color or background, border, effects, states, then responsive rules.

## Accessibility and responsive behavior

- Use semantic elements and labels; add `aria-label` to icon-only controls.
- Keep every action keyboard reachable with visible focus and logical focus movement.
- Maintain at least 44-by-44-pixel pointer targets.
- Announce meaningful asynchronous or dynamic changes with suitable live regions.
- Respect `useReducedMotion()` and avoid motion-only meaning.
- Check small/mobile and desktop layouts plus dark and light themes for UI changes.

## Security, privacy, and resilience

- Treat user content as untrusted; avoid untrusted HTML and bound upload, input, storage,
  cache, and collection sizes.
- Keep secrets server-only and validate, normalize, timeout, and abort remote work where
  applicable. Do not expose upstream payloads or credentials in public errors.
- Persist only data the feature contract permits. Provide a usable in-memory fallback when
  browser storage is unavailable.
- Sanitize sensitive values before logging or telemetry. Never log raw tool input,
  credentials, request bodies, clipboard data, detailed URLs, or personal identifiers.
- Keep Sentry and analytics behavior consistent with the documented opt-in configuration.

## Errors and observability

- Render expected validation failures beside the relevant control.
- Route unexpected failures through the repository's user-friendly error and sanitized
  observability helpers; include only safe context needed to debug.
- Use persistent UI for persistent errors. Do not rely on a toast as the only accessible
  error state.
- Add meaningful instrumentation only for flows whose failures or latency need diagnosis.

## Performance

- Avoid network work caused only by local input changes when a stable resource can be
  cached and derived locally.
- Bound and deduplicate remote requests, preserve useful stale data during refresh, and
  prevent stale responses from winning races.
- Debounce hot-path input or viewport work where appropriate and avoid broad store
  subscriptions or unnecessary rerenders.
- Assess initial route bundle impact and keep nonessential work out of the critical path.

## Tests and executable gates

- Add or update co-located tests for pure logic, migrations, boundary conditions, malformed
  input, and regression cases.
- Cover route, accessibility, SEO, and production-browser behavior in the existing browser
  suite when those contracts change.
- Inspect the current `package.json` scripts and `.github/workflows/ci.yml` before selecting
  commands. Run the smallest relevant check during iteration and all applicable canonical
  quality, production-build, and browser gates before release.
- Report the exact commands and outcomes. A skipped or environment-blocked check must be
  explicit and must not be represented as passing.

## Completion

- Re-read the diff for scope, secrets, generated artifacts, debug output, and stale copy.
- Confirm documentation and metadata remain truthful where behavior changed.
- Ensure no failure is hidden by an allowlist, disabled rule, or weakened assertion.
- Summarize residual risk and manual verification separately from automated evidence.
