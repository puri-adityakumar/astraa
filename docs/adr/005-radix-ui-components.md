# ADR-005: Use Radix UI for Accessible Components

Date: 2024-01-15

## Status

Accepted

## Context

We need a component library that provides:
- Accessible components (WCAG 2.1 AA compliant)
- Unstyled/headless components for design flexibility
- Keyboard navigation
- Focus management
- ARIA attributes
- TypeScript support
- Small bundle size

The application serves diverse users and accessibility is a priority (see [Issue #20](https://github.com/puri-adityakumar/astraa/issues/20)).

## Decision

We will use **Radix UI** primitives with **shadcn/ui** as our component foundation, styled with Tailwind CSS.

### Implementation Approach
- Use Radix UI primitives as base components
- Style with Tailwind CSS
- Use shadcn/ui pattern for component organization
- Extend with custom components as needed

## Consequences

### Positive Consequences

1. **Accessibility Built-in**
   - WCAG 2.1 AA compliant out of the box
   - Proper ARIA attributes automatically
   - Keyboard navigation handled
   - Focus management included
   - Screen reader support

2. **Flexibility**
   - Unstyled by default
   - Full control over appearance
   - Works with any styling solution
   - No design opinions forced

3. **Performance**
   - Small bundle size (~5-15KB per component)
   - Tree-shakeable
   - No runtime styling overhead
   - Efficient rendering

4. **Developer Experience**
   - Excellent TypeScript support
   - Composable API
   - Clear documentation
   - Intuitive component patterns

5. **Maintenance**
   - Well-maintained
   - Regular updates
   - Active community
   - Backed by Modulz/WorkOS

6. **Integration**
   - Works seamlessly with Next.js
   - Perfect fit with Tailwind CSS
   - Compatible with our tech stack
   - No conflicts with other libraries

7. **Customization**
   - Easy to customize appearance
   - Can override any behavior
   - Extensible architecture
   - Own the components

### Negative Consequences

1. **Learning Curve**
   - Need to learn Radix UI patterns
   - Composition model different from monolithic components
   - More verbose than pre-styled components

2. **Initial Setup**
   - Requires styling each component
   - More setup than pre-styled libraries
   - Need to create design system

3. **Breaking Changes**
   - Radix UI occasionally has breaking changes
   - Need to update components
   - Can affect multiple components

4. **Documentation Gaps**
   - Some edge cases not well documented
   - Need to read source code sometimes
   - Community examples vary in quality

## Alternatives Considered

### 1. Material UI (MUI)

**Pros:**
- Complete component library
- Pre-styled components
- Large ecosystem
- Mature and stable

**Cons:**
- Large bundle size (~300KB+)
- Opinionated Material Design
- Harder to customize
- Runtime styling overhead (Emotion)
- Conflicts with our Tailwind approach

**Why rejected:** Too large, opinionated design, conflicts with our styling approach.

### 2. Chakra UI

**Pros:**
- Accessible components
- Good developer experience
- Customizable theme system
- Active community

**Cons:**
- Opinionated styling approach
- CSS-in-JS (Emotion)
- Conflicts with Tailwind
- Larger bundle size
- Different styling paradigm

**Why rejected:** CSS-in-JS conflicts with Tailwind, opinionated styling.

### 3. React Aria (Adobe)

**Pros:**
- Excellent accessibility
- Unstyled components
- Enterprise backing
- Comprehensive

**Cons:**
- Lower-level than Radix
- More verbose API
- Steeper learning curve
- Smaller community
- Less documentation

**Why rejected:** More complex API, smaller community than Radix.

### 4. Headless UI (Tailwind Labs)

**Pros:**
- Made by Tailwind team
- Perfect Tailwind integration
- Unstyled
- Good documentation

**Cons:**
- Fewer components than Radix
- Less feature-rich
- Smaller ecosystem
- Less customizable

**Why rejected:** Fewer components, less feature-rich than Radix.

### 5. Build from Scratch

**Pros:**
- Full control
- No dependencies
- Exactly what we need

**Cons:**
- Massive time investment
- Accessibility expertise required
- Maintenance burden
- Testing complexity
- Reinventing the wheel

**Why rejected:** Not practical given time and expertise required for proper accessibility.

## Implementation Details

### Component Structure

```tsx
// components/ui/button.tsx
import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md text-sm font-medium',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline: 'border border-input hover:bg-accent hover:text-accent-foreground',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'underline-offset-4 hover:underline text-primary',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
```

### Using Radix Primitives

```tsx
// components/ui/dialog.tsx
import * as DialogPrimitive from '@radix-ui/react-dialog'

const Dialog = DialogPrimitive.Root
const DialogTrigger = DialogPrimitive.Trigger
const DialogPortal = DialogPrimitive.Portal
const DialogOverlay = DialogPrimitive.Overlay
const DialogClose = DialogPrimitive.Close

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay className="fixed inset-0 bg-black/50" />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        'fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%]',
        'bg-background p-6 shadow-lg rounded-lg',
        className
      )}
      {...props}
    >
      {children}
    </DialogPrimitive.Content>
  </DialogPortal>
))
```

### Usage Example

```tsx
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'

export function Example() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Open Dialog</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Dialog Title</DialogTitle>
        </DialogHeader>
        <p>Dialog content here</p>
      </DialogContent>
    </Dialog>
  )
}
```

## Available Radix Components

Components we use from Radix UI:

- **accordion**: Collapsible content sections
- **alert-dialog**: Modal confirmation dialogs
- **avatar**: User avatars
- **checkbox**: Checkboxes
- **collapsible**: Collapsible content
- **dialog**: Modal dialogs
- **dropdown-menu**: Dropdown menus
- **hover-card**: Hover cards/tooltips
- **label**: Form labels
- **menubar**: Menu bars
- **navigation-menu**: Navigation menus
- **popover**: Popovers
- **progress**: Progress indicators
- **radio-group**: Radio button groups
- **scroll-area**: Scrollable areas
- **select**: Dropdown selects
- **separator**: Visual separators
- **slider**: Range sliders
- **switch**: Toggle switches
- **tabs**: Tabbed interfaces
- **toast**: Toast notifications
- **toggle**: Toggle buttons
- **tooltip**: Tooltips

## Accessibility Features

### Automatic Features

Radix UI automatically provides:

1. **Keyboard Navigation**
   - Tab navigation
   - Arrow key navigation in menus
   - Enter/Space for activation
   - Escape to close

2. **ARIA Attributes**
   - `aria-label`, `aria-labelledby`
   - `aria-expanded`, `aria-hidden`
   - `role` attributes
   - `aria-describedby`

3. **Focus Management**
   - Focus trap in modals
   - Focus return after closing
   - Focus visible indicators
   - Proper tab order

4. **Screen Reader Support**
   - Proper announcements
   - Hidden content handling
   - Live regions for updates

### Example: Dialog Accessibility

```tsx
<Dialog>
  {/* Auto-managed focus trap */}
  {/* Escape key closes */}
  {/* Click outside closes */}
  {/* Focus returns to trigger */}
  {/* aria-modal="true" */}
  {/* role="dialog" */}
  <DialogContent>
    {/* aria-labelledby points to title */}
    <DialogTitle>{/* aria-level="2" */}</DialogTitle>
    {/* Content automatically described */}
  </DialogContent>
</Dialog>
```

## Testing Accessibility

```typescript
import { axe, toHaveNoViolations } from 'jest-axe'

expect.extend(toHaveNoViolations)

test('Dialog has no accessibility violations', async () => {
  const { container } = render(
    <Dialog open>
      <DialogContent>
        <DialogTitle>Title</DialogTitle>
        <p>Content</p>
      </DialogContent>
    </Dialog>
  )

  const results = await axe(container)
  expect(results).toHaveNoViolations()
})
```

## Component Customization

### Styling

```tsx
// Override default styles
<Button
  className="bg-gradient-to-r from-purple-500 to-pink-500"
>
  Custom styled button
</Button>
```

### Behavior

```tsx
// Extend component behavior
const CustomDialog = ({ onOpenChange, ...props }) => {
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      // Custom logic before closing
      console.log('Dialog closing')
    }
    onOpenChange?.(open)
  }

  return (
    <Dialog onOpenChange={handleOpenChange} {...props} />
  )
}
```

## Performance

### Bundle Size
- **Radix Dialog**: ~8KB gzipped
- **Radix Select**: ~12KB gzipped
- **Radix Popover**: ~6KB gzipped
- Total (all components): ~60KB gzipped

### Comparison
- **Material UI**: ~300KB+ gzipped
- **Chakra UI**: ~150KB+ gzipped
- **Radix UI**: ~60KB gzipped (all components we use)

## Migration Path

If we need to migrate:

1. **To Material UI**: High effort, different patterns
2. **To Chakra UI**: Moderate effort, similar patterns
3. **To React Aria**: Moderate effort, similar primitives
4. **To custom components**: High effort, need accessibility expertise

## Future Enhancements

- [ ] Add more Radix components as needed
- [ ] Create custom composite components
- [ ] Implement advanced animations
- [ ] Add more accessibility features
- [ ] Create component variants

## References

- [Radix UI Documentation](https://www.radix-ui.com/)
- [shadcn/ui](https://ui.shadcn.com/) - Component collection using Radix
- [Radix UI GitHub](https://github.com/radix-ui/primitives)
- [WAI-ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [Issue #20: Accessibility Standards](https://github.com/puri-adityakumar/astraa/issues/20)

## Review

This decision should be reviewed:
- If Radix UI has major breaking changes
- If accessibility requirements change
- If bundle size becomes a concern
- If a clearly superior alternative emerges
- Annually as part of tech stack review

## Related ADRs

- [ADR-001: Use Next.js as Framework](./001-nextjs-framework.md)
- [ADR-004: Use Tailwind CSS](./004-tailwind-css.md) - Radix UI styled with Tailwind
