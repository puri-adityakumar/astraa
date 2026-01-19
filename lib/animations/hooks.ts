/**
 * Animation Hooks
 * Custom hooks for animation-related functionality
 */
import { useEffect, useState } from "react";
import { useReducedMotion as useFramerReducedMotion } from "framer-motion";

/**
 * Hook to check if user prefers reduced motion
 * Returns true if animations should be disabled
 */
export function useReducedMotion(): boolean {
  return useFramerReducedMotion() ?? false;
}

/**
 * Hook to get animation-safe variants
 * Returns empty object if reduced motion is preferred
 */
export function useAnimationVariants<T extends Record<string, any>>(
  variants: T,
): T | Record<string, never> {
  const shouldReduce = useReducedMotion();
  return shouldReduce ? ({} as Record<string, never>) : variants;
}

/**
 * Hook to conditionally apply animations
 * Returns the animation props if animations are enabled, otherwise returns empty object
 */
export function useConditionalAnimation(
  animationProps: Record<string, any>,
): Record<string, any> {
  const shouldReduce = useReducedMotion();
  return shouldReduce ? {} : animationProps;
}

/**
 * Hook to detect if element is in viewport
 * Useful for triggering animations on scroll
 */
export function useInView(options?: IntersectionObserverInit) {
  const [isInView, setIsInView] = useState(false);
  const [node, setNode] = useState<Element | null>(null);

  useEffect(() => {
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry) {
          setIsInView(entry.isIntersecting);
        }
      },
      {
        threshold: 0.1,
        ...options,
      },
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, [node, options]);

  return [setNode, isInView] as const;
}

/**
 * Hook to get stagger delay for list items
 */
export function useStaggerDelay(
  index: number,
  baseDelay: number = 0.05,
): number {
  const shouldReduce = useReducedMotion();
  return shouldReduce ? 0 : index * baseDelay;
}

/**
 * Hook to handle page transition state
 */
export function usePageTransition() {
  const [isTransitioning, setIsTransitioning] = useState(false);

  const startTransition = () => setIsTransitioning(true);
  const endTransition = () => setIsTransitioning(false);

  return {
    isTransitioning,
    startTransition,
    endTransition,
  };
}
