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
