"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Link from "next/link"
import { CommandMenu } from "@/components/command-menu"
import { tools } from "@/lib/tools"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { ArrowRight, Sparkles } from "lucide-react"

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
}

const features = [
  "All-in-one toolkit with essential utilities for everyone",
  "Modern, minimalist interface designed for simplicity",
  "Keyboard-first navigation with command palette",
  "Fully responsive and accessible across all devices",
  "Open-source and community-driven development",
  "Regular updates and new features based on user feedback",
  "No sign-up required - just open and start using",
  "Offline-capable for reliable access anywhere"
]

export default function Home() {
  return (
    <div className="space-y-32">
      <motion.div 
        className="text-center space-y-8 max-w-4xl mx-auto pt-20"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="relative inline-block">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="absolute -top-8 -right-8 text-primary"
          >
            <Sparkles className="h-6 w-6 animate-pulse" />
          </motion.div>
          <div className="space-y-6">
            <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
              <span className="block text-foreground">Powerful Tools</span>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-green-300 via-green-400 to-green-500 dark:bg-gradient-to-r dark:from-purple-500 dark:via-blue-500 dark:to-purple-500">
                अस्त्र at Your Command
              </span>
            </h1>
            <h2 className="mx-auto max-w-[700px] text-gray-600 dark:text-gray-300 text-lg sm:text-xl">
              Your all-in-one utility suite for everyone. Simple, powerful tools designed to make your life easier.
            </h2>
          </div>
        </div>
        
        <div className="flex flex-col items-center gap-4">
          <Link href="/explore">
            <Button size="lg" className="text-lg px-8">
              Explore All
            </Button>
          </Link>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Press <kbd className="pointer-events-none select-none rounded border bg-muted px-1.5 font-mono text-[10px] font-medium">⌘</kbd> <kbd className="pointer-events-none select-none rounded border bg-muted px-1.5 font-mono text-[10px] font-medium">K</kbd> to discover
          </p>
        </div>
      </motion.div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid gap-6 md:grid-cols-2 lg:grid-cols-4"
      >
        {features.map((feature, index) => (
          <motion.div key={index} variants={item}>
            <Card className="p-6 glass glass-hover">
              <p className="text-foreground">{feature}</p>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </div>
  )
}