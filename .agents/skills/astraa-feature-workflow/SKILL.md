---
name: astraa-feature-workflow
description: Plan, build, or complete an Astraa feature through its full contributor contract. Use for a new or materially changed tool, game, public route, provider-backed feature, or contributor pull request; do not use for a standalone copy edit or unrelated documentation typo.
---

# Astraa Feature Workflow

Drive a feature from intent through verified launch state without omitting cross-cutting
contracts.

## Load and execute dependencies in order

1. Load [Astraa architecture](../astraa-architecture/SKILL.md) first and use it to decide
   route, client, logic, state, registry, server, cache, privacy, observability, and indexing
   placement.
2. Load [Astraa code quality](../astraa-code-quality/SKILL.md) second, including its detailed
   review checklist, and use live package and CI configuration to select gates.
3. Read [CONTRIBUTING.md](../../../CONTRIBUTING.md) for issue assignment, branch, commit,
   pull-request, review, and release policy. Do not restate or reinterpret human policy.

This list defines load and execution order, not authority. Resolve conflicts by canonical
ownership: this skill owns the feature procedure and contract, architecture owns placement
and boundary invariants, and code quality owns implementation and release-quality checks.
`CONTRIBUTING.md` always wins for human issue, branch, commit, pull-request, review, and
release policy. Surface any overlap that cannot be reconciled without changing scope.

## Execute the feature contract

1. Read [the feature contract](references/feature-contract.md) completely.
2. Write down the goal, non-goals, user-visible states, layer placement, registry and
   metadata impact, data classification, accessibility behavior, tests, documentation or
   SEO impact, launch status, and verification evidence before implementation.
3. Treat every unanswered contract item as a gap, an explicit non-applicable item, or an
   out-of-scope decision. Prefer a smaller complete first version over an underspecified
   broad one.
4. Implement in dependency order: pure contracts and logic, server or persistence
   boundaries, client UI, route and registry integration, then documentation and tests.
5. Run focused checks while iterating and all applicable live repository gates before
   completion. Report exact results and remaining risks.
