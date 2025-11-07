# ADR-002: Use TypeScript for Type Safety

Date: 2024-01-15

## Status

Accepted

## Context

We need to decide whether to use JavaScript or TypeScript for the Astraa codebase. The application will have:
- Multiple contributors with varying experience levels
- Complex state management
- External API integrations
- Multiple utility tools with different data structures
- Long-term maintenance requirements

Type safety can prevent bugs, improve developer experience, and make refactoring safer, but it also adds complexity and learning curve.

## Decision

We will use **TypeScript** with **strict mode enabled** for all application code.

### TypeScript Configuration

```json
{
  "compilerOptions": {
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true
  }
}
```

## Consequences

### Positive Consequences

1. **Type Safety**
   - Catch errors at compile-time instead of runtime
   - Prevent common bugs (null references, type mismatches)
   - Safe refactoring with IDE support

2. **Developer Experience**
   - Excellent IDE autocomplete and IntelliSense
   - Better code navigation
   - Inline documentation via types
   - Easier onboarding for new contributors

3. **Code Quality**
   - Self-documenting code
   - Enforce consistent interfaces
   - Easier code reviews
   - Reduced need for runtime checks

4. **Refactoring Confidence**
   - Find all usages of a type
   - Safe renames and restructuring
   - Breaking changes caught immediately

5. **API Integration**
   - Type-safe API responses
   - Catch API contract changes early
   - Better error handling

6. **Scale Well**
   - Easier to maintain as codebase grows
   - Better for team collaboration
   - Reduced technical debt

### Negative Consequences

1. **Learning Curve**
   - Contributors need TypeScript knowledge
   - More complex than plain JavaScript
   - Generic types can be confusing

2. **Development Overhead**
   - Writing type definitions takes time
   - Type errors can slow development initially
   - Sometimes need to write more code

3. **Build Step Required**
   - Compilation adds build time
   - Can't run TypeScript directly in browser
   - Additional tooling complexity

4. **Third-Party Types**
   - Some libraries lack good TypeScript support
   - Need to install `@types/*` packages
   - Sometimes need to write custom type definitions

## Alternatives Considered

### 1. JavaScript Only
**Pros:**
- No compilation step
- Lower barrier to entry
- Faster initial development
- No type definition overhead

**Cons:**
- No compile-time type checking
- More runtime errors
- Harder to refactor safely
- Poor IDE support
- Self-documentation through comments only

**Why rejected:** Benefits of type safety outweigh the overhead for a multi-contributor project.

### 2. JavaScript with JSDoc
**Pros:**
- Type checking without compilation
- Gradual adoption possible
- No build step changes

**Cons:**
- Verbose syntax
- Limited type system features
- Poor IDE support compared to TypeScript
- Easy to skip or ignore
- Not enforced by default

**Why rejected:** TypeScript provides better type system and developer experience.

### 3. Flow
**Pros:**
- Similar to TypeScript
- Type inference
- Facebook support

**Cons:**
- Smaller community
- Fewer integrations
- Less active development
- Smaller ecosystem

**Why rejected:** TypeScript has larger community and better tooling support.

## Implementation Guidelines

### 1. Avoid `any` Type

See [Issue #15](https://github.com/puri-adityakumar/astraa/issues/15) for details.

```typescript
// ❌ BAD
function processData(data: any) {
  return data.value
}

// ✅ GOOD
interface Data {
  value: string
}

function processData(data: Data) {
  return data.value
}
```

### 2. Use Strict Null Checks

```typescript
// ❌ BAD (with strict: false)
function getUser(id: string) {
  return users.find(u => u.id === id) // Could return undefined
}

// ✅ GOOD (with strict: true)
function getUser(id: string): User | undefined {
  return users.find(u => u.id === id)
}
```

### 3. Define Interfaces for Props

```typescript
// ✅ GOOD
interface ButtonProps {
  label: string
  onClick: () => void
  variant?: 'primary' | 'secondary'
  disabled?: boolean
}

export function Button({ label, onClick, variant = 'primary', disabled = false }: ButtonProps) {
  // Implementation
}
```

### 4. Use Type Guards

```typescript
function isError(value: unknown): value is Error {
  return value instanceof Error
}

try {
  // ...
} catch (error) {
  if (isError(error)) {
    console.error(error.message)
  }
}
```

### 5. Leverage Utility Types

```typescript
// Partial, Pick, Omit, etc.
type PartialUser = Partial<User>
type UserWithoutPassword = Omit<User, 'password'>
type UserCredentials = Pick<User, 'email' | 'password'>
```

## Migration Strategy

For existing JavaScript code:

1. **Gradual Migration**
   - Allow `.js` files alongside `.ts` files
   - Migrate one module at a time
   - Start with utilities, then components

2. **Type Coverage**
   - Track type coverage percentage
   - Set coverage goals
   - Use `ts-coverage` tool

3. **Priority Order**
   1. API and data layer types
   2. Shared utilities
   3. Component props
   4. Internal state

## Known Issues

### Current Type Safety Issues

See [Issue #15](https://github.com/puri-adityakumar/astraa/issues/15) for current uses of `any` type that need to be fixed.

**Action items:**
- [ ] Replace all `any` types with proper types
- [ ] Enable `@typescript-eslint/no-explicit-any` rule
- [ ] Add type coverage measurement
- [ ] Document common type patterns

## Performance Considerations

- **Build Time**: TypeScript compilation adds ~10-20% to build time
- **Bundle Size**: No impact (types are stripped in production)
- **Runtime Performance**: No impact (types don't exist at runtime)

## Tooling

### Required Tools
- TypeScript compiler (`tsc`)
- `@types/react`, `@types/node`, etc.
- ESLint with TypeScript plugin
- TypeScript-aware IDE (VS Code recommended)

### Recommended VS Code Extensions
- ESLint
- TypeScript Error Translator
- Error Lens
- Pretty TypeScript Errors

## References

- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)
- [TypeScript Deep Dive](https://basarat.gitbook.io/typescript/)
- [TypeScript Best Practices](https://www.typescriptlang.org/docs/handbook/declaration-files/do-s-and-don-ts.html)

## Review

This decision should be reviewed:
- If TypeScript introduces breaking changes
- If team feedback indicates significant productivity issues
- If build times become unacceptable
- Annually as part of tech stack review

## Related ADRs

- [ADR-001: Use Next.js as Framework](./001-nextjs-framework.md) - Next.js has excellent TypeScript support
- [ADR-003: Use Zustand for State Management](./003-zustand-state-management.md) - Zustand has great TypeScript support
