/**
 * Animated Button Component
 * Button with built-in hover and tap animations
 */

"use client"

import { motion, HTMLMotionProps } from "framer-motion"
import { cn } from "@/lib/utils"
import { useReducedMotion } from "@/lib/animations/hooks"
import { Button, ButtonProps } from "./button"
import { forwardRef } from "react"

interface AnimatedButtonProps extends Omit<HTMLMotionProps<"button">, keyof ButtonProps>, ButtonProps {
  /**
   * Animation effect type
   * @default "scale"
   */
  effect?: "scale" | "lift" | "pulse" | "shine" | "none"
}

const AnimatedButton = forwardRef<HTMLButtonElement, AnimatedButtonProps>(
  (
    {
      className,
      effect = "scale",
      children,
      ...props
    },
    ref
  ) => {
    const shouldReduce = useReducedMotion()

    const hoverVariants = {
      scale: shouldReduce ? {} : {
        scale: 1.05,
        transition: { duration: 0.2, ease: "easeOut" }
      },
      lift: shouldReduce ? {} : {
        y: -2,
        transition: { duration: 0.2, ease: "easeOut" }
      },
      pulse: shouldReduce ? {} : {
        scale: [1, 1.05, 1],
        transition: { duration: 0.6, repeat: Infinity }
      },
      shine: shouldReduce ? {} : {},
      none: {}
    }

    const tapVariants = {
      scale: shouldReduce ? {} : { scale: 0.95 },
      lift: shouldReduce ? {} : { y: 0 },
      pulse: shouldReduce ? {} : { scale: 0.95 },
      shine: shouldReduce ? {} : { scale: 0.95 },
      none: {}
    }

    return (
      <motion.div
        className={cn("relative inline-block", className)}
        whileHover={hoverVariants[effect]}
        whileTap={tapVariants[effect]}
      >
        <Button
          ref={ref}
          className={cn(
            "relative overflow-hidden",
            effect === "shine" && "group"
          )}
          {...props}
        >
          {effect === "shine" && !shouldReduce && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
              initial={{ x: "-100%" }}
              whileHover={{
                x: "100%",
                transition: { duration: 0.6, ease: "easeInOut" }
              }}
            />
          )}
          <span className="relative z-10">{children}</span>
        </Button>
      </motion.div>
    )
  }
)

AnimatedButton.displayName = "AnimatedButton"

export { AnimatedButton }
