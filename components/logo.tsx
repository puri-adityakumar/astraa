"use client"

import { motion } from "framer-motion"
import Link from "next/link"

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-1">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl font-semibold"
      >
        <span className="font-logo text-white">astraa</span>
        <span className="font-mono text-sm text-muted-foreground ml-1">अस्त्र</span>
      </motion.div>
    </Link>
  )
}