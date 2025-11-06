"use client"

import { motion, useReducedMotion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Link from "next/link"
import { ActivityFeed } from "@/components/activity-feed"
import { ArrowRight, Code2, Heart, Sparkles, Zap, Lightbulb, Users, Shield, Rocket, Star } from "lucide-react"

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1
    }
  }
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { 
    opacity: 1, 
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15
    }
  }
}

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

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  show: { 
    opacity: 1, 
    scale: 1,
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1]
    }
  }
}

const features = [
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "All tools run directly in your browser - no server delays, no waiting",
    gradient: "from-yellow-400 to-orange-500"
  },
  {
    icon: Heart,
    title: "Free Forever",
    description: "Every tool is completely free to use, no hidden costs or premium features",
    gradient: "from-pink-400 to-rose-500"
  },
  {
    icon: Shield,
    title: "Privacy First",
    description: "Your data never leaves your browser. No tracking, no analytics, just pure functionality",
    gradient: "from-blue-400 to-cyan-500"
  },
  {
    icon: Code2,
    title: "Open Source",
    description: "Built in the open, contributions welcome from everyone",
    gradient: "from-green-400 to-emerald-500"
  }
]

const stats = [
  {
    value: "12+",
    label: "Tools Available",
    icon: Rocket
  },
  {
    value: "100%",
    label: "Free & Open",
    icon: Heart
  },
  {
    value: "0ms",
    label: "Server Latency",
    icon: Zap
  },
  {
    value: "∞",
    label: "Usage Limit",
    icon: Star
  }
]

export default function Home() {
  const prefersReducedMotion = useReducedMotion()
  
  return (
    <div className="space-y-20 sm:space-y-28 lg:space-y-36">
      {/* Hero Section */}
      <section className="relative overflow-hidden min-h-[85vh] flex items-center">
        <motion.div
          className="text-center space-y-8 sm:space-y-10 lg:space-y-12 max-w-6xl mx-auto w-full px-4"
          initial="hidden"
          animate="show"
          variants={fadeInUp}
        >
          {/* Enhanced floating decorative elements */}
          <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
            <motion.div
              className="absolute top-20 left-10 w-72 h-72 sm:w-96 sm:h-96 bg-primary/10 rounded-full blur-3xl"
              animate={prefersReducedMotion ? {} : {
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.5, 0.3],
                x: [0, 30, 0],
                y: [0, -20, 0],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            <motion.div
              className="absolute top-40 right-10 w-96 h-96 sm:w-[500px] sm:h-[500px] bg-secondary/10 rounded-full blur-3xl"
              animate={prefersReducedMotion ? {} : {
                scale: [1, 1.3, 1],
                opacity: [0.2, 0.4, 0.2],
                x: [0, -30, 0],
                y: [0, 20, 0],
              }}
              transition={{
                duration: 10,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1
              }}
            />
            <motion.div
              className="absolute bottom-20 left-1/2 -translate-x-1/2 w-80 h-80 sm:w-96 sm:h-96 bg-accent/10 rounded-full blur-3xl"
              animate={prefersReducedMotion ? {} : {
                scale: [1, 1.15, 1],
                opacity: [0.2, 0.35, 0.2],
              }}
              transition={{
                duration: 9,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 2
              }}
            />
          </div>

          <div className="relative">
            {/* Enhanced sparkle decorations */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
              className="absolute -top-8 sm:-top-12 left-1/4 text-primary"
            >
              <motion.div
                animate={prefersReducedMotion ? {} : {
                  rotate: [0, 360],
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
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
                animate={prefersReducedMotion ? {} : {
                  rotate: [0, -360],
                  scale: [1, 1.3, 1],
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.5
                }}
              >
                <Sparkles className="h-5 w-5 sm:h-7 sm:w-7" />
              </motion.div>
            </motion.div>

            <motion.div
              variants={fadeInUp}
              className="space-y-6 sm:space-y-8 lg:space-y-10"
            >
              {/* Badge */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
                className="inline-block"
              >
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 border border-primary/20 text-primary text-sm font-semibold backdrop-blur-sm">
                  <motion.span
                    animate={prefersReducedMotion ? {} : {
                      scale: [1, 1.2, 1],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    ✨
                  </motion.span>
                  Free & Open Source Forever
                </span>
              </motion.div>

              <h1 className="font-bold tracking-tighter">
                <motion.span 
                  className="block text-foreground text-fluid-4xl sm:text-fluid-5xl mb-3 sm:mb-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  Powerful Tools,
                </motion.span>
                <motion.span 
                  className="inline-block bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 dark:bg-gradient-to-r dark:from-purple-400 dark:via-blue-400 dark:to-cyan-400 text-fluid-4xl sm:text-fluid-5xl relative"
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
              
              <motion.p 
                className="mx-auto max-w-[750px] text-muted-foreground text-fluid-lg sm:text-fluid-xl font-medium px-4 leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                Your all-in-one utility suite for developers and creators. 
                <span className="block mt-2 text-foreground/80 font-semibold">
                  Simple, powerful tools that run entirely in your browser.
                </span>
              </motion.p>

              {/* Value propositions */}
              <motion.div
                className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-sm sm:text-base text-muted-foreground"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 }}
              >
                <span className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-primary" />
                  100% Private
                </span>
                <span className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-primary" />
                  Lightning Fast
                </span>
                <span className="flex items-center gap-2">
                  <Heart className="h-4 w-4 text-primary" />
                  Always Free
                </span>
              </motion.div>
            </motion.div>
          </div>

          <motion.div 
            className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 pt-6 sm:pt-8"
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
                  animate={prefersReducedMotion ? {} : {
                    x: ["-100%", "100%"],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "linear"
                  }}
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
                    animate={prefersReducedMotion ? {} : {
                      rotate: [0, 10, -10, 0],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    🎮
                  </motion.span>
                </span>
              </Button>
            </Link>
          </motion.div>

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
            <motion.div
              animate={prefersReducedMotion ? {} : {
                y: [0, 8, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="text-muted-foreground/50"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* Stats Section */}
      <motion.section
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-100px" }}
        variants={container}
        className="px-4 relative"
      >
        {/* Background decoration */}
        <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-4xl">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-secondary/5 to-accent/5 rounded-full blur-3xl" />
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 max-w-6xl mx-auto">
          {stats.map((stat, index) => (
            <motion.div key={index} variants={item}>
              <Card className="p-6 sm:p-8 lg:p-10 glass glass-hover text-center h-full group relative overflow-hidden border-2">
                {/* Hover gradient effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-br from-primary/5 via-secondary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                />
                
                <div className="relative z-10">
                  <motion.div
                    className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 mb-5 group-hover:scale-110 transition-transform duration-300 shadow-lg"
                    whileHover={prefersReducedMotion ? {} : { rotate: 360 }}
                    transition={{ duration: 0.6 }}
                  >
                    <stat.icon className="h-7 w-7 sm:h-8 sm:w-8 text-primary" />
                  </motion.div>
                  <motion.p 
                    className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-br from-foreground via-primary to-foreground/70"
                    initial={{ scale: 0.5, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 + 0.2, type: "spring" }}
                  >
                    {stat.value}
                  </motion.p>
                  <p className="text-sm sm:text-base font-semibold text-muted-foreground group-hover:text-foreground transition-colors">
                    {stat.label}
                  </p>
                </div>

                {/* Corner accent */}
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-primary/10 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Features Section */}
      <motion.section
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-100px" }}
        variants={container}
        className="space-y-12 sm:space-y-16 relative"
      >
        {/* Background decoration */}
        <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />
        </div>

        <motion.div variants={fadeInUp} className="text-center px-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-block mb-6"
          >
            <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 border border-primary/20 text-primary text-sm font-semibold backdrop-blur-sm shadow-sm">
              <Sparkles className="h-4 w-4" />
              Why Choose astraa?
            </span>
          </motion.div>
          <h2 className="text-fluid-3xl sm:text-fluid-4xl font-bold mb-6 sm:mb-8 bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
            Built for Speed, Privacy & Simplicity
          </h2>
          <p className="text-muted-foreground max-w-3xl mx-auto text-fluid-base sm:text-fluid-lg leading-relaxed">
            Crafted with attention to detail and focused on delivering the best possible experience.
            <span className="block mt-2 text-foreground/70 font-medium">
              Every feature designed with you in mind.
            </span>
          </p>
        </motion.div>

        <div className="grid gap-6 sm:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 px-4 max-w-7xl mx-auto">
          {features.map((feature, index) => (
            <motion.div 
              key={index} 
              variants={item}
              whileHover={prefersReducedMotion ? {} : { y: -12, scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <Card className="p-7 sm:p-9 glass glass-hover h-full group relative overflow-hidden border-2 shadow-lg hover:shadow-2xl transition-shadow duration-300">
                {/* Gradient background on hover */}
                <motion.div
                  className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}
                />
                
                {/* Animated border gradient */}
                <motion.div
                  className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500`}
                />
                
                <div className="relative z-10">
                  <motion.div
                    className={`inline-flex items-center justify-center w-16 h-16 sm:w-18 sm:h-18 rounded-2xl bg-gradient-to-br ${feature.gradient} mb-6 sm:mb-7 shadow-lg group-hover:shadow-2xl transition-all duration-300`}
                    whileHover={prefersReducedMotion ? {} : { 
                      rotate: [0, -10, 10, -10, 0],
                      scale: 1.1
                    }}
                    transition={{ duration: 0.5 }}
                  >
                    <feature.icon className="h-8 w-8 sm:h-9 sm:w-9 text-white" />
                  </motion.div>
                  <h3 className="text-xl sm:text-2xl font-bold mb-4 group-hover:text-primary transition-colors duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground text-sm sm:text-base leading-relaxed group-hover:text-foreground/80 transition-colors duration-300">
                    {feature.description}
                  </p>
                </div>

                {/* Corner decoration */}
                <div className={`absolute -bottom-8 -right-8 w-32 h-32 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 rounded-full blur-2xl transition-opacity duration-500`} />
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* How It Works Section */}
      <motion.section
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-100px" }}
        variants={container}
        className="px-4 relative"
      >
        {/* Background decoration */}
        <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-5xl">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-secondary/5 rounded-full blur-3xl" />
          </div>
        </div>

        <div className="max-w-6xl mx-auto">
          <motion.div variants={fadeInUp} className="text-center mb-14 sm:mb-20">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="inline-block mb-6"
            >
              <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 border border-primary/20 text-primary text-sm font-semibold backdrop-blur-sm shadow-sm">
                <Lightbulb className="h-4 w-4" />
                How It Works
              </span>
            </motion.div>
            <h2 className="text-fluid-3xl sm:text-fluid-4xl font-bold mb-6 sm:mb-8 bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
              Simple. Powerful. Private.
            </h2>
            <p className="text-muted-foreground max-w-3xl mx-auto text-fluid-base sm:text-fluid-lg leading-relaxed">
              Everything runs in your browser. No servers, no tracking, no compromises.
              <span className="block mt-2 text-foreground/70 font-medium">
                Get started in seconds, no setup required.
              </span>
            </p>
          </motion.div>

          <div className="grid gap-8 sm:gap-12 lg:gap-16 grid-cols-1 lg:grid-cols-3">
            {[
              {
                step: "01",
                title: "Choose Your Tool",
                description: "Browse our collection of carefully crafted utilities. From text manipulation to image processing, we've got you covered.",
                icon: Rocket,
                gradient: "from-emerald-500 to-green-500"
              },
              {
                step: "02",
                title: "Work Instantly",
                description: "No sign-ups, no installations. Start using any tool immediately with zero friction and maximum speed.",
                icon: Zap,
                gradient: "from-blue-500 to-cyan-500"
              },
              {
                step: "03",
                title: "Stay Private",
                description: "Your data never leaves your device. Everything processes locally in your browser for complete privacy.",
                icon: Shield,
                gradient: "from-purple-500 to-pink-500"
              }
            ].map((step, index) => (
              <motion.div
                key={index}
                variants={item}
                className="relative"
                whileHover={prefersReducedMotion ? {} : { y: -8 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Card className="p-9 sm:p-12 glass glass-hover h-full group relative overflow-hidden border-2 shadow-lg hover:shadow-2xl transition-all duration-300">
                  {/* Background gradient */}
                  <motion.div
                    className={`absolute inset-0 bg-gradient-to-br ${step.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}
                  />

                  <div className="flex flex-col items-center text-center relative z-10">
                    <motion.div
                      className="text-7xl sm:text-8xl font-bold text-primary/10 mb-6 group-hover:text-primary/20 transition-colors duration-300 absolute -top-4 left-1/2 -translate-x-1/2"
                      initial={{ scale: 0.5, opacity: 0 }}
                      whileInView={{ scale: 1, opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                    >
                      {step.step}
                    </motion.div>
                    
                    <div className="mt-16 sm:mt-20">
                      <motion.div
                        className={`inline-flex items-center justify-center w-18 h-18 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br ${step.gradient} mb-7 shadow-xl group-hover:shadow-2xl transition-all duration-300`}
                        whileHover={prefersReducedMotion ? {} : { 
                          rotate: 360,
                          scale: 1.1
                        }}
                        transition={{ duration: 0.6 }}
                      >
                        <step.icon className="h-9 w-9 sm:h-10 sm:w-10 text-white" />
                      </motion.div>
                      <h3 className="text-xl sm:text-2xl font-bold mb-5 group-hover:text-primary transition-colors duration-300">
                        {step.title}
                      </h3>
                      <p className="text-muted-foreground text-sm sm:text-base leading-relaxed group-hover:text-foreground/80 transition-colors duration-300">
                        {step.description}
                      </p>
                    </div>
                  </div>

                  {/* Corner decoration */}
                  <div className={`absolute -bottom-10 -right-10 w-40 h-40 bg-gradient-to-br ${step.gradient} opacity-0 group-hover:opacity-10 rounded-full blur-2xl transition-opacity duration-500`} />
                </Card>
                
                {/* Enhanced connecting line for desktop */}
                {index < 2 && (
                  <motion.div 
                    className="hidden lg:block absolute top-1/2 -right-8 xl:-right-12 w-16 xl:w-24 h-1 rounded-full overflow-hidden"
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.2 + 0.5, duration: 0.6 }}
                  >
                    <div className={`h-full bg-gradient-to-r ${step.gradient} opacity-30`} />
                    <motion.div
                      className={`absolute inset-0 bg-gradient-to-r ${step.gradient}`}
                      animate={prefersReducedMotion ? {} : {
                        x: ["-100%", "100%"],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "linear",
                        delay: index * 0.3
                      }}
                    />
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Live Activity Feed */}
      <motion.section
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-100px" }}
        variants={container}
        className="space-y-12 sm:space-y-16 relative"
      >
        {/* Background decoration */}
        <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-4xl">
            <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 via-emerald-500/5 to-teal-500/5 rounded-full blur-3xl" />
          </div>
        </div>

        <motion.div variants={fadeInUp} className="text-center px-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-block mb-6"
          >
            <span className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400 text-sm font-semibold backdrop-blur-sm shadow-sm">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
              </span>
              Live Activity
            </span>
          </motion.div>
          <h2 className="text-fluid-3xl sm:text-fluid-4xl font-bold mb-6 sm:mb-8 bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
            See What's Happening
          </h2>
          <p className="text-muted-foreground max-w-3xl mx-auto text-fluid-base sm:text-fluid-lg leading-relaxed">
            Real-time activity from users around the world.
            <span className="block mt-2 text-foreground/70 font-medium">
              Join thousands of people using astraa every day.
            </span>
          </p>
        </motion.div>

        <motion.div variants={scaleIn} className="px-4">
          <div className="relative">
            {/* Glow effect around activity feed */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-secondary/5 to-accent/5 rounded-2xl blur-xl" />
            <div className="relative">
              <ActivityFeed />
            </div>
          </div>
        </motion.div>
      </motion.section>

      {/* Contribute Section */}
      <motion.section
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-100px" }}
        variants={container}
        className="px-4"
      >
        <motion.div variants={scaleIn}>
          <Card className="relative overflow-hidden glass max-w-5xl mx-auto border-2 shadow-2xl">
            {/* Enhanced background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10" />
            
            {/* Animated decorative circles */}
            <motion.div 
              className="absolute -top-24 -right-24 w-64 h-64 bg-primary/20 rounded-full blur-3xl"
              animate={prefersReducedMotion ? {} : {
                scale: [1, 1.2, 1],
                opacity: [0.2, 0.3, 0.2],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            <motion.div 
              className="absolute -bottom-24 -left-24 w-64 h-64 bg-secondary/20 rounded-full blur-3xl"
              animate={prefersReducedMotion ? {} : {
                scale: [1, 1.3, 1],
                opacity: [0.2, 0.3, 0.2],
              }}
              transition={{
                duration: 10,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1
              }}
            />
            
            <div className="relative z-10 p-10 sm:p-14 lg:p-20">
              <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-14">
                <motion.div
                  className="flex-shrink-0"
                  whileHover={prefersReducedMotion ? {} : { scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="relative">
                    <motion.div 
                      className="absolute inset-0 bg-gradient-to-br from-primary to-secondary rounded-3xl blur-2xl opacity-60"
                      animate={prefersReducedMotion ? {} : {
                        scale: [1, 1.1, 1],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    />
                    <div className="relative w-28 h-28 sm:w-36 sm:h-36 bg-gradient-to-br from-primary via-secondary to-accent rounded-3xl flex items-center justify-center shadow-2xl">
                      <Users className="h-14 w-14 sm:h-18 sm:w-18 text-white" />
                    </div>
                  </div>
                </motion.div>
                
                <div className="flex-1 text-center lg:text-left">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 }}
                  >
                    <h2 className="text-fluid-3xl sm:text-fluid-4xl font-bold mb-5 sm:mb-7 bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
                      Join Our Community
                    </h2>
                    <p className="text-muted-foreground text-fluid-base sm:text-fluid-lg mb-8 sm:mb-10 max-w-2xl leading-relaxed">
                      Whether you're fixing bugs, adding features, or improving documentation - every contribution matters. 
                      <span className="block mt-2 text-foreground/80 font-medium">
                        Help us build something amazing together.
                      </span>
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                      <Button asChild size="lg" className="min-h-touch group shadow-lg hover:shadow-xl transition-shadow">
                        <Link href="/contribute" className="gap-2 font-semibold">
                          Start Contributing
                          <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                        </Link>
                      </Button>
                      <Button asChild size="lg" variant="outline" className="min-h-touch group hover:bg-primary/5 transition-colors">
                        <Link href="https://github.com" target="_blank" rel="noopener noreferrer" className="gap-2 font-semibold">
                          <Code2 className="h-5 w-5 group-hover:rotate-12 transition-transform" />
                          View on GitHub
                        </Link>
                      </Button>
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>

            {/* Corner accents */}
            <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-primary/20 to-transparent rounded-br-full" />
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-tl from-secondary/20 to-transparent rounded-tl-full" />
          </Card>
        </motion.div>
      </motion.section>
    </div>
  )
}