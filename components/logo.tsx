"use client"

import { motion, useReducedMotion } from "framer-motion"
import Link from "next/link"

import { cn } from "@/lib/utils"

export function Logo({ className }: { className?: string }) {
  const shouldReduce = useReducedMotion()

  return (
    <Link href="/" className="flex items-center gap-[9px]">
      <motion.div
        initial={shouldReduce ? false : { opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn("flex items-center gap-[9px]", className)}
      >
        <svg
          viewBox="0 0 24 24"
          width="18"
          height="18"
          stroke="currentColor"
          strokeWidth="1.7"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-foreground flex-none"
          aria-hidden="true"
        >
          <path d="M4 20 L14 4 L16 14 L4 20 Z" />
        </svg>
        <span className="font-sans font-bold text-foreground leading-none" style={{ letterSpacing: "-0.03em" }}>
          astraa
          <span className="font-deva text-muted-foreground ml-[5px]" style={{ fontSize: "13px" }}>
            अस्त्र
          </span>
        </span>
      </motion.div>
    </Link>
  )
}
