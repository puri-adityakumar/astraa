# Animation utilities

Astraa keeps a small shared Framer Motion surface:

- `config.ts` contains timing, easing, stagger, and viewport tokens;
- `variants.ts` exports `fadeInUp`, `staggerContainer`,
  `staggerContainerFast`, and `staggerItem`;
- `hooks.ts` exports `useReducedMotion`.

Use only a shared variant that is already needed by multiple components. Keep
one-off motion next to its component, and always disable non-essential motion
when the user prefers reduced motion.

```typescript
import { motion } from "framer-motion";

import { useReducedMotion } from "@/lib/animations/hooks";
import { fadeInUp } from "@/lib/animations/variants";

export function AnimatedSection() {
  const shouldReduce = useReducedMotion();

  return (
    <motion.section
      variants={shouldReduce ? {} : fadeInUp}
      initial="hidden"
      animate="show"
    >
      Content
    </motion.section>
  );
}
```

Do not recreate the removed showcase-only wrappers or animation barrels. Add a
variant only when a production consumer and reduced-motion behavior are both
defined.
