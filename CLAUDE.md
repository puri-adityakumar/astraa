# Astraa repository guide

Astraa is a Next.js 16 App Router utility toolkit built with React 19, strict TypeScript,
Tailwind CSS, Vitest, and Playwright. Most tools process data locally; provider credentials
and remote-resource policy stay on the server.

## Bootstrap

- Use Node.js 22 or later and install the locked dependency graph with `npm ci`.
- Start local development with `npm run dev`.
- Read scripts from `package.json` and CI behavior from `.github/workflows/ci.yml`; they are
  the executable verification truth.
- Run the canonical quality, production E2E build, and browser gates before release.

## Canonical ownership

| Canonical source          | Owns                                                            |
| ------------------------- | --------------------------------------------------------------- |
| `docs/*.md`               | Public factual and explanatory documentation                    |
| `CONTRIBUTING.md`         | Human issue, assignment, commit, PR, review, and release policy |
| `.agents/skills/astraa-*` | Agent procedures, decisions, and completion checklists          |
| `AGENTS.md`, `CLAUDE.md`  | Bootstrap commands and the identical repository-skill registry  |
| `package.json`, CI        | Executable verification truth                                   |

Summaries may link to a canonical source but must not restate its normative checklist.

## Repository skill registry

Load every skill whose trigger matches the task, including the references that skill directs
you to read. When several match, load and execute them in this order:
`astraa-feature-workflow` → `astraa-architecture` → `astraa-code-quality`, then consult human
policy in `CONTRIBUTING.md`. This sequence is not authority precedence. Resolve conflicts by
the canonical ownership table above: feature workflow owns feature orchestration,
architecture owns placement and boundary invariants, and code quality owns implementation
and release checks. `CONTRIBUTING.md` always wins for human issue, branch, commit,
pull-request, review, and release policy. Stop and surface any remaining ownership conflict
that cannot be resolved without changing scope.

<!-- ASTRAA_SKILLS_START -->

- **`astraa-architecture`**
  - Path: `.agents/skills/astraa-architecture/SKILL.md`
  - Trigger: Decide where Astraa work belongs and which architectural invariants apply. Use
    when work involves route or layer placement, server/client boundaries, tool or game
    registries, Zustand state or browser persistence, server interfaces, provider caching,
    privacy or observability boundaries, SEO or indexing architecture, or review of any of
    those decisions.
- **`astraa-code-quality`**
  - Path: `.agents/skills/astraa-code-quality/SKILL.md`
  - Trigger: Apply Astraa implementation and release-quality standards. Use for any Astraa
    implementation, refactor, code review, bug fix, or validation-selection task involving
    TypeScript, style, accessibility, security, performance, error handling, observability,
    tests, build gates, or release readiness.
- **`astraa-feature-workflow`**
  - Path: `.agents/skills/astraa-feature-workflow/SKILL.md`
  - Trigger: Plan, build, or complete an Astraa feature through its full contributor
    contract. Use for a new or materially changed tool, game, public route, provider-backed
    feature, or contributor pull request; do not use for a standalone copy edit or unrelated
    documentation typo.

<!-- ASTRAA_SKILLS_END -->

## Canonical project references

- [Architecture](docs/ARCHITECTURE.md)
- [Server interfaces](docs/API.md)
- [Components](docs/COMPONENTS.md)
- [SEO](docs/SEO.md)
- [Human contribution policy](CONTRIBUTING.md)
