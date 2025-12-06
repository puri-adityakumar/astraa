"use client"

import { motion, useReducedMotion } from "framer-motion"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight, Sparkles, Zap, Shield, Heart } from "lucide-react"

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  show: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1]
    }
  }
}

export function HeroSection() {
  const prefersReducedMotion = useReducedMotion()
  
  return (
    <section className="relative overflow-hidden min-h-[90vh] flex items-center -mt-6 sm:-mt-8 lg:-mt-12">
      <motion.div
        className="text-center space-y-8 sm:space-y-10 lg:space-y-12 max-w-5xl mx-auto w-full px-4"
        initial="hidden"
        animate="show"
        variants={fadeInUp}
      >
        {/* Floating decorative elements */}
        <HeroBackground prefersReducedMotion={prefersReducedMotion} />

        <div className="relative">
          {/* Sparkle decorations */}
          <SparkleDecorations prefersReducedMotion={prefersReducedMotion} />

          <motion.div
            variants={fadeInUp}
            className="space-y-6 sm:space-y-8 lg:space-y-10"
          >
            <HeroBadge prefersReducedMotion={prefersReducedMotion} />
            <HeroHeading />
            <HeroSubtitle />
            <HeroValueProps />
          </motion.div>
        </div>

        <HeroCTA prefersReducedMotion={prefersReducedMotion} />
        <KeyboardShortcutHint />
      </motion.div>
    </section>
  )
}

function HeroBackground({ prefersReducedMotion }: { prefersReducedMotion: boolean | null }) {
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
      <motion.div
        className="absolute top-20 left-10 w-72 h-72 sm:w-96 sm:h-96 bg-primary/10 rounded-full blur-3xl"
        animate={prefersReducedMotion ? {} : {
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
          x: [0, 30, 0],
          y: [0, -20, 0],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-40 right-10 w-96 h-96 sm:w-[500px] sm:h-[500px] bg-secondary/10 rounded-full blur-3xl"
        animate={prefersReducedMotion ? {} : {
          scale: [1, 1.3, 1],
          opacity: [0.2, 0.4, 0.2],
          x: [0, -30, 0],
          y: [0, 20, 0],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />
      <motion.div
        className="absolute bottom-20 left-1/2 -translate-x-1/2 w-80 h-80 sm:w-96 sm:h-96 bg-accent/10 rounded-full blur-3xl"
        animate={prefersReducedMotion ? {} : {
          scale: [1, 1.15, 1],
          opacity: [0.2, 0.35, 0.2],
        }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />
    </div>
  )
}

function SparkleDecorations({ prefersReducedMotion }: { prefersReducedMotion: boolean | null }) {
  return (
    <>
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
        className="absolute -top-8 sm:-top-12 left-1/4 text-primary"
      >
        <motion.div
          animate={prefersReducedMotion ? {} : { rotate: [0, 360], scale: [1, 1.2, 1] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        >
          <Sparkles className="h-6 w-6 sm:h-8 sm:w-8" />
        </motion.div>
      </motion.div>
      <motion.div
        initial={{ scale: 0, rotate: 180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
        className="absolute -top-6 sm:-top-10 right-1/4 text-secondary"
      >
        <motion.div
          animate={prefersReducedMotion ? {} : { rotate: [0, -360], scale: [1, 1.3, 1] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        >
          <Sparkles className="h-5 w-5 sm:h-7 sm:w-7" />
        </motion.div>
      </motion.div>
    </>
  )
}

function HeroBadge({ prefersReducedMotion }: { prefersReducedMotion: boolean | null }) {
  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
      className="inline-block"
    >
      <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 border border-primary/20 text-primary text-sm font-semibold backdrop-blur-sm">
        <motion.span
          animate={prefersReducedMotion ? {} : { scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          ✨
        </motion.span>
        Free & Open Source Forever
      </span>
    </motion.div>
  )
}

function HeroHeading() {
  return (
    <h1 className="font-bold tracking-tight">
      <motion.span 
        className="block text-foreground text-4xl sm:text-5xl md:text-6xl lg:text-7xl mb-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        Powerful Tools,
      </motion.span>
      <motion.span 
        className="inline-block bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 dark:from-purple-400 dark:via-blue-400 dark:to-cyan-400 text-4xl sm:text-5xl md:text-6xl lg:text-7xl relative"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        अस्त्र at Your Command
        <motion.div
          className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 dark:from-purple-400 dark:via-blue-400 dark:to-cyan-400 rounded-full"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.6, duration: 0.8, ease: "easeOut" }}
        />
      </motion.span>
    </h1>
  )
}

function HeroSubtitle() {
  return (
    <motion.p 
      className="mx-auto max-w-2xl text-muted-foreground text-lg sm:text-xl md:text-2xl font-medium px-4 leading-relaxed"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
    >
      Your all-in-one utility suite for developers and creators.
      <span className="block mt-3 text-foreground/80">
        Simple, powerful tools that run entirely in your browser.
      </span>
    </motion.p>
  )
}

function HeroValueProps() {
  return (
    <motion.div
      className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 text-sm sm:text-base text-muted-foreground"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.45 }}
    >
      <span className="flex items-center gap-2">
        <Shield className="h-5 w-5 text-primary" />
        100% Private
      </span>
      <span className="flex items-center gap-2">
        <Zap className="h-5 w-5 text-primary" />
        Lightning Fast
      </span>
      <span className="flex items-center gap-2">
        <Heart className="h-5 w-5 text-primary" />
        Always Free
      </span>
    </motion.div>
  )
}

function HeroCTA({ prefersReducedMotion }: { prefersReducedMotion: boolean | null }) {
  return (
    <motion.div 
      className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 pt-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
    >
      <Link href="/explore">
        <Button 
          size="lg" 
          className="text-base sm:text-lg px-10 sm:px-12 h-14 sm:h-16 min-h-touch group relative overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
        >
          <span className="relative z-10 flex items-center gap-2 font-semibold">
            Explore All Tools
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </span>
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary-foreground/10 to-primary/0"
            animate={prefersReducedMotion ? {} : { x: ["-100%", "100%"] }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          />
        </Button>
      </Link>
      <Link href="/games">
        <Button 
          size="lg" 
          variant="outline"
          className="text-base sm:text-lg px-10 sm:px-12 h-14 sm:h-16 min-h-touch group hover:bg-primary/5 transition-colors"
        >
          <span className="flex items-center gap-2 font-semibold">
            Try Games
            <motion.span
              animate={prefersReducedMotion ? {} : { rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              🎮
            </motion.span>
          </span>
        </Button>
      </Link>
    </motion.div>
  )
}

function KeyboardShortcutHint() {
  return (
    <motion.div
      className="flex flex-col items-center gap-3"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.6 }}
    >
      <p className="text-xs sm:text-sm text-muted-foreground flex items-center justify-center gap-2">
        <span className="font-medium">Quick access:</span>
        <kbd className="pointer-events-none select-none rounded-md border bg-muted px-2.5 py-1.5 font-mono text-[10px] sm:text-xs font-medium shadow-sm">⌘</kbd>
        <kbd className="pointer-events-none select-none rounded-md border bg-muted px-2.5 py-1.5 font-mono text-[10px] sm:text-xs font-medium shadow-sm">K</kbd>
      </p>
    </motion.div>
  )
}
