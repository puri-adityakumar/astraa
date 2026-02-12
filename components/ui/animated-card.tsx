/**
 * Animated Card Component
 * Card with built-in hover animations and effects
 */

"use client"

import { motion, HTMLMotionProps } from "framer-motion"
import { cn } from "@/lib/utils"
import { useReducedMotion } from "@/lib/animations/hooks"
import { Card } from "./card"
import { forwardRef, ReactNode } from "react"

const HOVER_VARIANTS = {
  lift: { y: -8, transition: { duration: 0.2, ease: "easeOut" } },
  scale: { scale: 1.02, transition: { duration: 0.2, ease: "easeOut" } },
  glow: { boxShadow: "0 0 20px rgba(var(--primary), 0.3)", transition: { duration: 0.3, ease: "easeOut" } },
  tilt: { rotateX: 5, rotateY: 5, transition: { duration: 0.2, ease: "easeOut" } },
  none: {},
} as const

const EMPTY_VARIANT = {}

interface AnimatedCardProps extends Omit<HTMLMotionProps<"div">, "children"> {
  /**
   * Hover effect type
   * @default "lift"
   */
  hoverEffect?: "lift" | "scale" | "glow" | "tilt" | "none"
  
  /**
   * Whether to show a gradient on hover
   * @default false
   */
  hoverGradient?: boolean
  
  /**
   * Gradient colors (Tailwind classes)
   */
  gradientFrom?: string
  gradientTo?: string
  
  /**
   * Card content
   */
  children?: ReactNode
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
    ref
  ) => {
    const shouldReduce = useReducedMotion()

    return (
      <motion.div
        ref={ref}
        className={cn("relative group", className)}
        whileHover={shouldReduce ? EMPTY_VARIANT : HOVER_VARIANTS[hoverEffect]}
        {...props}
      >
        <Card className="h-full relative overflow-hidden">
          {hoverGradient && (
            <motion.div
              className={cn(
                "absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500",
                gradientFrom,
                gradientTo
              )}
            />
          )}
          <div className="relative z-10">
            {children}
          </div>
        </Card>
      </motion.div>
    )
  }
)

AnimatedCard.displayName = "AnimatedCard"

export { AnimatedCard }
