/**
 * Animation Presets
 * Common animation configurations for consistent use across the app
 */
import { Variants } from "framer-motion";
import { ANIMATION_CONFIG } from "./config";

/**
 * Page transition presets
 */
export const pageTransitions = {
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: ANIMATION_CONFIG.duration.normal },
  },
  slide: {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
    transition: {
      duration: ANIMATION_CONFIG.duration.normal,
      ease: ANIMATION_CONFIG.ease.smooth,
    },
  },
  scale: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 1.05 },
    transition: {
      duration: ANIMATION_CONFIG.duration.normal,
      ease: ANIMATION_CONFIG.ease.smooth,
    },
  },
} as const;

/**
 * Card hover animations
 */
export const cardHoverAnimations = {
  lift: {
    whileHover: { y: -8 },
    transition: {
      duration: ANIMATION_CONFIG.duration.fast,
      ease: ANIMATION_CONFIG.ease.default,
    },
  },
  scale: {
    whileHover: { scale: 1.02 },
    transition: {
      duration: ANIMATION_CONFIG.duration.fast,
      ease: ANIMATION_CONFIG.ease.default,
    },
  },
  glow: {
    whileHover: { boxShadow: "0 0 20px rgba(var(--primary), 0.3)" },
    transition: {
      duration: ANIMATION_CONFIG.duration.normal,
      ease: ANIMATION_CONFIG.ease.default,
    },
  },
} as const;

/**
 * Button hover animations
 */
export const buttonHoverAnimations = {
  scale: {
    whileHover: { scale: 1.05 },
    whileTap: { scale: 0.95 },
    transition: { duration: ANIMATION_CONFIG.duration.fast },
  },
  lift: {
    whileHover: { y: -2 },
    whileTap: { y: 0 },
    transition: { duration: ANIMATION_CONFIG.duration.fast },
  },
  pulse: {
    whileHover: { scale: [1, 1.05, 1] },
    transition: { duration: 0.6, repeat: Infinity },
  },
} as const;

/**
 * List item animations for staggered entrance
 */
export const listItemAnimation: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: ANIMATION_CONFIG.ease.spring,
  },
};

/**
 * Modal/Dialog animations
 */
export const modalAnimations = {
  backdrop: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: ANIMATION_CONFIG.duration.fast },
  },
  content: {
    initial: { opacity: 0, scale: 0.95, y: 20 },
    animate: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.95, y: 20 },
    transition: {
      duration: ANIMATION_CONFIG.duration.normal,
      ease: ANIMATION_CONFIG.ease.smooth,
    },
  },
} as const;

/**
 * Notification/Toast animations
 */
export const notificationAnimations = {
  slideInRight: {
    initial: { opacity: 0, x: 100 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 100 },
    transition: {
      duration: ANIMATION_CONFIG.duration.normal,
      ease: ANIMATION_CONFIG.ease.smooth,
    },
  },
  slideInTop: {
    initial: { opacity: 0, y: -100 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -100 },
    transition: {
      duration: ANIMATION_CONFIG.duration.normal,
      ease: ANIMATION_CONFIG.ease.smooth,
    },
  },
} as const;

/**
 * Loading animations
 */
export const loadingAnimations = {
  spin: {
    animate: { rotate: 360 },
    transition: { duration: 1, repeat: Infinity, ease: "linear" },
  },
  pulse: {
    animate: { scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] },
    transition: { duration: 1.5, repeat: Infinity, ease: "easeInOut" },
  },
  bounce: {
    animate: { y: [0, -10, 0] },
    transition: { duration: 0.6, repeat: Infinity, ease: "easeInOut" },
  },
} as const;

/**
 * Scroll-triggered animations
 */
export const scrollAnimations = {
  fadeInUp: {
    initial: { opacity: 0, y: 50 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-100px" },
    transition: {
      duration: ANIMATION_CONFIG.duration.slow,
      ease: ANIMATION_CONFIG.ease.smooth,
    },
  },
  fadeInScale: {
    initial: { opacity: 0, scale: 0.8 },
    whileInView: { opacity: 1, scale: 1 },
    viewport: { once: true, margin: "-100px" },
    transition: {
      duration: ANIMATION_CONFIG.duration.slow,
      ease: ANIMATION_CONFIG.ease.smooth,
    },
  },
  slideInLeft: {
    initial: { opacity: 0, x: -50 },
    whileInView: { opacity: 1, x: 0 },
    viewport: { once: true, margin: "-100px" },
    transition: {
      duration: ANIMATION_CONFIG.duration.slow,
      ease: ANIMATION_CONFIG.ease.smooth,
    },
  },
  slideInRight: {
    initial: { opacity: 0, x: 50 },
    whileInView: { opacity: 1, x: 0 },
    viewport: { once: true, margin: "-100px" },
    transition: {
      duration: ANIMATION_CONFIG.duration.slow,
      ease: ANIMATION_CONFIG.ease.smooth,
    },
  },
} as const;

/**
 * Icon animations
 */
export const iconAnimations = {
  rotate: {
    whileHover: { rotate: 360 },
    transition: { duration: 0.6 },
  },
  bounce: {
    whileHover: { y: [0, -5, 0] },
    transition: { duration: 0.4 },
  },
  scale: {
    whileHover: { scale: 1.2 },
    transition: { duration: ANIMATION_CONFIG.duration.fast },
  },
  wiggle: {
    whileHover: { rotate: [0, -10, 10, -10, 0] },
    transition: { duration: 0.5 },
  },
} as const;

/**
 * Background animations
 */
export const backgroundAnimations = {
  float: {
    animate: {
      y: [0, -20, 0],
      x: [0, 10, 0],
    },
    transition: {
      duration: 8,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
  pulse: {
    animate: {
      scale: [1, 1.2, 1],
      opacity: [0.3, 0.5, 0.3],
    },
    transition: {
      duration: 8,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
  shimmer: {
    animate: {
      backgroundPosition: ["200% 0", "-200% 0"],
    },
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "linear",
    },
  },
} as const;

/**
 * Number counter animation
 */
export const counterAnimation = {
  initial: { scale: 1.2, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  transition: { type: "spring", stiffness: 500, damping: 30 },
} as const;

/**
 * Progress bar animation
 */
export const progressBarAnimation = (progress: number) => ({
  initial: { width: 0 },
  animate: { width: `${progress}%` },
  transition: { duration: 0.8, ease: ANIMATION_CONFIG.ease.smooth },
});

/**
 * Skeleton shimmer animation
 */
export const skeletonShimmer: Variants = {
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
