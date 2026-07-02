/**
 * Reusable Animation Variants
 * Pre-configured animation variants for common use cases
 */

import { Variants } from "framer-motion";
import { ANIMATION_CONFIG } from "./config";

/**
 * Fade in with upward motion
 */
export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: ANIMATION_CONFIG.duration.slow,
      ease: ANIMATION_CONFIG.ease.smooth,
    },
  },
};

/**
 * Container for staggered children animations
 */
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: ANIMATION_CONFIG.stagger.normal,
      delayChildren: 0.1,
    },
  },
};

/**
 * Fast stagger container
 */
export const staggerContainerFast: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: ANIMATION_CONFIG.stagger.fast,
      delayChildren: 0.05,
    },
  },
};

/**
 * Item for staggered animations
 */
export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: ANIMATION_CONFIG.ease.spring,
  },
};
