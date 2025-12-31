# Astraa Project Guidelines

## Commands

### Development
```bash
npm run dev          # Start development server (http://localhost:3000)
npm run build        # Production build
npm start            # Start production server
npm run lint         # Run ESLint
```

### Testing
Currently no test suite is configured. Use manual testing during development.

## Code Style Guidelines

### TypeScript Configuration
- Strict mode enabled with comprehensive type checking
- Path aliases: `@/components/*`, `@/lib/*`, `@/hooks/*`, `@/app/*`, `@/types/*`, `@/config/*`
- Always prefer `unknown` over `any` for type declarations

### File Organization
- **Client Components**: Start with `"use client"` directive at top
- **Server Actions**: Use `'use server'` directive
- **Pages**: Server component in `app/` → renders client component from `components/`
  - Example: `app/tools/password/page.tsx` → `components/password/password-generator.tsx`
- **Utilities**: Pure functions in `lib/` organized by feature (e.g., `lib/password/`, `lib/hash/`)
- **Game Logic**: Custom hooks in `lib/games/[game-name]/` managing game state

### Import Order
```typescript
// 1. External libraries (React, third-party)
import { useState, useEffect } from "react"
import { motion } from "framer-motion"

// 2. Internal utilities (hooks, lib)
import { useToast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"

// 3. Components (UI, feature components)
import { Button } from "@/components/ui/button"
import { HashInput } from "./hash-input"

// 4. Types
import type { Tool } from "@/lib/tools"
```

### Naming Conventions
- **Components**: PascalCase (`PasswordGenerator`, `HashOutput`)
- **Functions/Variables**: camelCase (`generatePassword`, `handleGenerateHash`)
- **Constants**: UPPER_SNAKE_CASE (`TOAST_LIMIT`, `ANIMATION_CONFIG`)
- **Types/Interfaces**: PascalCase (`Tool`, `PasswordResult`)
- **Files**: kebab-case (`password-generator.tsx`, `hash-utils.ts`)
- **Props**: Descriptive, avoid generic names (`handleGenerate` not `handleClick`)

### Component Structure
```typescript
"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"

export function ComponentName() {
  const [state, setState] = useState(initialValue)

  // Handlers grouped together
  const handleClick = useCallback(() => {
    // logic
  }, [dependencies])

  return (
    <div className="container max-w-2xl pt-24 pb-12 space-y-8">
      {/* content */}
    </div>
  )
}
```

### State Management
- **Local State**: React hooks (`useState`, `useReducer`) for component-specific state
- **Global State**: Zustand stores in `lib/stores/` (user preferences, tool settings, activity tracking)
- **Context**: Tools context (`lib/tools-context.tsx`) for tool navigation and categories

### Styling
- Use `cn()` utility for conditional className merging: `cn("base-class", isActive && "active-class")`
- Tailwind CSS with fluid typography: `text-fluid-base`, `text-fluid-xl`
- Responsive breakpoints: `xs:475px`, `sm:640px`, `md:768px`, `lg:1024px`, `xl:1280px`
- Glass morphism: `glass`, `glass-hover` classes
- Colors: HSL semantic variables (`background`, `foreground`, `primary`, `muted`, `border`, etc.)

### Error Handling
```typescript
// User-facing errors
import { getUserFriendlyError, logError } from "@/lib/error-handler"

try {
  await riskyOperation()
} catch (error) {
  const details = getUserFriendlyError(error)
  toast({
    title: details.title,
    description: details.message,
    variant: "destructive"
  })
  logError(error, { context: "additional context" })
}
```

- Use result types for async operations: `{ success: true, data } | { success: false, error }`
- Always log errors with context for debugging
- Never expose technical details to users

### Animations
```typescript
import { motion } from "framer-motion"
import { fadeInUp, staggerContainer } from "@/lib/animations/variants"
import { useReducedMotion } from "@/lib/animations/hooks"

export function AnimatedComponent() {
  const shouldReduce = useReducedMotion()

  return (
    <motion.div
      variants={shouldReduce ? {} : fadeInUp}
      initial="hidden"
      animate="show"
    >
      {/* content */}
    </motion.div>
  )
}
```

- Use pre-defined variants from `lib/animations/variants.ts`
- Always check `useReducedMotion()` before animating
- For lists: `staggerContainer` parent with `staggerItem` children

### Sentry Integration
```typescript
import * as Sentry from "@sentry/nextjs"

// Capture exceptions
try {
  // code
} catch (error) {
  Sentry.captureException(error)
}

// Performance tracing
const result = await Sentry.startSpan(
  { op: "function.name", name: "Descriptive Name" },
  async () => {
    // traced operation
    return data
  }
)
```

- Use meaningful operation names and attributes
- Client initialization: `instrumentation-client.ts`
- Server initialization: `sentry.server.config.ts`
- Edge initialization: `sentry.edge.config.ts`

### Utility Patterns
- **Text Generation**: Use OpenRouter API via `lib/openrouter.ts`
- **Currency/Crypto**: Use `lib/api.ts` for exchange rates and crypto prices
- **Toast Notifications**: `useToast()` hook from `@/components/ui/use-toast`
- **Hash Generation**: Import from `@/lib/hash` (exports types and utils)
- **Password Generation**: Import from `@/lib/password/password-utils`

### Accessibility
- Minimum touch targets: `44px` (use `min-h-touch`, `min-w-touch`)
- Use semantic HTML (`<button>`, `<input>`, `<label>`)
- Respect reduced motion preference
- Use `aria-label` for icon-only buttons
- Keyboard navigation support for all interactive elements

### Tool/Game Page Pattern
```typescript
// app/tools/my-tool/page.tsx
import { Metadata } from "next"
import { MyToolClient } from "@/components/my-tool/my-tool-client"

export const metadata: Metadata = {
  title: "Tool Name | astraa",
  description: "One-line description",
  openGraph: {
    title: "Tool Name",
    description: "One-line description",
  },
}

export default function MyToolPage() {
  return <MyToolClient />
}
```

### Component Exports
- Index files export types and utilities: `export * from './types'`, `export * from './utils'`
- Named exports for components: `export function ComponentName() {}`
- Avoid default exports for better tree-shaking

### Comments
- JSDoc for public functions: `/** Description */`
- Inline comments only for complex logic or edge cases
- Keep comments concise and actionable
