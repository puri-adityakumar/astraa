# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Astraa is a browser-based utility toolkit built with Next.js 16, React 19, TypeScript, and Tailwind CSS. It's a client-side rendered SPA combining productivity tools and games with no backend — all processing happens in the browser with optional external API integration. UI components are from shadcn/ui (Radix primitives + Tailwind styling) in `components/ui/`.

## Commands

```bash
npm run dev      # Start development server (http://localhost:3000)
npm run build    # Production build
npm start        # Start production server
npm run lint     # Run ESLint
```

No test suite is configured — use manual testing during development.

## Architecture

### Core Pattern

Server component pages render client components:
- `app/tools/[tool]/page.tsx` → exports metadata, renders client component
- `components/[tool]/[tool]-client.tsx` → `"use client"` directive, contains UI logic
- `lib/[tool]/` → pure logic, utilities, types (no React)

This same pattern applies to games (`app/games/[game]/page.tsx` → `components/[game]/`), with game logic hooks in `lib/games/[game]/`.

### Tool & Game Registry

Tools are registered in `lib/tools.ts` as `ToolCategory` objects with items containing `name`, `description`, `path`, `icon` (LucideIcon), and optional `wip`/`comingSoon` flags. Games are registered in `lib/games.ts` with optional `comingSoon` flag. The `ToolsContext` (`lib/tools-context.tsx`) provides the catalog to the app.

### State Management

Three Zustand stores in `lib/stores/`, all persisted:

- **UserPreferences** — theme, language, accessibility (reducedMotion, highContrast, fontSize), privacy settings, keyboard shortcuts
- **ToolSettings** — per-tool configuration, usage counts, last-used timestamps
- **ActivityTracking** — session tracking, daily usage stats, performance metrics, error rates

**Storage system** (`lib/stores/storage.ts`): IndexedDB primary with localStorage fallback. Uses Promise-based concurrency locking to prevent race conditions. Migration system in `lib/stores/migration.ts` handles schema version upgrades. `StoreProvider` (`lib/stores/provider.tsx`) initializes stores and applies accessibility preferences to the document.

**Context**: ToolsContext for tool catalog, ActivityProvider (`lib/activity-tracker.tsx`) for demo stats.

### External APIs

- **OpenRouter** (`lib/openrouter.ts`): Server action for AI text generation (meta-llama/llama-3.3-70b-instruct:free)
- **CoinGecko** (`lib/crypto-data.ts`): Cryptocurrency prices
- **Currency APIs** (`lib/api.ts`): Exchange rates (FawazAhmed0 primary, exchangerate-api fallback)
- **Upstash Redis** (`middleware.ts`): Visitor counting on home page with 24-hour dedup cookie

### Error Handling

```typescript
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

- Error boundaries: global (`app/global-error.tsx`), page-level (`app/error.tsx`)
- `getUserFriendlyError()` maps error types (network, timeout, permission, file) to user-friendly messages and sanitizes sensitive data (paths, URLs, emails, IPs)
- Sentry: client (`instrumentation-client.ts`), server (`sentry.server.config.ts`), edge (`sentry.edge.config.ts`)

## Code Style

### Formatting Rules

- Always use **double quotes** (`"`) — never single quotes
- Always use **semicolons**
- **2-space** indentation
- Use **trailing commas** in multi-line objects and arrays
- Maximum line length: **100 characters**

### TypeScript

- Strict mode enabled
- Path aliases: `@/components`, `@/lib`, `@/hooks`, `@/app`, `@/types`, `@/config`
- Prefer `unknown` over `any`

### Naming Conventions

- **Components**: PascalCase (`PasswordGenerator`, `HashOutput`)
- **Functions/Variables**: camelCase (`generatePassword`, `handleClick`)
- **Constants**: UPPER_SNAKE_CASE (`TOAST_LIMIT`, `ANIMATION_CONFIG`)
- **Types/Interfaces**: PascalCase (`Tool`, `PasswordResult`)
- **Files**: kebab-case (`password-generator.tsx`, `hash-utils.ts`)

### Import Order

```typescript
// 1. External libraries
import { useState, useEffect } from "react"
import { motion } from "framer-motion"

// 2. Internal utilities
import { useToast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"

// 3. Components
import { Button } from "@/components/ui/button"
import { HashInput } from "./hash-input"

// 4. Types
import type { Tool } from "@/lib/tools"
```

### Component Structure

```typescript
"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"

export function ComponentName() {
  const [state, setState] = useState(initialValue)

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

### Styling

- Use `cn()` for conditional classes: `cn("base-class", isActive && "active-class")`
- Tailwind class order: layout (`flex`, `grid`) → spacing (`p-`, `m-`, `gap-`) → sizing (`w-`, `h-`) → typography (`text-`, `font-`) → colors/backgrounds (`bg-`, `text-[color]`) → borders (`border`, `rounded`) → effects (`shadow`, `opacity`) → states (`hover:`, `focus:`) → responsive (`sm:`, `md:`)
- Fluid typography: `text-fluid-base`, `text-fluid-xl`
- Glass morphism: `glass`, `glass-hover` classes
- Responsive breakpoints: `xs:475px`, `sm:640px`, `md:768px`, `lg:1024px`, `xl:1280px`
- HSL color variables: `background`, `foreground`, `primary`, `muted`, `border`

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

Available variants in `lib/animations/variants.ts`: `fadeIn`, `fadeInUp`, `fadeInDown`, `fadeInLeft`, `fadeInRight`, `scaleIn`, `scaleInBounce`, `slideInBottom`, `slideInTop`, `rotateIn`, `flipIn`, `blurIn`, `shimmer`, `expand`. Stagger containers: `staggerContainer`, `staggerContainerFast`, `staggerContainerSlow`, `staggerItem`.

Available hooks in `lib/animations/hooks.ts`: `useReducedMotion()`, `useAnimationVariants()`, `useConditionalAnimation()`, `useInView()`, `useStaggerDelay()`, `usePageTransition()`.

### Sentry Integration

```typescript
import * as Sentry from "@sentry/nextjs"

// Capture exceptions
Sentry.captureException(error)

// Performance tracing — use for meaningful actions (button clicks, API calls)
const result = await Sentry.startSpan(
  { op: "function.name", name: "Descriptive Name" },
  async (span) => {
    span.setAttribute("key", value)
    return data
  }
)

// Structured logging
const { logger } = Sentry
logger.info("Action completed", { key: "value" })
logger.error("Failed operation", { orderId: "123" })
logger.debug(logger.fmt`Cache miss for user: ${userId}`)  // use logger.fmt for template variables
```

### Accessibility

- Minimum touch targets: 44px (`min-h-touch`, `min-w-touch`)
- Use semantic HTML (`<button>`, `<input>`, `<label>`)
- Use `aria-label` for icon-only buttons
- Always check `useReducedMotion()` before animating

## Adding New Tools

1. Create `app/tools/[tool-name]/page.tsx` with metadata
2. Create `components/[tool-name]/[tool-name]-client.tsx` with `"use client"`
3. Add tool logic to `lib/[tool-name]/` if needed
4. Register in `lib/tools.ts` — add to appropriate `ToolCategory` with `name`, `description`, `path`, `icon`, and optional `wip: true`

## Contribution Workflow

- PRs must target `development` branch
- Must be assigned to an issue before submitting PR
- Use Conventional Commits: `feat(scope): description`, `fix(scope): description`
- Commit types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`, `ci`, `build`
- Release format: `release(vX.Y.Z): merge development to main`
