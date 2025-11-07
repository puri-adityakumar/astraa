# Architecture Decision Records (ADRs)

This directory contains Architecture Decision Records (ADRs) for the Astraa project. ADRs document important architectural decisions made during the development of the application.

## What is an ADR?

An Architecture Decision Record (ADR) is a document that captures an important architectural decision made along with its context and consequences.

## ADR Format

Each ADR follows this structure:

```markdown
# [Number]. [Title]

Date: YYYY-MM-DD

## Status
[Proposed | Accepted | Deprecated | Superseded by ADR-XXX]

## Context
What is the issue that we're seeing that is motivating this decision or change?

## Decision
What is the change that we're proposing and/or doing?

## Consequences
What becomes easier or more difficult to do because of this change?

### Positive Consequences
- Benefit 1
- Benefit 2

### Negative Consequences
- Drawback 1
- Drawback 2

## Alternatives Considered
What other options were considered?

## References
- Link 1
- Link 2
```

## Index of ADRs

### Framework and Core

1. [ADR-001: Use Next.js 15 as Framework](./001-nextjs-framework.md) - Accepted
2. [ADR-002: Use TypeScript for Type Safety](./002-typescript.md) - Accepted
3. [ADR-003: Use Zustand for State Management](./003-zustand-state-management.md) - Accepted

### UI and Styling

4. [ADR-004: Use Tailwind CSS for Styling](./004-tailwind-css.md) - Accepted
5. [ADR-005: Use Radix UI for Accessible Components](./005-radix-ui-components.md) - Accepted

### Development and Quality

6. [ADR-006: Monorepo vs Multi-repo Structure](./006-repository-structure.md) - Accepted

## Creating a New ADR

When making a significant architectural decision:

1. Copy the template above
2. Create a new file: `docs/adr/XXX-title-in-kebab-case.md`
3. Fill in the sections
4. Submit for review as part of your PR
5. Update this README with the new ADR

## When to Create an ADR

Create an ADR when:
- Making technology choices (frameworks, libraries)
- Defining architectural patterns
- Making decisions with long-term impact
- Choosing between multiple approaches
- Establishing project conventions

Don't create an ADR for:
- Minor implementation details
- Temporary solutions
- Obvious choices with no alternatives
- Decisions easily reversible

## ADR Lifecycle

1. **Proposed**: Initial proposal under discussion
2. **Accepted**: Decision approved and implemented
3. **Deprecated**: No longer recommended but still in use
4. **Superseded**: Replaced by a newer ADR

## Benefits of ADRs

- **Historical Context**: Understand why decisions were made
- **Onboarding**: Help new team members understand architecture
- **Prevent Regression**: Avoid revisiting settled decisions
- **Knowledge Sharing**: Document team's collective knowledge
- **Decision Quality**: Force thorough analysis before deciding

## Resources

- [ADR GitHub Organization](https://adr.github.io/)
- [Michael Nygard's ADR Template](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions)
