/**
 * Animated Card Component
 * Card with built-in hover animations and effects
 */

"use client";

import { forwardRef, ReactNode } from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { useReducedMotion } from "@/lib/animations/hooks";
import { cn } from "@/lib/utils";
import { Card } from "./card";

interface AnimatedCardProps extends Omit<HTMLMotionProps<"div">, "children"> {
  /**
   * Hover effect type
   * @default "lift"
   */
  hoverEffect?: "lift" | "scale" | "glow" | "tilt" | "none";

  /**
   * Whether to show a gradient on hover
   * @default false
   */
  hoverGradient?: boolean;

  /**
   * Gradient colors (Tailwind classes)
   */
  gradientFrom?: string;
  gradientTo?: string;

  /**
   * Card content
   */
  children?: ReactNode;
}

const AnimatedCard = forwardRef<HTMLDivElement, AnimatedCardProps>(
  (
    {
      className,
      hoverEffect = "lift",
      hoverGradient = false,
      gradientFrom = "from-primary/5",
      gradientTo = "to-secondary/5",
      children,
      ...props
    },
    ref,
  ) => {
    const shouldReduce = useReducedMotion();

    const hoverVariants = {
      lift: shouldReduce
        ? {}
        : {
            y: -8,
            transition: { duration: 0.2, ease: "easeOut" },
          },
      scale: shouldReduce
        ? {}
        : {
            scale: 1.02,
            transition: { duration: 0.2, ease: "easeOut" },
          },
      glow: shouldReduce
        ? {}
        : {
            boxShadow: "0 0 20px rgba(var(--primary), 0.3)",
            transition: { duration: 0.3, ease: "easeOut" },
          },
      tilt: shouldReduce
        ? {}
        : {
            rotateX: 5,
            rotateY: 5,
            transition: { duration: 0.2, ease: "easeOut" },
          },
      none: {},
    };

    return (
      <motion.div
        ref={ref}
        className={cn("group relative", className)}
        whileHover={hoverVariants[hoverEffect]}
        {...props}
      >
        <Card className="relative h-full overflow-hidden">
          {hoverGradient && (
            <motion.div
              className={cn(
                "absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity duration-500 group-hover:opacity-100",
                gradientFrom,
                gradientTo,
              )}
            />
          )}
          <div className="relative z-10">{children}</div>
        </Card>
      </motion.div>
    );
  },
);

AnimatedCard.displayName = "AnimatedCard";

export { AnimatedCard };
