/**
 * Animation System
 * Centralized exports for all animation utilities
 */

// Configuration
export { ANIMATION_CONFIG, shouldReduceMotion } from "./config";

// Variants
export {
  fadeIn,
  fadeInUp,
  fadeInDown,
  fadeInLeft,
  fadeInRight,
  scaleIn,
  scaleInBounce,
  slideInBottom,
  slideInTop,
  staggerContainer,
  staggerContainerFast,
  staggerContainerSlow,
  staggerItem,
  rotateIn,
  flipIn,
  expand,
  blurIn,
  shimmer,
} from "./variants";

// Hooks
export {
  useReducedMotion,
  useAnimationVariants,
  useConditionalAnimation,
  useInView,
  useStaggerDelay,
  usePageTransition,
} from "./hooks";

// Presets
export {
  pageTransitions,
  cardHoverAnimations,
  buttonHoverAnimations,
  listItemAnimation,
  modalAnimations,
  notificationAnimations,
  loadingAnimations,
  scrollAnimations,
  iconAnimations,
  backgroundAnimations,
  counterAnimation,
  progressBarAnimation,
  skeletonShimmer,
} from "./presets";
