---
name: astraa-code-quality
description: Apply Astraa implementation and release-quality standards. Use for any Astraa implementation, refactor, code review, bug fix, or validation-selection task involving TypeScript, style, accessibility, security, performance, error handling, observability, tests, build gates, or release readiness.
---

# Astraa Code Quality

Use the live repository configuration as executable truth, then apply the detailed review
matrix to the files and risks in scope.

## Review workflow

1. Read [the review checklist](references/review-checklist.md) before implementing,
   refactoring, reviewing, or declaring a change ready.
2. Inspect `package.json`, relevant config files, and `.github/workflows/ci.yml`; do not rely
   on a memorized command list.
3. Preserve user changes and understand existing behavior before editing. Keep changes
   surgical and avoid unrelated cleanup.
4. Apply every relevant checklist section. Record non-applicable sections instead of
   silently skipping meaningful risk.
5. Run focused feedback while iterating, then every applicable repository gate exposed by
   the live scripts and CI before completion.
6. Report exact commands, results, manual checks, and any skipped verification. Do not call
   a change release-ready while a required gate is failing.

When placement or boundary ownership is uncertain, load `$astraa-architecture`. When the
change is a new or materially changed feature, also load `$astraa-feature-workflow`.
