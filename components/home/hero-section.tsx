"use client";

import { useEffect, useState } from "react";
import { HiArrowRight } from "react-icons/hi2";
import { motion } from "framer-motion";
import Link from "next/link";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { StatsBar } from "./stats-bar";

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

export function HeroSection() {
  const [isMac, setIsMac] = useState(false);

  useEffect(() => {
    setIsMac(navigator.platform.toUpperCase().indexOf("MAC") >= 0);
  }, []);

  return (
    <section className="relative -my-6 flex flex-1 items-center justify-center sm:-my-8 lg:-my-12">
      <motion.div
        className="relative z-10 mx-auto max-w-3xl px-4 text-center"
        initial="hidden"
        animate="show"
        variants={{
          hidden: {},
          show: {
            transition: {
              staggerChildren: 0.1,
            },
          },
        }}
      >
        {/* Main Heading */}
        <motion.h1
          variants={fadeInUp}
          className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl"
        >
          <span className="text-foreground">Stop Searching, Start Solving</span>
          <br />
          <span className="bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 bg-clip-text text-transparent dark:from-purple-400 dark:via-blue-400 dark:to-cyan-400">
            अस्त्र at your command
          </span>
        </motion.h1>

        {/* Tagline */}
        <motion.p
          variants={fadeInUp}
          className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground sm:text-xl"
        >
          Your all-in-one utility suite. A{" "}
          <span className="font-medium text-foreground">vast collection</span>{" "}
          of powerful tools{" "}
          <span className="font-medium text-foreground">
            compiled in one place
          </span>
          ,{" "}
          <span className="font-medium text-foreground">
            running entirely in your browser.
          </span>
        </motion.p>

        {/* CTA Button */}
        <motion.div variants={fadeInUp} className="mt-10 flex justify-center">
          <Link href="/explore">
            <ShimmerButton
              className="shadow-2xl"
              shimmerSize="0.1em"
              borderRadius="100px"
              shimmerDuration="2s"
            >
              <span className="flex items-center gap-2 px-4 py-1 text-base font-medium">
                Explore
                <HiArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
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
          <kbd className="rounded border bg-muted px-2 py-0.5 font-mono text-xs font-medium">
            K
          </kbd>{" "}
          for quick access
        </motion.p>

        {/* Stats */}
        <motion.div variants={fadeInUp} className="mt-6">
          <StatsBar />
        </motion.div>
      </motion.div>
    </section>
  );
}
