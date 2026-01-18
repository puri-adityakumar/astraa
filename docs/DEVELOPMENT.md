# Development Guide

Development guidelines, workflows, and best practices for Astraa.

## Table of Contents

- [Project Structure](#project-structure)
- [Folder Conventions](#folder-conventions)
- [Code Style Guidelines](#code-style-guidelines)
- [Testing Approach](#testing-approach)
- [Build and Deployment](#build-and-deployment)
- [Common Workflows](#common-workflows)

## Project Structure

```
astraa/
├── app/                      # Next.js App Router pages
│   ├── layout.tsx            # Root layout
│   ├── page.tsx              # Landing page
│   ├── error.tsx             # Error boundary
│   ├── global-error.tsx      # Global error boundary
│   ├── not-found.tsx         # 404 page
│   ├── api/                  # API routes
│   ├── tools/                # Tool pages
│   │   ├── page.tsx          # Tools listing
│   │   ├── password/         # Password generator
│   │   ├── hash/             # Hash generator
│   │   ├── currency/         # Currency converter
│   │   ├── text/             # Text generator
│   │   ├── image/            # Image resizer
│   │   ├── units/            # Unit converter
│   │   ├── calculator/       # Calculator
│   │   ├── json/             # JSON validator
│   │   ├── sql/              # SQL formatter
│   │   └── music/            # Lofi Focus Studio
│   ├── games/                # Game pages
│   │   ├── page.tsx          # Games listing
│   │   ├── snake/            # Snake game
│   │   ├── memory/           # Memory game
│   │   ├── dino/             # Dino game
│   │   ├── pacman/           # Pacman game
│   │   ├── sudoku/           # Sudoku game
│   │   └── word-search/      # Word Search game
│   ├── explore/              # Activity feed
│   ├── contribute/           # Contribution page
│   └── privacy/              # Privacy policy
├── components/               # React components
│   ├── ui/                   # Shadcn/UI components
│   ├── home/                 # Landing page components
│   ├── password/             # Password tool components
│   ├── hash/                 # Hash tool components
│   ├── currency/             # Currency tool components
│   ├── calculator/           # Calculator components
│   ├── colors/               # Color picker components
│   ├── image/                # Image resizer components
│   ├── music/                # Music player components
│   └── units/                # Unit converter components
├── lib/                      # Utilities and logic
│   ├── tools.ts              # Tools catalog
│   ├── games.ts              # Games catalog
│   ├── tools-context.tsx     # Tools context provider
│   ├── activity-tracker.tsx  # Activity tracking
│   ├── api.ts                # External API calls
│   ├── openrouter.ts         # AI text generation
│   ├── redis.ts              # Upstash Redis client
│   ├── utils.ts              # General utilities
│   ├── clipboard.ts          # Clipboard utilities
│   ├── error-handler.ts      # Error handling
│   ├── crypto-data.ts        # Cryptocurrency data
│   ├── currency-data.ts      # Currency data
│   ├── unit-conversions.ts   # Unit conversion logic
│   ├── stores/               # Zustand stores
│   ├── animations/           # Framer Motion utilities
│   ├── password/             # Password generation logic
│   ├── hash/                 # Hash generation logic
│   ├── calculator/           # Calculator logic
│   ├── image/                # Image processing logic
│   └── games/                # Game-specific logic (snake, memory, dino)
├── hooks/                    # Custom React hooks
├── types/                    # TypeScript type definitions
├── public/                   # Static assets
├── tailwind.config.ts        # Tailwind configuration
├── tsconfig.json             # TypeScript configuration
└── next.config.js            # Next.js configuration
```

## Folder Conventions

### Page Components

Server components in `app/` render client components from `components/`.

```typescript
// app/tools/password/page.tsx (Server Component)
import { Metadata } from "next"
import { PasswordGenerator } from "@/components/password/password-generator"

export const metadata: Metadata = {
  title: "Password Generator | astraa",
  description: "Generate secure passwords"
}

export default function PasswordPage() {
  return <PasswordGenerator />
}
```

```typescript
// components/password/password-generator.tsx (Client Component)
"use client"

import { useState } from "react"

export function PasswordGenerator() {
  // Component implementation
}
```

### Feature Folders

Group related functionality together.

```
lib/password/
├── password-utils.ts    # Core logic
├── types.ts             # Type definitions
└── index.ts             # Public exports

components/password/
├── password-generator.tsx   # Main component
├── password-options.tsx     # Configuration UI
├── password-display.tsx     # Result display
└── index.ts                 # Public exports
```

### Index Exports

Use index files for clean imports.

```typescript
// lib/hash/index.ts
export * from "./hash-utils"
export * from "./types"

// Usage
import { generateHash, type HashAlgorithm } from "@/lib/hash"
```

## Code Style Guidelines

### Import Order

```typescript
// 1. External libraries
import { useState, useEffect } from "react"
import { motion } from "framer-motion"

// 2. Internal utilities
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

// 3. Components
import { Button } from "@/components/ui/button"
import { HashInput } from "./hash-input"

// 4. Types
import type { Tool } from "@/lib/tools"
```

### Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase | `PasswordGenerator` |
| Functions | camelCase | `generatePassword` |
| Constants | UPPER_SNAKE_CASE | `TOAST_LIMIT` |
| Types/Interfaces | PascalCase | `Tool`, `PasswordResult` |
| Files | kebab-case | `password-generator.tsx` |
| Props | Descriptive | `handleGenerate` not `handleClick` |

### Component Structure

```typescript
"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"

interface ComponentProps {
  initialValue?: string
  onSubmit: (value: string) => void
}

export function ComponentName({ initialValue = "", onSubmit }: ComponentProps) {
  // State declarations
  const [value, setValue] = useState(initialValue)

  // Handlers grouped together
  const handleSubmit = useCallback(() => {
    onSubmit(value)
  }, [value, onSubmit])

  // Render
  return (
    <div className="container max-w-2xl pt-24 pb-12 space-y-8">
      {/* content */}
    </div>
  )
}
```

### Styling with Tailwind

```typescript
import { cn } from "@/lib/utils"

// Conditional classes
<div className={cn(
  "base-class px-4 py-2",
  isActive && "bg-primary text-primary-foreground",
  isDisabled && "opacity-50 cursor-not-allowed"
)} />

// Fluid typography
<h1 className="text-fluid-xl font-bold">Title</h1>
<p className="text-fluid-base">Body text</p>

// Glass morphism
<div className="glass glass-hover rounded-lg p-4">
  Content
</div>
```

### Error Handling

```typescript
import { getUserFriendlyError, logError } from "@/lib/error-handler"
import { useToast } from "@/hooks/use-toast"

export function MyComponent() {
  const { toast } = useToast()

  async function handleAction() {
    try {
      await riskyOperation()
    } catch (error) {
      const details = getUserFriendlyError(error)
      toast({
        title: details.title,
        description: details.message,
        variant: "destructive"
      })
      logError(error, { context: "my-component-action" })
    }
  }
}
```

### Result Types

```typescript
// For async operations
type Result<T> =
  | { success: true; data: T }
  | { success: false; error: string }

async function fetchData(): Promise<Result<Data>> {
  try {
    const data = await api.getData()
    return { success: true, data }
  } catch (error) {
    return { success: false, error: "Failed to fetch data" }
  }
}

// Usage
const result = await fetchData()
if (result.success) {
  console.log(result.data)
} else {
  console.error(result.error)
}
```

### Animations

```typescript
import { motion } from "framer-motion"
import { fadeInUp, staggerContainer } from "@/lib/animations/variants"
import { useReducedMotion } from "@/lib/animations/hooks"

export function AnimatedList({ items }: { items: Item[] }) {
  const shouldReduce = useReducedMotion()

  return (
    <motion.ul
      variants={shouldReduce ? {} : staggerContainer}
      initial="hidden"
      animate="show"
    >
      {items.map((item) => (
        <motion.li key={item.id} variants={shouldReduce ? {} : fadeInUp}>
          {item.name}
        </motion.li>
      ))}
    </motion.ul>
  )
}
```

### TypeScript Configuration

```typescript
// Prefer unknown over any
function handleError(error: unknown) {
  if (error instanceof Error) {
    console.error(error.message)
  }
}

// Use path aliases
import { Button } from "@/components/ui/button"
import { generateHash } from "@/lib/hash"

// Explicit return types for public functions
export function calculateTotal(items: Item[]): number {
  return items.reduce((sum, item) => sum + item.price, 0)
}
```

## Testing Approach

Currently no test suite configured. Manual testing recommended during development.

### Manual Testing Checklist

- [ ] Test all tool functionalities
- [ ] Verify responsive design (mobile, tablet, desktop)
- [ ] Check dark/light theme switching
- [ ] Test keyboard navigation
- [ ] Verify accessibility with screen reader
- [ ] Test error states and edge cases
- [ ] Check browser compatibility

### Recommended Testing Tools

```bash
# Lighthouse audit
npx lighthouse http://localhost:3000 --view

# Accessibility testing
# Use browser extensions: axe DevTools, WAVE
```

## Build and Deployment

### Development Server

```bash
npm run dev
```

Starts at `http://localhost:3000` with hot reload.

### Production Build

```bash
npm run build
npm start
```

### Build Output

```
.next/
├── static/          # Static assets
├── server/          # Server-side code
└── cache/           # Build cache
```

### Environment Variables

```bash
# .env.local (development)
OPENROUTER_API_KEY=your_key_here

# Production (set in deployment platform)
OPENROUTER_API_KEY=production_key
SENTRY_DSN=your_sentry_dsn
```

### Deployment Platforms

**Vercel (Recommended)**
```bash
# Deploy via Vercel CLI
npx vercel
```

**Docker**
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
CMD ["npm", "start"]
```

## Common Workflows

### Adding a New Tool

1. **Define tool in catalog:**

```typescript
// lib/tools.ts
import { ToolIcon } from "lucide-react"

// Add to appropriate category in toolCategories array
{
  name: "New Tool",
  description: "Tool description",
  path: "/tools/new-tool",
  icon: ToolIcon,
  wip: false,        // Optional: show as work in progress
  comingSoon: false  // Optional: show as coming soon
}
```

2. **Create page:**

```typescript
// app/tools/new-tool/page.tsx
import { Metadata } from "next"
import { NewToolClient } from "@/components/new-tool/new-tool-client"

export const metadata: Metadata = {
  title: "New Tool | astraa",
  description: "Tool description"
}

export default function NewToolPage() {
  return <NewToolClient />
}
```

3. **Create component:**

```typescript
// components/new-tool/new-tool-client.tsx
"use client"

export function NewToolClient() {
  return (
    <div className="container max-w-2xl pt-24 pb-12 space-y-8">
      {/* Tool implementation */}
    </div>
  )
}
```

4. **Add utility functions (if needed):**

```typescript
// lib/new-tool/utils.ts
export function processData(input: string): Result {
  // Implementation
}
```

### Adding a UI Component

Use Shadcn/UI CLI:

```bash
npx shadcn@latest add button
npx shadcn@latest add dialog
npx shadcn@latest add dropdown-menu
```

Components are added to `components/ui/`.

### Updating Zustand Store

```typescript
// lib/stores/user-preferences.ts
import { create } from "zustand"
import { persist } from "zustand/middleware"

interface UserPreferencesState {
  theme: "light" | "dark" | "system"
  setTheme: (theme: "light" | "dark" | "system") => void
  // Add new state
  newSetting: string
  setNewSetting: (value: string) => void
}

export const useUserPreferences = create<UserPreferencesState>()(
  persist(
    (set) => ({
      theme: "system",
      setTheme: (theme) => set({ theme }),
      // Add new actions
      newSetting: "default",
      setNewSetting: (value) => set({ newSetting: value })
    }),
    { name: "user-preferences" }
  )
)
```

### Adding Animations

```typescript
// lib/animations/variants.ts

// Add new variant
export const slideIn = {
  hidden: { x: -20, opacity: 0 },
  show: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.3 }
  }
}

// Usage in component
import { slideIn } from "@/lib/animations/variants"

<motion.div variants={slideIn} initial="hidden" animate="show">
  Content
</motion.div>
```

### Linting

```bash
npm run lint
```

Fix issues automatically where possible:

```bash
npm run lint -- --fix
```

### Git Workflow

```bash
# Create feature branch
git checkout -b feature/new-tool

# Make changes and commit
git add .
git commit -m "feat: add new tool"

# Push and create PR
git push origin feature/new-tool
```

Commit message format:
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation
- `style:` Code style changes
- `refactor:` Code refactoring
- `test:` Adding tests
- `chore:` Maintenance tasks
