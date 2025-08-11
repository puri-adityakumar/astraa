"use client"

import { motion } from "framer-motion"
import Link from "next/link"

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-1 touch-manipulation focus-visible">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-xl md:text-2xl font-medium"
      >
        <span className="font-ibm text-foreground">astraa</span>
        <span className="font-ibm text-xs md:text-sm text-muted-foreground ml-1">अस्त्र</span>
      </motion.div>
    </Link>
  )
}