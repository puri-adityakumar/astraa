"use client"

import { motion } from "framer-motion"
import { ShimmerButton } from "@/components/ui/shimmer-button"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { useEffect, useState } from "react"
import { StatsBar } from "./stats-bar"

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1]
    }
  }
}

export function HeroSection() {
  const [isMac, setIsMac] = useState(false)

  useEffect(() => {
    setIsMac(navigator.platform.toUpperCase().indexOf('MAC') >= 0)
  }, [])

  return (
    <section className="relative flex-1 flex items-center justify-center -my-6 sm:-my-8 lg:-my-12">
      <motion.div
        className="text-center max-w-3xl mx-auto px-4 relative z-10"
        initial="hidden"
        animate="show"
        variants={{
          hidden: {},
          show: {
            transition: {
              staggerChildren: 0.1
            }
          }
        }}
      >
        {/* Main Heading */}
        <motion.h1
          variants={fadeInUp}
          className="font-bold tracking-tight text-4xl sm:text-5xl md:text-6xl lg:text-7xl"
        >
          <span className="text-foreground">Stop Searching, Start Solving</span>
          <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 dark:from-purple-400 dark:via-blue-400 dark:to-cyan-400">
            अस्त्र at your command
          </span>
        </motion.h1>

        {/* Tagline */}
        <motion.p
          variants={fadeInUp}
          className="mt-6 text-muted-foreground text-lg sm:text-xl max-w-xl mx-auto"
        >
          Your all-in-one utility suite. A{" "}
          <span className="text-foreground font-medium">vast collection</span>{" "}
          of powerful tools{" "}
          <span className="text-foreground font-medium">compiled in one place</span>
          ,{" "}
          <span className="text-foreground font-medium">
            running entirely in your browser.
          </span>
        </motion.p>

        {/* CTA Button */}
        <motion.div
          variants={fadeInUp}
          className="mt-10 flex justify-center"
        >
          <Link href="/explore">
            <ShimmerButton
              className="shadow-2xl"
              shimmerSize="0.1em"
              borderRadius="100px"
              shimmerDuration="2s"
            >
              <span className="flex items-center gap-2 text-base font-medium px-4 py-1">
                Explore
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
            </ShimmerButton>
          </Link>
        </motion.div>

        {/* Keyboard Shortcut */}
        <motion.p
          variants={fadeInUp}
          className="mt-8 text-sm text-muted-foreground"
        >
          Press{" "}
          <kbd className="rounded border bg-muted px-2 py-0.5 font-mono text-xs font-medium">
            {isMac ? "⌘" : "Ctrl"}
          </kbd>
          {" + "}
          <kbd className="rounded border bg-muted px-2 py-0.5 font-mono text-xs font-medium">K</kbd>
          {" "}for quick access
        </motion.p>

        {/* Stats */}
        <motion.div variants={fadeInUp} className="mt-6">
          <StatsBar />
        </motion.div>
      </motion.div>
    </section>
  )
}
