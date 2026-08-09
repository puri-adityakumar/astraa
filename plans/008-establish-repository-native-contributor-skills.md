# Plan 008: Establish one tracked contributor skill system for Codex and Claude

> **Executor instructions**: Follow this plan step by step. Use the repository's
> installed `skill-creator` skill when authoring the three skills. Run every
> verification command before moving on. Do not modify, delete, or vendor the
> user's ignored generic skills. Update this plan's row in `plans/README.md`
> after all gates pass.
>
> **Drift check (run first)**:
> `git diff --stat 94a1b1f -- .gitignore .agents .claude AGENTS.md CLAUDE.md CONTRIBUTING.md .github/pull_request_template.md package.json scripts`
> `git status --short -- .gitignore .agents .claude AGENTS.md CLAUDE.md CONTRIBUTING.md .github/pull_request_template.md package.json scripts`
> This plan targets the uncommitted result of Plans 001–007, not the historical
> contents of commit `94a1b1f`. Compare the facts below with the live worktree.
> STOP on an unexplained mismatch.

## Status

- **Priority**: P1
- **Effort**: M
- **Risk**: MED
- **Depends on**: Plans 001–007 complete
- **Category**: dx
- **Planned at**: commit `94a1b1f`, 2026-08-09

## Why this matters

Astraa's architectural and quality rules are copied across `AGENTS.md`,
`CLAUDE.md`, `CONTRIBUTING.md`, and `docs/`, and those copies have already
drifted. The local `.agents/` and `.claude/` trees are also ignored, so none of
their repository-specific knowledge reaches a fresh contributor checkout.
This phase creates three small, tracked, single-source skills and makes their
registry enforceable in CI.

## Current state

- `.gitignore:48-51` ignores all of `.agents/` and `.claude/`.
- `git ls-files .agents .claude` returns no tracked paths.
- `.claude/skills/improve` and `.claude/skills/refactor` are local symlinks to
  `.agents/skills/*`, while the two SEO skill trees are independent local
  copies. Their provenance is outside this plan.
- `AGENTS.md:1-237` contains architecture, style, page templates, accessibility,
  and a long feature checklist. `CLAUDE.md` repeats the same topics.
- The page examples disagree: `AGENTS.md:72-109` includes `RelatedTools`, while
  the current Claude example includes a stale render-time `lastUpdated` pattern.
  The current production pattern is visible in `app/tools/password/page.tsx`.
- `CONTRIBUTING.md:121-128` requires `npm run check`, a production E2E build,
  Playwright, and manual responsive/theme review. The PR template only mentions
  unit tests and a generic build (`.github/pull_request_template.md:13-20`).
- `package.json:6` runs formatting, lint, TypeScript, unit, and Knip checks, but
  it does not validate skills or the two agent registries.

Use this ownership contract:

| Canonical source | Owns |
|---|---|
| `docs/*.md` | Public factual and explanatory documentation |
| `CONTRIBUTING.md` | Human issue, assignment, commit, PR, review, and release policy |
| `.agents/skills/astraa-*` | Agent procedures, decisions, and completion checklists |
| `AGENTS.md`, `CLAUDE.md` | Bootstrap commands and the identical repository-skill registry |
| `package.json`, CI | Executable verification truth |

A summary may link to a canonical source, but it must not restate its normative
checklist.

## Commands you will need

| Purpose | Command | Expected on success |
|---|---|---|
| Initialize a skill | `python3 /Users/aditya/.codex/skills/.system/skill-creator/scripts/init_skill.py <name> --path .agents/skills --resources references` | creates one skill skeleton |
| Validate one skill | `python3 /Users/aditya/.codex/skills/.system/skill-creator/scripts/quick_validate.py .agents/skills/<name>` | reports a valid skill |
| Repo skill gate | `npm run check:skills` | exit 0 |
| Full quality gate | `npm run check` | exit 0 |
| Production browser artifact | `npm run build:e2e -- --webpack` | exit 0 |
| Browser suite | `npm run test:e2e` | all projects pass |

The absolute authoring-script paths are valid in the planning environment. If
another contributor does not have those system scripts, they may author the
same file structure manually, but the tracked repo validator remains mandatory.

## Suggested executor toolkit

- Invoke `skill-creator` before editing skill files.
- After authoring, use fresh isolated agent tasks to forward-test all three
  triggers. Do not reveal the expected answer in the test prompt.

## Scope

**In scope**:

- `.gitignore`
- new `.agents/skills/astraa-architecture/**`
- new `.agents/skills/astraa-code-quality/**`
- new `.agents/skills/astraa-feature-workflow/**`
- new matching `.claude/skills/astraa-*` relative symlinks
- `AGENTS.md`, `CLAUDE.md`
- `CONTRIBUTING.md`
- `.github/pull_request_template.md`
- new `scripts/check-repo-skills.mjs`
- `package.json`

**Out of scope**:

- Existing ignored `improve`, `refactor`, `seo-audit`, or `seo-geo` skills.
- Converting independent ignored SEO copies to symlinks.
- Public `/docs` rendering or edits to public documentation; Plan 011 owns it.
- Product/source-code changes.
- Global user skills outside this repository.

## Git workflow

- Suggested branch: `codex/008-repo-skills`
- Suggested commit: `docs(skills): add astraa contributor workflows`
- Do not push or open a PR unless the operator asks.

## Steps

### Step 1: Allowlist only Astraa-owned skills

Replace the broad ignore behavior with scoped negations that continue ignoring
the local trees by default while allowing exactly these tracked paths:

- `.agents/skills/astraa-architecture/**`
- `.agents/skills/astraa-code-quality/**`
- `.agents/skills/astraa-feature-workflow/**`
- the three corresponding `.claude/skills/astraa-*` symlinks

Do not unignore `.agents/skills/*` or `.claude/skills/*` broadly. Verify that
`git status --short` exposes only the new Astraa-owned entries, never the local
generic skills.

Use this structural pattern (repeat the final two allowlist lines for all three
names); the parent directories must be unignored before their children:

```gitignore
.agents/*
!.agents/skills/
.agents/skills/*
!.agents/skills/astraa-architecture/
!.agents/skills/astraa-architecture/**

.claude/*
!.claude/skills/
.claude/skills/*
!.claude/skills/astraa-architecture
```

Keep `.agent/` ignored. Confirm behavior with `git check-ignore`; do not infer it
from the visual order of patterns alone.

**Verify**:
`git check-ignore -v .agents/skills/seo-audit/SKILL.md` still reports an ignore
rule, while `git check-ignore -q .agents/skills/astraa-architecture/SKILL.md`
exits 1 after the file exists.

### Step 2: Create three non-overlapping canonical skills

Create only the following taxonomy under `.agents/skills/`:

1. `astraa-architecture`
   - Trigger on route/layer placement, server/client boundaries, registries,
     state/persistence, server interfaces, caching, privacy/observability, or
     indexing architecture.
   - Decide where work belongs and which invariants apply.
   - Link conditionally to `docs/ARCHITECTURE.md`, `docs/API.md`,
     `docs/COMPONENTS.md`, `docs/SEO.md`, and subsystem READMEs. Do not copy
     those documents into skill references.
2. `astraa-code-quality`
   - Trigger on any Astraa implementation, refactor, code review, or validation
     selection.
   - Own strict TypeScript, import/naming/style rules, accessibility, security,
     performance, error handling/observability, tests, and quality gates.
   - Put the detailed review matrix in one
     `references/review-checklist.md`; read commands from `package.json` and CI
     rather than freezing copies inside the skill.
3. `astraa-feature-workflow`
   - Trigger on planning, building, or completing a new or materially changed
     tool, game, public route, provider-backed feature, or contributor PR.
   - Own the standard feature contract: goal/non-goals, states, layer
     placement, registry/metadata, privacy classification, accessibility,
     testing, documentation/SEO, launch status, and verification.
   - Put the detailed contract in `references/feature-contract.md`.
   - Explicitly load architecture guidance first, then code-quality guidance,
     and read human policy from `CONTRIBUTING.md`.

Each `SKILL.md` frontmatter must contain only `name` and a trigger-complete
`description`. Keep the body concise and progressively load its one-level
references. Generate `agents/openai.yaml` for every skill. Do not add README
files, assets, or scripts inside the skill folders.

**Verify**: run `quick_validate.py` against each directory; all three pass.

### Step 3: Register the same canonical skills for Claude

Create relative symlinks:

```text
.claude/skills/astraa-architecture -> ../../.agents/skills/astraa-architecture
.claude/skills/astraa-code-quality -> ../../.agents/skills/astraa-code-quality
.claude/skills/astraa-feature-workflow -> ../../.agents/skills/astraa-feature-workflow
```

Do not create independent file copies. If the target platform cannot preserve
symlinks, STOP and propose generated checksum-enforced mirrors; do not silently
duplicate them.

**Verify**:
`find .claude/skills -maxdepth 1 -type l -name 'astraa-*' -exec test -e {} \;`
exits 0 and `git diff --no-index` is unnecessary because both paths resolve to
the same files.

### Step 4: Reduce agent entry files to bootstrap registries

Replace duplicated procedures in `AGENTS.md` and `CLAUDE.md` with:

- a short project/command bootstrap;
- the ownership contract above;
- one machine-delimited repository-skill registry block, delimited exactly by
  `<!-- ASTRAA_SKILLS_START -->` and `<!-- ASTRAA_SKILLS_END -->`, containing all three
  names, paths, and exact trigger summaries;
- instructions to load every matching skill and resolve conflicts in the order
  feature workflow → architecture → code quality → human policy.

The registry blocks must be byte-identical. Do not leave a stale page template,
style list, or feature checklist in either file. Link to the canonical sources.

**Verify**: the repo validator from Step 6 reports identical complete registry
blocks; `rg -n 'lastUpdated|new Date\(\).*toLocaleDateString' AGENTS.md CLAUDE.md`
returns no matches.

### Step 5: Keep human policy host-neutral and align the PR checklist

Retain issue assignment, Conventional Commits, target branch, setup, PR, review,
and release policy in `CONTRIBUTING.md`. Replace the Claude-specific section and
duplicated architecture/style instructions with a host-neutral link to the
tracked skill registry.

Update `.github/pull_request_template.md` so its executable checklist matches
the canonical contributor gates:

- `npm run check`
- `npm run build:e2e -- --webpack`
- `npm run test:e2e`
- relevant unit tests and mobile/desktop, dark/light manual coverage

Do not claim CI executes a command it does not execute.

**Verify**:
`rg -n 'npm run check|npm run build:e2e -- --webpack|npm run test:e2e' CONTRIBUTING.md .github/pull_request_template.md`
finds all three commands in both contributor-facing checklists.

### Step 6: Add a deterministic repository skill validator

Create `scripts/check-repo-skills.mjs` using Node standard-library APIs only.
It must fail nonzero when any of these invariants break:

- exactly the three configured Astraa skill folders exist, are allowlisted by
  `.gitignore`, and are visible to `git status` for inclusion in a commit;
- folder names match frontmatter `name` values;
- descriptions are present and nonempty;
- `agents/openai.yaml` exists for each skill;
- every Claude entry is a resolving relative symlink to its canonical folder;
- the registry blocks in `AGENTS.md` and `CLAUDE.md` are identical and list all
  three skills once;
- no independent tracked `.claude/skills/astraa-*` directory exists.

When `CI=true`, additionally require `git ls-files` to contain every canonical
skill file and Claude symlink. Skip only that tracked-file assertion in a local
unstaged worktree; all structural/content checks remain mandatory locally.

Add `check:skills` and invoke it from `npm run check` before Knip. Keep CI using
the single `npm run check` source of truth.

**Verify**: `npm run check:skills` exits 0. Temporarily corrupt one assertion in
a disposable working copy or unit-level fixture and confirm the script exits
nonzero, then restore it without touching user changes.

### Step 7: Forward-test trigger and answer quality

In fresh isolated agent contexts, submit at least these neutral prompts:

- “Where should a cache for a new provider-backed tool live in Astraa?”
- “Review this Astraa component for release readiness.”
- “Plan a new local CSV tool for Astraa.”
- negative control: “Fix spelling in a standalone README sentence.”

Record only a concise test matrix in the implementation handoff. Expected:

- architecture prompt loads architecture guidance;
- review prompt loads code quality;
- new feature loads feature workflow plus its two dependencies;
- negative control does not load an unrelated feature workflow.

Revise descriptions if triggers are missed or overlap excessively, then rerun
the official and repo validators.

**Verify**: all four prompts meet the expected routing behavior and no skill
requires hidden conversation context.

### Step 8: Run repository gates

Run `npm run check`, `npm run build:e2e -- --webpack`, and
`npm run test:e2e`. Inspect `git status --short` and confirm no ignored generic
skill became tracked.

**Verify**: every command exits 0 and only in-scope files are modified.

## Test plan

- `scripts/check-repo-skills.mjs` covers registry completeness, frontmatter,
  generated UI metadata, symlink integrity, and mirror prohibition.
- Official `quick_validate.py` validates each authored skill.
- Four fresh-agent prompts forward-test trigger behavior and output usefulness.
- Existing full quality/build/browser gates prove the documentation-only
  migration did not affect runtime behavior.

## Done criteria

- [ ] Exactly three repository-owned `.agents/skills/astraa-*` skills exist and are not ignored.
- [ ] Exactly three resolving `.claude/skills/astraa-*` symlinks exist.
- [ ] All skills contain `SKILL.md` and `agents/openai.yaml` and pass official validation.
- [ ] `AGENTS.md` and `CLAUDE.md` contain identical complete registry blocks and no duplicated manuals.
- [ ] Human contribution policy remains complete and host-neutral.
- [ ] `npm run check:skills`, `npm run check`, the E2E build, and Playwright pass.
- [ ] No ignored generic skill is newly tracked, modified, or deleted.
- [ ] `plans/README.md` marks Plan 008 `DONE`.

## STOP conditions

Stop and report if:

- The worktree does not contain the completed Plans 001–007 state described above.
- A fact cannot be assigned uniquely to public docs, human policy, or an agent procedure.
- A target environment cannot preserve symlinks; propose checksum-enforced mirrors instead.
- Unignoring the requested paths exposes unrelated local skills or sensitive files.
- Existing ignored skill provenance/licensing would need to be changed.
- Any validator or full repository gate still fails after two focused attempts.

## Maintenance notes

- New repository skills must be intentionally added to both registry blocks and
  the validator allowlist; do not grow the taxonomy for minor topics.
- When commands change, update `package.json`/CI first. Skills should read that
  executable truth instead of duplicating command lists.
- Plan 011 will prune duplicated procedural passages from public docs after the
  new skills are available.
