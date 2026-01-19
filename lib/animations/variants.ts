/**
 * Reusable Animation Variants
 * Pre-configured animation variants for common use cases
 */
import { Variants } from "framer-motion";
import { ANIMATION_CONFIG } from "./config";

/**
 * Fade in animation
 */
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      duration: ANIMATION_CONFIG.duration.normal,
      ease: ANIMATION_CONFIG.ease.default,
    },
  },
};

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
 * Fade in with downward motion
 */
export const fadeInDown: Variants = {
  hidden: { opacity: 0, y: -30 },
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
 * Fade in from left
 */
export const fadeInLeft: Variants = {
  hidden: { opacity: 0, x: -30 },
  show: {
    opacity: 1,
    x: 0,
    transition: {
      duration: ANIMATION_CONFIG.duration.slow,
      ease: ANIMATION_CONFIG.ease.smooth,
    },
  },
};

/**
 * Fade in from right
 */
export const fadeInRight: Variants = {
  hidden: { opacity: 0, x: 30 },
  show: {
    opacity: 1,
    x: 0,
    transition: {
      duration: ANIMATION_CONFIG.duration.slow,
      ease: ANIMATION_CONFIG.ease.smooth,
    },
  },
};

/**
 * Scale in animation
 */
export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  show: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: ANIMATION_CONFIG.duration.slow,
      ease: ANIMATION_CONFIG.ease.smooth,
    },
  },
};

/**
 * Scale in with bounce
 */
export const scaleInBounce: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  show: {
    opacity: 1,
    scale: 1,
    transition: ANIMATION_CONFIG.ease.bounce,
  },
};

/**
 * Slide in from bottom
 */
export const slideInBottom: Variants = {
  hidden: { y: "100%", opacity: 0 },
  show: {
    y: 0,
    opacity: 1,
    transition: {
      duration: ANIMATION_CONFIG.duration.normal,
      ease: ANIMATION_CONFIG.ease.smooth,
    },
  },
  exit: {
    y: "100%",
    opacity: 0,
    transition: {
      duration: ANIMATION_CONFIG.duration.fast,
      ease: ANIMATION_CONFIG.ease.default,
    },
  },
};

/**
 * Slide in from top
 */
export const slideInTop: Variants = {
  hidden: { y: "-100%", opacity: 0 },
  show: {
    y: 0,
    opacity: 1,
    transition: {
      duration: ANIMATION_CONFIG.duration.normal,
      ease: ANIMATION_CONFIG.ease.smooth,
    },
  },
  exit: {
    y: "-100%",
    opacity: 0,
    transition: {
      duration: ANIMATION_CONFIG.duration.fast,
      ease: ANIMATION_CONFIG.ease.default,
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
 * Slow stagger container
 */
export const staggerContainerSlow: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: ANIMATION_CONFIG.stagger.slow,
      delayChildren: 0.15,
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

/**
 * Rotate in animation
 */
export const rotateIn: Variants = {
  hidden: { opacity: 0, rotate: -180, scale: 0.5 },
  show: {
    opacity: 1,
    rotate: 0,
    scale: 1,
    transition: {
      duration: ANIMATION_CONFIG.duration.slow,
      ease: ANIMATION_CONFIG.ease.smooth,
    },
  },
};

/**
 * Flip in animation
 */
export const flipIn: Variants = {
  hidden: { opacity: 0, rotateX: -90 },
  show: {
    opacity: 1,
    rotateX: 0,
    transition: {
      duration: ANIMATION_CONFIG.duration.slow,
      ease: ANIMATION_CONFIG.ease.smooth,
    },
  },
};

/**
 * Expand animation (for accordions, dropdowns)
 */
export const expand: Variants = {
  hidden: { height: 0, opacity: 0 },
  show: {
    height: "auto",
    opacity: 1,
    transition: {
      height: {
        duration: ANIMATION_CONFIG.duration.normal,
        ease: ANIMATION_CONFIG.ease.default,
      },
      opacity: {
        duration: ANIMATION_CONFIG.duration.fast,
        ease: ANIMATION_CONFIG.ease.default,
      },
    },
  },
  exit: {
    height: 0,
    opacity: 0,
    transition: {
      height: {
        duration: ANIMATION_CONFIG.duration.fast,
        ease: ANIMATION_CONFIG.ease.default,
      },
      opacity: {
        duration: ANIMATION_CONFIG.duration.instant,
        ease: ANIMATION_CONFIG.ease.default,
      },
    },
  },
};

/**
 * Blur in animation
 */
export const blurIn: Variants = {
  hidden: { opacity: 0, filter: "blur(10px)" },
  show: {
    opacity: 1,
    filter: "blur(0px)",
    transition: {
      duration: ANIMATION_CONFIG.duration.slow,
      ease: ANIMATION_CONFIG.ease.smooth,
    },
  },
};

/**
 * Shimmer effect for loading states
 */
export const shimmer: Variants = {
  initial: { backgroundPosition: "-200% 0" },
  animate: {
    backgroundPosition: "200% 0",
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: "linear",
    },
  },
};
