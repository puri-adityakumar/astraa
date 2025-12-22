/**
 * Animated List Component
 * List with staggered entrance animations
 */

"use client"

import { motion } from "framer-motion"
import { ReactNode } from "react"
import { useReducedMotion } from "@/lib/animations/hooks"
import { staggerItem } from "@/lib/animations/variants"

interface AnimatedListProps {
  children: ReactNode
  className?: string
  /**
   * Stagger delay between items (in seconds)
   * @default 0.08
   */
  staggerDelay?: number
  /**
   * Initial delay before animation starts (in seconds)
   * @default 0.1
   */
  delayChildren?: number
  /**
   * Whether to animate only once when in view
   * @default true
   */
  once?: boolean
}

export function AnimatedList({
  children,
  className,
  staggerDelay = 0.08,
  delayChildren = 0.1,
  once = true,
}: AnimatedListProps) {
  const shouldReduce = useReducedMotion()

  if (shouldReduce) {
    return <div className={className}>{children}</div>
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
        delayChildren,
      }
    },
  }

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once, margin: "-100px" }}
      variants={containerVariants}
    >
      {children}
    </motion.div>
  )
}

interface AnimatedListItemProps {
  children: ReactNode
  className?: string
  /**
   * Custom animation variant
   */
  variant?: "default" | "scale" | "slide"
}

export function AnimatedListItem({
  children,
  className,
  variant = "default",
}: AnimatedListItemProps) {
  const shouldReduce = useReducedMotion()

  if (shouldReduce) {
    return <div className={className}>{children}</div>
  }

  const variants = {
    default: staggerItem,
    scale: {
      hidden: { opacity: 0, scale: 0.8 },
      show: {
        opacity: 1,
        scale: 1,
        transition: {
          type: "spring",
          stiffness: 300,
          damping: 20,
        }
      },
    },
    slide: {
      hidden: { opacity: 0, x: -20 },
      show: {
        opacity: 1,
        x: 0,
        transition: {
          type: "spring",
          stiffness: 300,
          damping: 20,
        }
      },
    },
  }

  return (
    <motion.div
      className={className}
      variants={variants[variant]}
    >
      {children}
    </motion.div>
  )
}
