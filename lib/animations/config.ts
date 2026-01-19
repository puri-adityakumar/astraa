/**
 * Animation Configuration
 * Centralized animation settings that respect user preferences
 */

export const ANIMATION_CONFIG = {
  // Duration presets (in seconds)
  duration: {
    instant: 0.1,
    fast: 0.2,
    normal: 0.3,
    slow: 0.5,
    slower: 0.8,
  },

  // Easing functions
  ease: {
    default: [0.4, 0, 0.2, 1], // ease-out
    smooth: [0.22, 1, 0.36, 1], // custom smooth
    spring: { type: "spring" as const, stiffness: 300, damping: 20 },
    bounce: { type: "spring" as const, stiffness: 400, damping: 10 },
  },

  // Stagger delays for list animations
  stagger: {
    fast: 0.05,
    normal: 0.08,
    slow: 0.1,
  },

  // Viewport settings for scroll animations
  viewport: {
    once: true,
    margin: "-100px",
  },
} as const;

/**
 * Check if animations should be disabled based on user preferences
 */
export function shouldReduceMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
