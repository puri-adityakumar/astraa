/**
 * Animations Showcase Component
 * Demonstrates all available animations in the system
 */

"use client";

import { motion } from "framer-motion";
import { Sparkles, Zap, Heart, Star } from "lucide-react";
import { AnimatedButton } from "@/components/ui/animated-button";
import { AnimatedCard } from "@/components/ui/animated-card";
import { AnimatedList, AnimatedListItem } from "@/components/ui/animated-list";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  HoverLift,
  HoverScale,
  HoverRotate,
  HoverShine,
  FloatEffect,
  BounceEffect,
} from "@/components/ui/hover-effects";
import { LoadingSpinner, LoadingInline } from "@/components/ui/loading-spinner";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import {
  Skeleton,
  SkeletonCard,
  SkeletonText,
  SkeletonAvatar,
  SkeletonButton,
} from "@/components/ui/skeleton";
import { useReducedMotion } from "@/lib/animations/hooks";
import { fadeIn, fadeInUp, scaleIn, rotateIn } from "@/lib/animations/variants";

export function AnimationsShowcase() {
  const shouldReduce = useReducedMotion();

  return (
    <div className="space-y-16">
      {/* Header */}
      <motion.div
        initial="hidden"
        animate="show"
        variants={fadeInUp}
        className="space-y-4 text-center"
      >
        <h1 className="text-4xl font-bold">Animation System Showcase</h1>
        <p className="mx-auto max-w-2xl text-muted-foreground">
          Explore all the animations and interactive elements available in the
          astraa design system.
          {shouldReduce && (
            <span className="mt-2 block text-sm">
              ⚠️ Reduced motion is enabled - animations are simplified or
              disabled
            </span>
          )}
        </p>
      </motion.div>

      {/* Entrance Animations */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold">Entrance Animations</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <motion.div initial="hidden" animate="show" variants={fadeIn}>
            <Card className="p-6 text-center">
              <Sparkles className="mx-auto mb-2 h-8 w-8 text-primary" />
              <h3 className="mb-1 font-semibold">Fade In</h3>
              <p className="text-sm text-muted-foreground">
                Simple opacity transition
              </p>
            </Card>
          </motion.div>

          <motion.div initial="hidden" animate="show" variants={fadeInUp}>
            <Card className="p-6 text-center">
              <Zap className="mx-auto mb-2 h-8 w-8 text-primary" />
              <h3 className="mb-1 font-semibold">Fade In Up</h3>
              <p className="text-sm text-muted-foreground">
                Fade with upward motion
              </p>
            </Card>
          </motion.div>

          <motion.div initial="hidden" animate="show" variants={scaleIn}>
            <Card className="p-6 text-center">
              <Heart className="mx-auto mb-2 h-8 w-8 text-primary" />
              <h3 className="mb-1 font-semibold">Scale In</h3>
              <p className="text-sm text-muted-foreground">
                Scale from small to normal
              </p>
            </Card>
          </motion.div>

          <motion.div initial="hidden" animate="show" variants={rotateIn}>
            <Card className="p-6 text-center">
              <Star className="mx-auto mb-2 h-8 w-8 text-primary" />
              <h3 className="mb-1 font-semibold">Rotate In</h3>
              <p className="text-sm text-muted-foreground">
                Rotate while fading in
              </p>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Scroll Reveal */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold">Scroll Reveal Animations</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <ScrollReveal direction="up">
            <Card className="p-6">
              <h3 className="mb-2 font-semibold">Reveal from Bottom</h3>
              <p className="text-sm text-muted-foreground">
                This card animates when scrolled into view from the bottom
              </p>
            </Card>
          </ScrollReveal>

          <ScrollReveal direction="left">
            <Card className="p-6">
              <h3 className="mb-2 font-semibold">Reveal from Right</h3>
              <p className="text-sm text-muted-foreground">
                This card slides in from the right side
              </p>
            </Card>
          </ScrollReveal>

          <ScrollReveal direction="scale">
            <Card className="p-6">
              <h3 className="mb-2 font-semibold">Scale Reveal</h3>
              <p className="text-sm text-muted-foreground">
                This card scales up when visible
              </p>
            </Card>
          </ScrollReveal>

          <ScrollReveal direction="fade">
            <Card className="p-6">
              <h3 className="mb-2 font-semibold">Fade Reveal</h3>
              <p className="text-sm text-muted-foreground">
                Simple fade in when scrolled into view
              </p>
            </Card>
          </ScrollReveal>
        </div>
      </section>

      {/* Animated Buttons */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold">Animated Buttons</h2>
        <div className="flex flex-wrap gap-4">
          <AnimatedButton effect="scale">Scale Effect</AnimatedButton>
          <AnimatedButton effect="lift">Lift Effect</AnimatedButton>
          <AnimatedButton effect="pulse">Pulse Effect</AnimatedButton>
          <AnimatedButton effect="shine">Shine Effect</AnimatedButton>
          <AnimatedButton effect="none" variant="outline">
            No Animation
          </AnimatedButton>
        </div>
      </section>

      {/* Animated Cards */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold">Animated Cards</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <AnimatedCard hoverEffect="lift">
            <div className="p-6">
              <h3 className="mb-2 font-semibold">Lift Effect</h3>
              <p className="text-sm text-muted-foreground">
                Hover to see the lift animation
              </p>
            </div>
          </AnimatedCard>

          <AnimatedCard hoverEffect="scale">
            <div className="p-6">
              <h3 className="mb-2 font-semibold">Scale Effect</h3>
              <p className="text-sm text-muted-foreground">
                Hover to see the scale animation
              </p>
            </div>
          </AnimatedCard>

          <AnimatedCard hoverEffect="glow">
            <div className="p-6">
              <h3 className="mb-2 font-semibold">Glow Effect</h3>
              <p className="text-sm text-muted-foreground">
                Hover to see the glow animation
              </p>
            </div>
          </AnimatedCard>

          <AnimatedCard hoverEffect="lift" hoverGradient>
            <div className="p-6">
              <h3 className="mb-2 font-semibold">Lift + Gradient</h3>
              <p className="text-sm text-muted-foreground">
                Combined effects on hover
              </p>
            </div>
          </AnimatedCard>
        </div>
      </section>

      {/* Hover Effects */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold">Hover Effects</h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          <HoverLift>
            <Card className="p-4 text-center">
              <p className="text-sm font-medium">Lift</p>
            </Card>
          </HoverLift>

          <HoverScale>
            <Card className="p-4 text-center">
              <p className="text-sm font-medium">Scale</p>
            </Card>
          </HoverScale>

          <HoverRotate degrees={10}>
            <Card className="p-4 text-center">
              <p className="text-sm font-medium">Rotate</p>
            </Card>
          </HoverRotate>

          <HoverShine>
            <Card className="p-4 text-center">
              <p className="text-sm font-medium">Shine</p>
            </Card>
          </HoverShine>

          <FloatEffect>
            <Card className="p-4 text-center">
              <p className="text-sm font-medium">Float</p>
            </Card>
          </FloatEffect>

          <BounceEffect>
            <Card className="p-4 text-center">
              <p className="text-sm font-medium">Bounce</p>
            </Card>
          </BounceEffect>
        </div>
      </section>

      {/* Loading States */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold">Loading States</h2>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Loading Spinners</h3>
          <div className="flex flex-wrap items-center gap-8">
            <div className="text-center">
              <LoadingSpinner variant="spinner" size="sm" />
              <p className="mt-2 text-xs text-muted-foreground">Spinner (sm)</p>
            </div>
            <div className="text-center">
              <LoadingSpinner variant="spinner" size="md" />
              <p className="mt-2 text-xs text-muted-foreground">Spinner (md)</p>
            </div>
            <div className="text-center">
              <LoadingSpinner variant="dots" size="md" />
              <p className="mt-2 text-xs text-muted-foreground">Dots</p>
            </div>
            <div className="text-center">
              <LoadingSpinner variant="pulse" size="md" />
              <p className="mt-2 text-xs text-muted-foreground">Pulse</p>
            </div>
            <div className="text-center">
              <LoadingSpinner variant="bars" size="md" />
              <p className="mt-2 text-xs text-muted-foreground">Bars</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Skeleton Screens</h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2">
              <p className="mb-2 text-sm font-medium">Text Skeleton</p>
              <SkeletonText lines={3} />
            </div>
            <div className="space-y-2">
              <p className="mb-2 text-sm font-medium">Avatar Skeleton</p>
              <div className="flex items-center gap-3">
                <SkeletonAvatar size="lg" />
                <div className="flex-1">
                  <Skeleton className="mb-2 h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <p className="mb-2 text-sm font-medium">Button Skeleton</p>
              <div className="flex gap-2">
                <SkeletonButton size="default" />
                <SkeletonButton size="default" />
              </div>
            </div>
          </div>
          <div>
            <p className="mb-2 text-sm font-medium">Card Skeleton</p>
            <SkeletonCard />
          </div>
        </div>
      </section>

      {/* Animated Lists */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold">Animated Lists</h2>
        <AnimatedList>
          {[1, 2, 3, 4, 5].map((item) => (
            <AnimatedListItem key={item}>
              <Card className="mb-2 p-4">
                <div className="flex items-center gap-3">
                  <Badge>{item}</Badge>
                  <p className="text-sm">List item with staggered animation</p>
                </div>
              </Card>
            </AnimatedListItem>
          ))}
        </AnimatedList>
      </section>

      {/* Interactive Feedback */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold">Interactive Feedback</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Card className="p-6">
            <h3 className="mb-4 font-semibold">Button States</h3>
            <div className="space-y-3">
              <Button className="w-full">Default Button</Button>
              <Button variant="outline" className="w-full">
                Outline Button
              </Button>
              <Button variant="ghost" className="w-full">
                Ghost Button
              </Button>
              <Button disabled className="w-full">
                Disabled Button
              </Button>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="mb-4 font-semibold">Loading States</h3>
            <div className="space-y-3">
              <LoadingInline message="Processing..." />
              <LoadingInline message="Saving changes..." />
              <LoadingInline message="Loading data..." />
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}
