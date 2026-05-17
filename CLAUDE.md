# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Astraa is a browser-based utility toolkit built with Next.js 16, React 19, TypeScript, and Tailwind CSS. It's a client-side rendered SPA combining productivity tools and games with no backend — all processing happens in the browser with optional external API integration. UI components are from shadcn/ui (Radix primitives + Tailwind styling) in `components/ui/`.

An `AGENTS.md` file exists with overlapping conventions for other assistants — keep both in sync when updating style rules.

## Commands

```bash
npm run dev        # Start development server (http://localhost:3000)
npm run build      # Production build
npm start          # Start production server
npm run lint       # Run ESLint
npm test           # Run unit tests (Vitest)
npm run test:watch # Run tests in watch mode
```

Unit tests cover pure utility functions in `lib/` (calculator, hash, password, unit conversions, error handler). Run `npm test` before committing changes to these modules.

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

**Storage system** (`lib/stores/storage.ts`): IndexedDB primary with localStorage fallback. Uses Promise-based concurrency locking to prevent race conditions. Migration system in `lib/stores/migration.ts` handles schema version upgrades. `StoreProvider` (`lib/stores/provider.tsx`) initializes stores and applies accessibility preferences to the document. See `lib/stores/README.md` for deeper docs.

**Context**: ToolsContext for tool catalog, ActivityProvider (`lib/activity-tracker.tsx`) for demo stats.

### External APIs

- **OpenRouter** (`lib/openrouter.ts`): Server action for AI text generation (meta-llama/llama-3.3-70b-instruct:free)
- **CoinGecko** (`lib/crypto-data.ts`): Cryptocurrency prices
- **Currency APIs** (`lib/api.ts`): Exchange rates (FawazAhmed0 primary, exchangerate-api fallback)
- **Upstash Redis** (`middleware.ts`): Visitor counting on home page with 24-hour dedup cookie. Runs in the Edge runtime — it instantiates `Redis` directly and **cannot import from `lib/`**. Uses `next/server`'s `after()` to increment non-blocking after the response is sent.

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

- Strict mode plus stricter checks in `tsconfig.json`: `noUnusedLocals`, `noUnusedParameters`, `exactOptionalPropertyTypes`, `noImplicitReturns`, `noFallthroughCasesInSwitch`, `noUncheckedIndexedAccess`, `noImplicitOverride`. Array/object indexing returns `T | undefined` — handle it.
- Path aliases: `@/components`, `@/lib`, `@/hooks`, `@/app`, `@/types`, `@/config`
- Prefer `unknown` over `any`; use explicit return types for public functions

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
import type { Metadata } from "next"
import { MyToolClient } from "@/components/my-tool/my-tool-client"

export const metadata: Metadata = {
  title: "Tool Name",
  description: "150-160 char description for SEO.",
  keywords: ["relevant", "keywords"],
  openGraph: {
    title: "Tool Name",
    description: "Short OG description.",
    url: "/tools/my-tool",
    images: ["/assets/astraa_banner.jpg"],
  },
  twitter: {
    card: "summary",
    title: "Tool Name",
    description: "Short Twitter description.",
  },
  alternates: {
    canonical: "/tools/my-tool",
  },
}

export default function MyToolPage() {
  const lastUpdated = new Date().toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <>
      <MyToolClient />
      <p className="text-xs text-muted-foreground text-center mt-4">
        Last updated: {lastUpdated}
      </p>
    </>
  );
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

See `lib/animations/README.md` for full config, presets, and usage guidance.

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
- Reuses `components/ui/*` primitives (Button, Card, AlertDialog, Tooltip, Toast) before introducing new ones
- Includes heading + tagline + "All processing happens locally in your browser" line where applicable
- Animations use `lib/animations/variants.ts` and `useReducedMotion()`
- Dark/light follows `next-themes` and HSL semantic tokens (`background`, `foreground`, `primary`, `muted`, `border`)

### UX coverage
- Empty state (first visit, no data) is specified
- Loading / hydration state is specified
- Error states (recoverable + unrecoverable) are specified
- Mobile / small-screen behavior is specified — layout works below `640px`
- Keyboard shortcuts enumerated
- Focus management on state changes (modal open, file switch, route change) is specified
- Behavior on navigation/refresh mid-edit (unsaved data) is specified
- Destructive actions (delete, overwrite) gated by confirmation

### Accessibility
- Touch targets ≥ 44px (`min-h-touch`/`min-w-touch`)
- `aria-label` on icon-only buttons
- Semantic HTML for interactive elements
- Every animation respects `useReducedMotion()`
- Every action keyboard-reachable
- Dynamic content updates handled for screen readers (live regions, focus moves)

### Security / data
- User-supplied content rendered safely (no untrusted HTML, sanitization where needed)
- Upload/storage size limits set
- Data persisted only locally unless explicitly designed for sync
- Sensitive data sanitized before logging (`getUserFriendlyError()` already does this)

### Performance / bundle
- Heavy dependencies (>100KB) dynamic-imported on demand and justified
- Initial route bundle impact assessed
- Hot-path renders debounced (typing, resize, scroll) where appropriate
- Memoization where re-renders are expensive

### Complexity
- Would a smaller v1 still hit the goal? Components/features that could move to "out of scope"?
- Each component does one thing
- Abstractions earn their cost (inlining isn't simpler)

### Testing
- Pure logic in `lib/` has unit tests
- Boundary conditions tested (empty, max, malformed input)
- Manual verification checklist exists for UI behavior not covered by unit tests

### Storage / migration
- Schema version recorded and migration path planned (`lib/stores/migration.ts`)
- Caps on stored data to prevent quota issues
- Fallback behavior when storage unavailable

### Observability
- Tool usage tracked via `updateToolUsage(toolId)`
- Sentry instrumentation on meaningful flows (`Sentry.startSpan`, `Sentry.captureException`)
- Errors logged with enough context to debug

### Out-of-scope clarity
- What's NOT being built is explicit, so deferred work is distinguishable from forgotten work

## Contribution Workflow

- PRs must target `development` branch
- Must be assigned to an issue before submitting PR
- Use Conventional Commits: `feat(scope): description`, `fix(scope): description`
- Commit types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`, `ci`, `build`
- Release format: `release(vX.Y.Z): merge development to main`
