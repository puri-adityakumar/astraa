# Animation System

A comprehensive animation system built with Framer Motion that respects user preferences and provides consistent, accessible animations throughout the application.

## Features

- 🎨 **Pre-configured Variants**: Ready-to-use animation variants for common patterns
- ♿ **Accessibility First**: Automatically respects `prefers-reduced-motion` settings
- 🎯 **Type-Safe**: Full TypeScript support
- 🔧 **Customizable**: Easy to extend and customize
- 📦 **Modular**: Import only what you need

## Quick Start

### Basic Usage

```tsx
import { motion } from 'framer-motion';
import { fadeInUp, staggerContainer } from '@/lib/animations/variants';

function MyComponent() {
  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={fadeInUp}
    >
      <h1>Hello World</h1>
    </motion.div>
  );
}
```

### With Reduced Motion Support

```tsx
import { motion } from 'framer-motion';
import { fadeInUp } from '@/lib/animations/variants';
import { useReducedMotion } from '@/lib/animations/hooks';

function MyComponent() {
  const shouldReduce = useReducedMotion();
  
  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={shouldReduce ? {} : fadeInUp}
    >
      <h1>Hello World</h1>
    </motion.div>
  );
}
```

## Available Variants

### Fade Animations
- `fadeIn` - Simple fade in
- `fadeInUp` - Fade in with upward motion
- `fadeInDown` - Fade in with downward motion
- `fadeInLeft` - Fade in from left
- `fadeInRight` - Fade in from right

### Scale Animations
- `scaleIn` - Scale in animation
- `scaleInBounce` - Scale in with bounce effect

### Slide Animations
- `slideInBottom` - Slide in from bottom
- `slideInTop` - Slide in from top

### Stagger Animations
- `staggerContainer` - Container for staggered children (normal speed)
- `staggerContainerFast` - Fast stagger container
- `staggerContainerSlow` - Slow stagger container
- `staggerItem` - Item for staggered animations

### Special Effects
- `rotateIn` - Rotate in animation
- `flipIn` - Flip in animation
- `expand` - Expand animation (for accordions, dropdowns)
- `blurIn` - Blur in animation
- `shimmer` - Shimmer effect for loading states

## Hooks

### useReducedMotion()
Check if user prefers reduced motion:

```tsx
const shouldReduce = useReducedMotion();
```

### useAnimationVariants()
Get animation-safe variants:

```tsx
const variants = useAnimationVariants(fadeInUp);
// Returns empty object if reduced motion is preferred
```

### useConditionalAnimation()
Conditionally apply animations:

```tsx
const animationProps = useConditionalAnimation({
  initial: { opacity: 0 },
  animate: { opacity: 1 }
});
```

### useStaggerDelay()
Get stagger delay for list items:

```tsx
const delay = useStaggerDelay(index, 0.05);
```

## Components

### Skeleton Components

```tsx
import { Skeleton, SkeletonCard, SkeletonText } from '@/components/ui/skeleton';

<Skeleton className="h-12 w-12" />
<SkeletonCard />
<SkeletonText lines={3} />
```

### Animated Card

```tsx
import { AnimatedCard } from '@/components/ui/animated-card';

<AnimatedCard hoverEffect="lift" hoverGradient>
  <p>Content</p>
</AnimatedCard>
```

### Animated Button

```tsx
import { AnimatedButton } from '@/components/ui/animated-button';

<AnimatedButton effect="scale">
  Click me
</AnimatedButton>
```

### Loading Spinner

```tsx
import { LoadingSpinner, LoadingOverlay } from '@/components/ui/loading-spinner';

<LoadingSpinner size="md" variant="spinner" />
<LoadingOverlay message="Loading..." />
```

### Scroll Reveal

```tsx
import { ScrollReveal } from '@/components/ui/scroll-reveal';

<ScrollReveal direction="up" delay={0.2}>
  <p>This will animate when scrolled into view</p>
</ScrollReveal>
```

### Animated List

```tsx
import { AnimatedList, AnimatedListItem } from '@/components/ui/animated-list';

<AnimatedList>
  {items.map(item => (
    <AnimatedListItem key={item.id}>
      {item.content}
    </AnimatedListItem>
  ))}
</AnimatedList>
```

### Hover Effects

```tsx
import { 
  HoverLift, 
  HoverScale, 
  HoverGlow,
  HoverShine 
} from '@/components/ui/hover-effects';

<HoverLift>
  <Card>Content</Card>
</HoverLift>
```

## Configuration

Animation settings can be customized in `lib/animations/config.ts`:

```typescript
export const ANIMATION_CONFIG = {
  duration: {
    instant: 0.1,
    fast: 0.2,
    normal: 0.3,
    slow: 0.5,
    slower: 0.8,
  },
  ease: {
    default: [0.4, 0, 0.2, 1],
    smooth: [0.22, 1, 0.36, 1],
    spring: { type: "spring", stiffness: 300, damping: 20 },
    bounce: { type: "spring", stiffness: 400, damping: 10 },
  },
  stagger: {
    fast: 0.05,
    normal: 0.08,
    slow: 0.1,
  },
};
```

## Best Practices

1. **Always respect reduced motion**: Use the `useReducedMotion` hook
2. **Keep animations subtle**: Animations should enhance, not distract
3. **Use appropriate durations**: Fast for small elements, slower for large ones
4. **Provide loading states**: Use skeleton screens for better perceived performance
5. **Test with reduced motion**: Ensure your app works well without animations

## Accessibility

The animation system automatically respects the user's `prefers-reduced-motion` setting. When this preference is detected:

- All animations are disabled or significantly reduced
- Transitions become instant
- Motion-based effects are removed

This ensures the application remains accessible to users with vestibular disorders or motion sensitivity.

## Examples

### Staggered List Animation

```tsx
import { motion } from 'framer-motion';
import { staggerContainer, staggerItem } from '@/lib/animations/variants';
import { useReducedMotion } from '@/lib/animations/hooks';

function List({ items }) {
  const shouldReduce = useReducedMotion();
  
  return (
    <motion.ul
      variants={shouldReduce ? {} : staggerContainer}
      initial="hidden"
      animate="show"
    >
      {items.map(item => (
        <motion.li key={item.id} variants={shouldReduce ? {} : staggerItem}>
          {item.content}
        </motion.li>
      ))}
    </motion.ul>
  );
}
```

### Page Transition

```tsx
import { PageTransition } from '@/components/ui/page-transition';

function Layout({ children }) {
  return (
    <PageTransition type="fade">
      {children}
    </PageTransition>
  );
}
```

### Loading State

```tsx
import { SkeletonCard } from '@/components/ui/skeleton';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

function MyComponent({ isLoading, data }) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-3 gap-4">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }
  
  return <div>{/* Render data */}</div>;
}
```

## Contributing

When adding new animations:

1. Add variants to `lib/animations/variants.ts`
2. Update this README with examples
3. Ensure reduced motion support
4. Add TypeScript types
5. Test with keyboard navigation
