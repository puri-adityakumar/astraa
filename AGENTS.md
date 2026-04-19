# Astraa Project Guidelines

## Commands

```bash
npm run dev        # Start development server (http://localhost:3000)
npm run build      # Production build
npm start          # Start production server
npm run lint       # Run ESLint (flat config, eslint.config.mjs)
npm test           # Run unit tests (Vitest)
npm run test:watch # Run tests in watch mode
```

**Testing**: Unit tests cover pure utility functions in `lib/` (calculator, hash, password, unit conversions, error handler). Test files are co-located (e.g., `lib/calculator/calculator-utils.test.ts`). Run `npm test` before committing changes to these modules. CI runs tests and build on every PR.

## Architecture

**Core pattern**: Server component pages render client components:
- `app/tools/[tool]/page.tsx` → exports metadata, renders client component
- `components/[tool]/[tool]-client.tsx` → `"use client"` directive, UI logic
- `lib/[tool]/` → pure logic, utilities, types (no React)

**State**: Zustand stores in `lib/stores/` (UserPreferences, ToolSettings, ActivityTracking) persisted via IndexedDB with localStorage fallback. Context: ToolsContext (`lib/tools-context.tsx`), ActivityProvider (`lib/activity-tracker.tsx`).

**External APIs**:
- OpenRouter (`lib/openrouter.ts`): Server action, AI text generation
- CoinGecko (`lib/crypto-data.ts`): Crypto prices
- Currency APIs (`lib/api.ts`): Exchange rates with fallback
- Upstash Redis (`middleware.ts`): Visitor counting, Edge runtime — cannot import from `lib/`

**Registry**: Tools in `lib/tools.ts`, games in `lib/games.ts`.

## TypeScript Configuration

- Strict mode with `noUnusedLocals`, `noImplicitReturns`, `exactOptionalPropertyTypes`, `noUncheckedIndexedAccess`
- Path aliases: `@/components`, `@/lib`, `@/hooks`, `@/app`, `@/types`, `@/config`
- Prefer `unknown` over `any`; explicit return types for public functions

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

## Tool/Game Page Pattern

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

## Styling

- Use `cn()` from `@/lib/utils` for conditional className merging
- Tailwind class order: layout → spacing → sizing → typography → colors/backgrounds → borders → effects → states → responsive
- Fluid typography: `text-fluid-base`, `text-fluid-xl`
- Responsive breakpoints: `xs:475px`, `sm:640px`, `md:768px`, `lg:1024px`, `xl:1280px`
- Glass morphism: `glass`, `glass-hover` classes
- Colors: HSL semantic variables (`background`, `foreground`, `primary`, `muted`, `border`)

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

- Error boundaries: global (`app/global-error.tsx`), page-level (`app/error.tsx`)
- Sentry: client (`instrumentation-client.ts`), server (`sentry.server.config.ts`), edge (`sentry.edge.config.ts`)

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

## Accessibility

- Minimum touch targets: 44px (`min-h-touch`, `min-w-touch`)
- Use semantic HTML (`<button>`, `<input>`, `<label>`)
- Use `aria-label` for icon-only buttons
- Always check `useReducedMotion()` before animating

## Git Workflow

- PRs must target `development` branch
- Must be assigned to an issue before submitting PR
- Use Conventional Commits: `feat(scope): description`, `fix(scope): description`
- Commit types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`, `ci`, `build`
- Release format: `release(vX.Y.Z): merge development to main`
