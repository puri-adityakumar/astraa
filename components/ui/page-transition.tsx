/**
 * Page Transition Component
 * Smooth transitions between page navigations
 */

"use client"

import { motion, AnimatePresence } from "framer-motion"
import { usePathname } from "next/navigation"
import { useReducedMotion } from "@/lib/animations/hooks"
import { ReactNode } from "react"

interface PageTransitionProps {
  children: ReactNode
  /**
   * Transition type
   * @default "fade"
   */
  type?: "fade" | "slide" | "scale" | "none"
}

export function PageTransition({ children, type = "fade" }: PageTransitionProps) {
  const pathname = usePathname()
  const shouldReduce = useReducedMotion()

  if (shouldReduce || type === "none") {
    return <>{children}</>
  }

  const variants = {
    fade: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      transition: { duration: 0.3, ease: "easeInOut" }
    },
    slide: {
      initial: { opacity: 0, x: 20 },
      animate: { opacity: 1, x: 0 },
      exit: { opacity: 0, x: -20 },
      transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] }
    },
    scale: {
      initial: { opacity: 0, scale: 0.95 },
      animate: { opacity: 1, scale: 1 },
      exit: { opacity: 0, scale: 1.05 },
      transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] }
    }
  }

  const selectedVariant = variants[type]

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial={selectedVariant.initial}
        animate={selectedVariant.animate}
        exit={selectedVariant.exit}
        transition={selectedVariant.transition}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
