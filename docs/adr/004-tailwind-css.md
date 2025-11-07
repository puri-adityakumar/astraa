# ADR-004: Use Tailwind CSS for Styling

Date: 2024-01-15

## Status

Accepted

## Context

We need to choose a styling approach for the Astraa application. Requirements include:
- Consistent design system
- Responsive design
- Dark/light theme support
- Fast development iteration
- Easy maintenance
- Good performance
- Team productivity

## Decision

We will use **Tailwind CSS** as the primary styling solution, configured with:
- Custom design tokens in `tailwind.config.ts`
- Utility-first approach
- Component composition
- `cn()` utility for conditional classes

## Consequences

### Positive Consequences

1. **Development Speed**
   - Write styles directly in markup
   - No context switching between files
   - Quick prototyping
   - Rapid iteration

2. **Consistency**
   - Design system enforced through configuration
   - Consistent spacing, colors, typography
   - Hard to deviate from design system
   - Easy to maintain design consistency

3. **Performance**
   - Only used classes are included in production
   - Automatic purging of unused styles
   - Small bundle sizes
   - No runtime CSS-in-JS overhead

4. **Responsive Design**
   - Mobile-first approach
   - Intuitive breakpoint syntax
   - Easy responsive utilities
   ```tsx
   <div className="w-full md:w-1/2 lg:w-1/3">
   ```

5. **Dark Mode**
   - Built-in dark mode support
   - Class-based or media query-based
   - Easy theme switching
   ```tsx
   <div className="bg-white dark:bg-gray-900">
   ```

6. **Developer Experience**
   - Excellent IDE support (IntelliSense)
   - Auto-completion
   - Less context switching
   - Easy to learn utility names

7. **Maintenance**
   - No CSS file organization needed
   - Styles colocated with components
   - Easy to find and update styles
   - No unused CSS accumulation

8. **Ecosystem**
   - Large community
   - Many plugins and extensions
   - Tailwind UI components
   - shadcn/ui integration

### Negative Consequences

1. **Learning Curve**
   - Need to learn utility class names
   - Different from traditional CSS
   - Initial productivity dip

2. **Class Name Verbosity**
   - Long className strings
   - Can look cluttered
   ```tsx
   <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-900 rounded-lg shadow-md">
   ```

3. **Custom Styles**
   - Sometimes need arbitrary values
   - Complex animations require CSS
   - Edge cases need custom CSS

4. **HTML Bloat**
   - Many classes in markup
   - Larger HTML payload
   - Can affect readability

5. **Specificity Issues**
   - Occasionally need `!important`
   - Can conflict with third-party CSS
   - Order matters

## Alternatives Considered

### 1. CSS Modules

**Pros:**
- Scoped styles
- Traditional CSS syntax
- No learning curve for CSS developers
- Type-safe with TypeScript

**Cons:**
- Separate CSS files
- Need to maintain naming conventions
- More files to manage
- No automatic purging

**Why rejected:** Too much overhead managing separate CSS files and class naming.

### 2. Styled Components

**Pros:**
- CSS-in-JS
- Dynamic styling with props
- Scoped styles
- Popular in React community

**Cons:**
- Runtime overhead
- Larger bundle size
- Learning curve
- Server-side rendering complexity
- Performance issues

**Why rejected:** Runtime overhead and SSR complexity in Next.js.

### 3. Emotion

**Pros:**
- CSS-in-JS
- Great performance for CSS-in-JS
- Flexible API
- Popular

**Cons:**
- Still runtime overhead
- Learning curve
- Setup complexity
- Bundle size

**Why rejected:** Similar issues to Styled Components, runtime overhead.

### 4. Vanilla CSS

**Pros:**
- No dependencies
- Full control
- No learning curve
- Standard technology

**Cons:**
- No scoping
- Global namespace conflicts
- Hard to maintain consistency
- Manual responsive design
- No automatic optimization

**Why rejected:** Maintenance nightmare for larger applications.

### 5. Sass/SCSS

**Pros:**
- Variables and mixins
- Nested rules
- Familiar to CSS developers
- Powerful features

**Cons:**
- Build step required
- Can lead to overly complex styles
- No automatic purging
- Global scope issues

**Why rejected:** Tailwind provides better developer experience and optimization.

## Implementation Details

### Configuration

```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        // ... custom colors
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
    },
  },
  plugins: [
    require('tailwindcss-animate'),
  ],
}
```

### Using with shadcn/ui

Tailwind integrates perfectly with shadcn/ui components:

```tsx
import { Button } from '@/components/ui/button'

// Button component uses Tailwind utilities
<Button variant="default" size="lg">
  Click me
</Button>
```

### Custom Utility

```typescript
// lib/utils.ts
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

Usage:
```tsx
<div className={cn(
  'base-class',
  isActive && 'active-class',
  className
)}>
```

### Best Practices

1. **Use `cn()` for Conditional Classes**
   ```tsx
   <button className={cn(
     'px-4 py-2 rounded',
     variant === 'primary' && 'bg-blue-500',
     disabled && 'opacity-50 cursor-not-allowed'
   )}>
   ```

2. **Extract Repeated Patterns to Components**
   ```tsx
   // ❌ BAD - Repeated classes
   <button className="px-4 py-2 bg-blue-500 text-white rounded">
   <button className="px-4 py-2 bg-blue-500 text-white rounded">

   // ✅ GOOD - Component
   <Button>Click me</Button>
   ```

3. **Use Design Tokens**
   ```tsx
   // ✅ GOOD - Using theme values
   <div className="text-foreground bg-background">

   // ❌ BAD - Hardcoded colors
   <div className="text-gray-900 bg-white">
   ```

4. **Responsive Design**
   ```tsx
   <div className="
     w-full
     md:w-1/2
     lg:w-1/3
     p-4
     md:p-6
     lg:p-8
   ">
   ```

5. **Dark Mode**
   ```tsx
   <div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
   ```

## Performance

### Build Size
- Development: ~3.5MB (all utilities)
- Production: ~10-20KB (purged)

### Optimization
- PurgeCSS automatically removes unused utilities
- CSS is minified
- Can be further optimized with content config

### Comparison
- **Tailwind (purged)**: ~15KB
- **Bootstrap**: ~150KB
- **Material UI**: ~300KB+

## Migration Path

If we need to migrate away:

1. **To CSS Modules**
   - Create CSS modules for components
   - Convert utility classes to CSS
   - Moderate effort

2. **To Styled Components**
   - Wrap components with styled()
   - Convert classes to CSS-in-JS
   - High effort

3. **Keep Tailwind**
   - Most likely path
   - Very happy with decision

## Accessibility

Tailwind includes accessibility utilities:
```tsx
<div className="sr-only">Screen reader only text</div>
<button className="focus:ring-2 focus:ring-blue-500">
  Accessible button
</button>
```

## Tooling

### VS Code Extensions
- **Tailwind CSS IntelliSense**: Auto-completion
- **Headwind**: Class sorting
- **Tailwind Fold**: Collapse long class names

### Linting
```javascript
// .eslintrc.js
plugins: ['tailwindcss'],
rules: {
  'tailwindcss/classnames-order': 'warn',
  'tailwindcss/no-custom-classname': 'warn',
}
```

## References

- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Tailwind CSS Best Practices](https://tailwindcss.com/docs/utility-first)
- [shadcn/ui](https://ui.shadcn.com/) - Component library using Tailwind
- [Tailwind CSS Performance](https://tailwindcss.com/docs/optimizing-for-production)

## Review

This decision should be reviewed:
- If class verbosity becomes unmanageable
- If performance issues arise
- If a clearly superior alternative emerges
- Annually as part of tech stack review

## Related ADRs

- [ADR-001: Use Next.js as Framework](./001-nextjs-framework.md) - Tailwind integrates well with Next.js
- [ADR-005: Use Radix UI for Components](./005-radix-ui-components.md) - Radix UI styled with Tailwind
