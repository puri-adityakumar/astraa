/**
 * Hover Effect Components
 * Reusable hover effect wrappers
 */

"use client"

import { motion } from "framer-motion"
import { ReactNode } from "react"
import { useReducedMotion } from "@/lib/animations/hooks"
import { cn } from "@/lib/utils"

interface HoverEffectProps {
  children: ReactNode
  className?: string
}

/**
 * Lift effect on hover
 */
export function HoverLift({ children, className }: HoverEffectProps) {
  const shouldReduce = useReducedMotion()

  return (
    <motion.div
      className={cn("cursor-pointer", className)}
      whileHover={shouldReduce ? {} : {
        y: -8,
        transition: { duration: 0.2, ease: "easeOut" }
      }}
      whileTap={shouldReduce ? {} : {
        y: -4,
        transition: { duration: 0.1 }
      }}
    >
      {children}
    </motion.div>
  )
}

/**
 * Scale effect on hover
 */
export function HoverScale({ children, className }: HoverEffectProps) {
  const shouldReduce = useReducedMotion()

  return (
    <motion.div
      className={cn("cursor-pointer", className)}
      whileHover={shouldReduce ? {} : {
        scale: 1.05,
        transition: { duration: 0.2, ease: "easeOut" }
      }}
      whileTap={shouldReduce ? {} : {
        scale: 0.98,
        transition: { duration: 0.1 }
      }}
    >
      {children}
    </motion.div>
  )
}

/**
 * Rotate effect on hover
 */
export function HoverRotate({ children, className, degrees = 5 }: HoverEffectProps & { degrees?: number }) {
  const shouldReduce = useReducedMotion()

  return (
    <motion.div
      className={cn("cursor-pointer", className)}
      whileHover={shouldReduce ? {} : {
        rotate: degrees,
        transition: { duration: 0.2, ease: "easeOut" }
      }}
    >
      {children}
    </motion.div>
  )
}

/**
 * Glow effect on hover
 */
export function HoverGlow({ children, className, color = "primary" }: HoverEffectProps & { color?: string }) {
  const shouldReduce = useReducedMotion()

  return (
    <motion.div
      className={cn("cursor-pointer relative", className)}
      whileHover={shouldReduce ? {} : {
        transition: { duration: 0.3 }
      }}
    >
      {!shouldReduce && (
        <motion.div
          className={cn(
            "absolute inset-0 rounded-lg opacity-0 blur-xl -z-10",
            `bg-${color}/30`
          )}
          whileHover={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        />
      )}
      {children}
    </motion.div>
  )
}

/**
 * Tilt effect on hover (3D perspective)
 */
export function HoverTilt({ children, className }: HoverEffectProps) {
  const shouldReduce = useReducedMotion()

  return (
    <motion.div
      className={cn("cursor-pointer", className)}
      style={{ transformStyle: "preserve-3d" }}
      whileHover={shouldReduce ? {} : {
        rotateX: 5,
        rotateY: 5,
        transition: { duration: 0.3, ease: "easeOut" }
      }}
    >
      {children}
    </motion.div>
  )
}

/**
 * Shine effect on hover
 */
export function HoverShine({ children, className }: HoverEffectProps) {
  const shouldReduce = useReducedMotion()

  return (
    <div className={cn("relative overflow-hidden group cursor-pointer", className)}>
      {!shouldReduce && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          initial={{ x: "-100%" }}
          whileHover={{
            x: "100%",
            transition: { duration: 0.6, ease: "easeInOut" }
          }}
        />
      )}
      {children}
    </div>
  )
}

/**
 * Border glow effect on hover
 */
export function HoverBorderGlow({ children, className }: HoverEffectProps) {
  const shouldReduce = useReducedMotion()

  return (
    <motion.div
      className={cn("relative cursor-pointer", className)}
      whileHover={shouldReduce ? {} : {
        transition: { duration: 0.3 }
      }}
    >
      {!shouldReduce && (
        <motion.div
          className="absolute inset-0 rounded-lg border-2 border-primary opacity-0"
          whileHover={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        />
      )}
      {children}
    </motion.div>
  )
}

/**
 * Pulse effect on hover
 */
export function HoverPulse({ children, className }: HoverEffectProps) {
  const shouldReduce = useReducedMotion()

  return (
    <motion.div
      className={cn("cursor-pointer", className)}
      whileHover={shouldReduce ? {} : {
        scale: [1, 1.05, 1],
        transition: {
          duration: 0.6,
          repeat: Infinity,
          ease: "easeInOut"
        }
      }}
    >
      {children}
    </motion.div>
  )
}

/**
 * Float effect (continuous subtle animation)
 */
export function FloatEffect({ children, className }: HoverEffectProps) {
  const shouldReduce = useReducedMotion()

  return (
    <motion.div
      className={className}
      animate={shouldReduce ? {} : {
        y: [0, -10, 0],
        transition: {
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }
      }}
    >
      {children}
    </motion.div>
  )
}

/**
 * Bounce effect (continuous subtle animation)
 */
export function BounceEffect({ children, className }: HoverEffectProps) {
  const shouldReduce = useReducedMotion()

  return (
    <motion.div
      className={className}
      animate={shouldReduce ? {} : {
        y: [0, -5, 0],
        transition: {
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }
      }}
    >
      {children}
    </motion.div>
  )
}
