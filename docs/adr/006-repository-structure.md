# ADR-006: Single Repository (Monorepo) Structure

Date: 2024-01-15

## Status

Accepted

## Context

We need to decide on the repository structure for the Astraa project. Options include:
- Single repository (monorepo) containing all code
- Multiple repositories for different concerns
- Hybrid approach

The project currently consists of:
- Next.js web application
- Multiple utility tools
- Shared components
- Common utilities
- Documentation

## Decision

We will use a **single repository (monorepo)** structure for the entire Astraa project.

### Repository Structure

```
astraa/
├── app/                  # Next.js app directory
│   ├── layout.tsx
│   ├── page.tsx
│   ├── tools/           # Tool pages
│   │   ├── calculator/
│   │   ├── currency/
│   │   └── ...
│   └── games/           # Game pages
│       └── ...
├── components/          # React components
│   ├── ui/             # Base UI components
│   ├── calculator/     # Tool-specific components
│   ├── currency/
│   └── ...
├── lib/                # Utilities and services
│   ├── api.ts
│   ├── utils.ts
│   ├── stores/        # State management
│   └── ...
├── hooks/              # Custom React hooks
├── docs/               # Documentation
│   ├── api/
│   ├── components/
│   └── adr/
├── tests/              # Test files
├── public/             # Static assets
└── package.json        # Single package.json
```

## Consequences

### Positive Consequences

1. **Simplified Workflow**
   - Single git clone
   - One set of dependencies
   - Unified versioning
   - Single CI/CD pipeline

2. **Code Sharing**
   - Easy to share components
   - Shared utilities across tools
   - Common types and interfaces
   - Reusable hooks and helpers

3. **Atomic Changes**
   - Single PR for cross-cutting changes
   - Changes across multiple tools in one commit
   - Easier refactoring
   - No need to coordinate across repos

4. **Developer Experience**
   - Simpler onboarding
   - One repo to understand
   - Easier local development
   - Single IDE workspace

5. **Testing**
   - Integrated testing
   - Test all code together
   - Single test configuration
   - Easier E2E testing

6. **Deployment**
   - Single build process
   - Single deployment
   - No synchronization needed
   - Simpler CI/CD

7. **Documentation**
   - All docs in one place
   - Easier to keep in sync
   - Single source of truth

8. **Dependency Management**
   - Single package.json
   - Consistent versions
   - Easier updates
   - Shared dependencies

### Negative Consequences

1. **Repository Size**
   - Larger repository
   - Longer clone times
   - More data to download

2. **Build Times**
   - Build entire project
   - Can't build individual parts
   - Longer CI/CD times
   - (Mitigated by Next.js caching)

3. **Access Control**
   - Can't restrict access to parts
   - All-or-nothing repository access
   - (Not an issue for open source)

4. **Scaling Concerns**
   - May need to split later
   - Harder to extract features
   - Potential for conflicts

## Alternatives Considered

### 1. Multi-Repository (Separate Repos)

**Structure:**
```
astraa-web/          # Main application
astraa-components/   # Shared components
astraa-utils/        # Shared utilities
astraa-docs/         # Documentation
```

**Pros:**
- Clear separation of concerns
- Independent versioning
- Smaller repositories
- Granular access control
- Can use different tech stacks

**Cons:**
- Complex dependency management
- Multiple PRs for single feature
- Harder to refactor across repos
- Versioning complexity
- CI/CD coordination needed
- More maintenance overhead

**Why rejected:** Too complex for current scale. The overhead of managing multiple repos outweighs benefits.

### 2. Monorepo with Workspaces

**Structure:**
```
astraa/
├── packages/
│   ├── web/         # Next.js app
│   ├── components/  # Component library
│   ├── utils/       # Utilities
│   └── types/       # Shared types
├── package.json     # Root package.json
└── packages.json    # Workspace configuration
```

**Tools:** npm workspaces, yarn workspaces, or pnpm workspaces

**Pros:**
- Single repository
- Independent packages
- Separate versioning
- Can publish packages separately
- Better for large teams

**Cons:**
- More complex setup
- Workspace tooling required
- Overhead of package management
- More complex build process
- Overkill for current needs

**Why rejected:** Too much complexity for our current scale. May revisit if we need to publish packages separately.

### 3. Monorepo with Turborepo/Nx

**Similar to workspaces but with advanced tooling:**

**Pros:**
- Caching and optimization
- Parallel builds
- Dependency graph
- Better for large monorepos

**Cons:**
- Additional tooling complexity
- Learning curve
- More configuration
- Overkill for current size

**Why rejected:** Current project size doesn't justify the complexity. Simple monorepo works well.

## Current Project Scale

- **Lines of Code**: ~20,000
- **Components**: ~50
- **Pages**: ~20
- **Contributors**: 1-5
- **Tools**: ~12

At this scale, a simple monorepo is ideal.

## When to Reconsider

Consider splitting or using workspaces when:
- Repository becomes too large (>100MB)
- Team grows significantly (>20 developers)
- Need to publish packages independently
- Different deployment cycles needed
- Build times become problematic (>10 minutes)
- Need granular access control

## Migration Path

If we need to split later:

### To Workspaces
1. Create packages directory
2. Move code into packages
3. Set up workspace configuration
4. Update imports
**Effort:** Moderate

### To Multi-Repo
1. Create new repositories
2. Move code
3. Extract shared code to packages
4. Set up inter-repo dependencies
**Effort:** High

## Organization Principles

### 1. Colocation

Related code should be close:
```
app/tools/calculator/
├── page.tsx              # Page component
components/calculator/
├── calculator-button.tsx # Calculator-specific components
├── calculator-display.tsx
```

### 2. Feature Organization

Group by feature, not by type:
```
✅ GOOD
app/tools/calculator/  # All calculator code together

❌ BAD
pages/calculator.tsx
components/calculator-button.tsx  # Separated
lib/calculator-utils.ts
```

### 3. Shared Code

Common code in `lib/` and `components/ui/`:
```
lib/
├── utils.ts          # Shared utilities
├── api.ts           # API utilities
components/ui/       # Shared UI components
```

## Development Workflow

### 1. Local Development
```bash
git clone https://github.com/puri-adityakumar/astraa.git
cd astraa
npm install
npm run dev
```

### 2. Adding New Tool
```bash
# Create tool directory
mkdir -p app/tools/new-tool
mkdir -p components/new-tool

# Add tool files
touch app/tools/new-tool/page.tsx
touch components/new-tool/new-tool-component.tsx
```

### 3. Refactoring
Easy to refactor across entire codebase in one PR.

## CI/CD

Single pipeline:
```yaml
name: CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm install
      - run: npm test
      - run: npm run lint
      - run: npm run build
```

## Documentation Organization

All documentation in `docs/`:
```
docs/
├── api/              # API docs
├── components/       # Component docs
├── adr/             # Architecture decisions
├── guides/          # How-to guides
└── README.md        # Documentation index
```

## References

- [Monorepo vs Multi-Repo](https://www.atlassian.com/git/tutorials/monorepos)
- [Google's Monorepo Approach](https://research.google/pubs/pub45424/)
- [Advantages of Monorepos](https://monorepo.tools/)

## Review

This decision should be reviewed:
- When repository size exceeds 100MB
- When team size exceeds 20 developers
- When build times exceed 10 minutes
- If we need to publish packages independently
- Annually as part of architecture review

## Related ADRs

- [ADR-001: Use Next.js as Framework](./001-nextjs-framework.md) - Next.js works well in monorepo
- All other ADRs benefit from single repository structure
