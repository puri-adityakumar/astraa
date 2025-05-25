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
import { ArrowRight, Code2, Heart, Sparkles, Zap, Lightbulb, Users } from "lucide-react"

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
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "All tools run directly in your browser - no server delays, no waiting"
  },
  {
    icon: Heart,
    title: "Free Forever",
    description: "Every tool is completely free to use, no hidden costs or premium features"
  },
  {
    icon: Code2,
    title: "Open Source",
    description: "Built in the open, contributions welcome from everyone"
  },
  {
    icon: Lightbulb,
    title: "Smart Defaults",
    description: "Thoughtfully designed with sensible defaults for quick results"
  }
]

const philosophy = [
  {
    title: "Built for Everyone",
    description: "Whether you're a developer, designer, or content creator, our tools are designed to be intuitive and accessible"
  },
  {
    title: "Privacy First",
    description: "Your data never leaves your browser. No tracking, no analytics, just pure functionality"
  },
  {
    title: "Community Driven",
    description: "Shaped by real user feedback and needs, not corporate interests"
  }
]

export default function Home() {
  return (
    <div className="space-y-32">
      {/* Hero Section */}
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
              Explore All Tools
            </Button>
          </Link>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Press <kbd className="pointer-events-none select-none rounded border bg-muted px-1.5 font-mono text-[10px] font-medium">⌘</kbd> <kbd className="pointer-events-none select-none rounded border bg-muted px-1.5 font-mono text-[10px] font-medium">K</kbd> to discover
          </p>
        </div>
      </motion.div>

      {/* Features Section */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-12"
      >
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">Why Choose astraa?</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Crafted with attention to detail and focused on delivering the best possible experience
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <motion.div key={index} variants={item}>
              <Card className="p-6 glass glass-hover">
                <feature.icon className="h-8 w-8 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Philosophy Section */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-12"
      >
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">Our Philosophy</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            The principles that guide everything we build
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {philosophy.map((item, index) => (
            <motion.div key={index} variants={item}>
              <Card className="p-8 glass glass-hover text-center">
                <h3 className="text-xl font-semibold mb-4">{item.title}</h3>
                <p className="text-muted-foreground">{item.description}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Contribute Section */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="text-center space-y-8"
      >
        <div className="space-y-4">
          <h2 className="text-3xl font-bold">Want to Contribute?</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Join our community of developers and help make astraa even better
          </p>
        </div>

        <Card className="p-8 glass max-w-2xl mx-auto">
          <div className="flex items-center justify-center gap-8">
            <Users className="h-12 w-12 text-primary" />
            <div className="text-left">
              <h3 className="text-xl font-semibold mb-2">Open Source Community</h3>
              <p className="text-muted-foreground mb-4">
                Whether you're fixing bugs, adding features, or improving documentation - every contribution matters
              </p>
              <Button asChild>
                <Link href="/contribute" className="gap-2">
                  Get Started
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  )