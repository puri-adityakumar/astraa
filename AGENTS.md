# Astraa Project Guidelines

## Commands

```bash
npm run dev      # Start development server (http://localhost:3000)
npm run build    # Production build
npm start        # Start production server
npm run lint     # Run ESLint
```

**Testing**: No test suite configured. Use manual testing.

## TypeScript Configuration

- Strict mode enabled with comprehensive type checking (`noUnusedLocals`, `noImplicitReturns`, `exactOptionalPropertyTypes`, `noUncheckedIndexedAccess`)
- Path aliases: `@/components/*`, `@/lib/*`, `@/hooks/*`, `@/app/*`, `@/types/*`, `@/config/*`
- Prefer `unknown` over `any` for type declarations
- Use explicit return types for public functions

## Code Style

**Formatting**: Always use **double quotes**, **semicolons**, **2-space** indentation, **trailing commas** in multi-line objects/arrays, max 100 character line length.

**Import Order**:
```typescript
// 1. External libraries
import { useState } from "react"
import { motion } from "framer-motion"
// 2. Internal utilities
import { cn } from "@/lib/utils"
// 3. Components
import { Button } from "@/components/ui/button"
// 4. Types
import type { Tool } from "@/lib/tools"
```

## Naming Conventions

- **Components**: PascalCase (`PasswordGenerator`, `HashOutput`)
- **Functions/Variables**: camelCase (`generatePassword`, `handleClick`)
- **Constants**: UPPER_SNAKE_CASE (`TOAST_LIMIT`, `ANIMATION_CONFIG`)
- **Types/Interfaces**: PascalCase (`Tool`, `PasswordResult`)
- **Files**: kebab-case (`password-generator.tsx`, `hash-utils.ts`)
- **Props**: Descriptive names (`handleGenerate` not `onClick`)

## Component Structure

```typescript
"use client"
import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"

export function ComponentName() {
  const [state, setState] = useState(initialValue)
  const handleClick = useCallback(() => {}, [deps])
  return <div className="container max-w-2xl pt-24 pb-12 space-y-8">...</div>
}
```

## File Organization

- **Client Components**: Start with `"use client"` directive
- **Server Actions**: Use `'use server'` directive
- **Pages**: Server component in `app/` → renders client component from `components/`
- **Utilities**: Pure functions in `lib/` organized by feature
- **Game Logic**: Custom hooks in `lib/games/[game-name]/`
- **State Management**: Local (`useState`, `useReducer`), Global (Zustand in `lib/stores/`), Context (`lib/tools-context.tsx`)

## Styling

- Use `cn()` from `@/lib/utils` for conditional className merging
- Tailwind class order: layout → spacing → sizing → typography → colors/backgrounds → borders → effects → states → responsive
- Fluid typography: `text-fluid-base`, `text-fluid-xl`
- Responsive breakpoints: `xs:475px`, `sm:640px`, `md:768px`, `lg:1024px`, `xl:1280px`
- Glass morphism: `glass`, `glass-hover` classes
- Colors: HSL semantic variables (`background`, `foreground`, `primary`, `muted`, `border`)
- Minimum touch targets: `44px` (`min-h-touch`, `min-w-touch`)

## Error Handling

```typescript
import { getUserFriendlyError, logError } from "@/lib/error-handler"
try {
  await riskyOperation()
} catch (error) {
  const details = getUserFriendlyError(error)
  toast({ title: details.title, description: details.message, variant: "destructive" })
  logError(error, { context: "additional context" })
}
```

- Use result types for async operations: `{ success: true, data } | { success: false, error }`
- Never expose technical details to users

## Animations

```typescript
import { motion } from "framer-motion"
import { fadeInUp, staggerContainer } from "@/lib/animations/variants"
import { useReducedMotion } from "@/lib/animations/hooks"

export function AnimatedComponent() {
  const shouldReduce = useReducedMotion()
  return (
    <motion.div variants={shouldReduce ? {} : fadeInUp} initial="hidden" animate="show">
      {/* content */}
    </motion.div>
  )
}
```

- Always check `useReducedMotion()` before animating
- Use pre-defined variants from `lib/animations/variants.ts`

## Sentry Integration

Import: `import * as Sentry from "@sentry/nextjs"`

**Exception Capturing**: `Sentry.captureException(error)`

**Performance Tracing**:
```typescript
const result = await Sentry.startSpan(
  { op: "function.name", name: "Descriptive Name" },
  async (span) => {
    span.setAttribute("key", value)
    return data
  }
)
```

**Structured Logging**:
```typescript
const { logger } = Sentry
logger.info("Action completed", { key: "value" })
logger.debug(logger.fmt`User: ${userId}`)
```

## Tool/Game Page Pattern

```typescript
// app/tools/my-tool/page.tsx
import { Metadata } from "next"
import { MyToolClient } from "@/components/my-tool/my-tool-client"

export const metadata: Metadata = {
  title: "Tool Name | astraa",
  description: "One-line description",
  openGraph: { title: "Tool Name", description: "One-line description" },
}

export default function MyToolPage() {
  return <MyToolClient />
}
```

Register tools in `lib/tools.ts` and games in `lib/games.ts`.

## Feature Spec Review Checklist

Before turning a design/spec into an implementation plan, walk through these checks. Treat any "no" as either a gap to fix in the spec or a deliberate, documented decision in an "Out of scope" section.

### Project alignment
- Server page → client component pattern (`app/tools/[name]/page.tsx` → `components/[name]/[name]-client.tsx` → `lib/[name]/*`)
- Global state lives in `lib/stores/[name].ts` using Zustand + `createZustandStorage()`
- Tool registered in `lib/tools.ts` (or game in `lib/games.ts`) with `name`, `description`, `path`, `icon`, optional `wip`
- Metadata uses `"Tool Name | astraa"` title format
- Errors funnel through `getUserFriendlyError()` and `logError()` from `@/lib/error-handler`
- File/function/component names follow casing conventions (kebab-case files, PascalCase components, camelCase functions)
- Tailwind class order respected, classes composed via `cn()`

### Design uniformity
- Layout matches other tools — centered card (`max-w-2xl mx-auto`) is the default; any divergence is justified in the spec
- Reuses `components/ui/*` primitives before introducing new ones
- Includes heading + tagline + "All processing happens locally in your browser" line where applicable
- Animations use `lib/animations/variants.ts` and `useReducedMotion()`
- Dark/light follows `next-themes` and HSL semantic tokens

### UX coverage
- Empty state, loading state, error states are all specified
- Mobile / small-screen behavior is specified — layout works below `640px`
- Keyboard shortcuts enumerated
- Focus management on state changes specified
- Behavior on navigation/refresh mid-edit (unsaved data) specified
- Destructive actions gated by confirmation

### Accessibility
- Touch targets ≥ 44px (`min-h-touch`/`min-w-touch`)
- `aria-label` on icon-only buttons
- Semantic HTML, every action keyboard-reachable
- Animations respect `useReducedMotion()`
- Dynamic content handled for screen readers (live regions, focus moves)

### Security / data
- User-supplied content rendered safely (no untrusted HTML)
- Upload/storage size limits set
- Data persisted only locally unless explicitly designed for sync
- Sensitive data sanitized before logging

### Performance / bundle
- Heavy dependencies (>100KB) dynamic-imported and justified
- Initial route bundle impact assessed
- Hot-path renders debounced where appropriate

### Complexity
- Would a smaller v1 still hit the goal?
- Each component does one thing
- Abstractions earn their cost

### Testing
- Pure logic in `lib/` has unit tests, including boundary conditions
- Manual verification checklist exists for UI behaviors not covered by units

### Storage / migration
- Schema version recorded and migration path planned (`lib/stores/migration.ts`)
- Caps on stored data prevent quota issues
- Fallback behavior when storage unavailable

### Observability
- Tool usage tracked via `updateToolUsage(toolId)`
- Sentry instrumentation on meaningful flows
- Errors logged with enough context to debug

### Out-of-scope clarity
- What's NOT being built is explicit, so deferred work is distinguishable from forgotten work

## Git Workflow

- PRs must target `development` branch
- Must be assigned to an issue before submitting PR
- Use Conventional Commits: `feat(scope): description`, `fix(scope): description`
- Commit types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`, `ci`, `build`
- Release format: `release(vX.Y.Z): merge development to main`

## Accessibility

- Minimum touch targets: `44px` (use `min-h-touch`, `min-w-touch`)
- Use semantic HTML (`<button>`, `<input>`, `<label>`)
- Respect reduced motion preference
- Use `aria-label` for icon-only buttons

## Component Exports

- Index files export types and utilities: `export * from './types'`
- Named exports for components: `export function ComponentName() {}`
- Avoid default exports for better tree-shaking

## Comments

- JSDoc for public functions: `/** Description */`
- Inline comments only for complex logic
- Keep comments concise
