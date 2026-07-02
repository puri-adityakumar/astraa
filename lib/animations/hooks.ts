/**
 * Animation Hooks
 * Custom hooks for animation-related functionality
 */

import { useReducedMotion as useFramerReducedMotion } from "framer-motion";

/**
 * Hook to check if user prefers reduced motion
 * Returns true if animations should be disabled
 */
export function useReducedMotion(): boolean {
  return useFramerReducedMotion() ?? false;
}
