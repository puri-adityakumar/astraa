"use client"

import Link from "next/link"
import { motion } from "framer-motion"

import { useReducedMotion } from "@/lib/animations/hooks"
import { StatsBar } from "./stats-bar"

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  },
};

const stagger = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

function openPalette() {
  const isMac =
    typeof navigator !== "undefined" &&
    navigator.platform.toUpperCase().indexOf("MAC") >= 0;
  document.dispatchEvent(
    new KeyboardEvent("keydown", {
      key: "k",
      metaKey: isMac,
      ctrlKey: !isMac,
      bubbles: true,
    }),
  );
}

// system.css .btn — shared base; primary/ghost modifiers applied per-button.
const BTN_BASE =
  "inline-flex items-center justify-center gap-2 h-11 px-[22px] rounded-full " +
  "font-sans text-[14px] font-medium tracking-[-0.01em] border border-transparent " +
  "transition-[transform,background-color,border-color,box-shadow] duration-200";
const BTN_GHOST =
  "bg-transparent text-foreground border-[color:var(--hairline-strong)] hover:bg-card";

export function HeroSection() {
  const shouldReduce = useReducedMotion();

  const containerProps = shouldReduce
    ? {}
    : { variants: stagger, initial: "hidden" as const, animate: "show" as const };
  const itemProps = shouldReduce ? {} : { variants: fadeInUp };

  return (
    <section className="relative overflow-hidden">
      <span
        aria-hidden="true"
        className="absolute left-1/2 -top-[200px] -translate-x-1/2 w-[920px] max-w-[130%] h-[640px] blur-[8px] pointer-events-none z-0"
        style={{ background: "var(--glow)" }}
      />
      <span
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none z-0"
        style={{ background: "var(--vignette)" }}
      />

      <div className="container max-w-[1080px] mx-auto px-7">
        <motion.div
          className="relative z-[1] text-center max-w-[920px] mx-auto py-[clamp(60px,9.5vw,104px)]"
          {...containerProps}
        >
          <motion.span
            className="inline-flex items-center gap-[9px] font-mono text-[11px] font-medium tracking-[0.2em] uppercase text-muted-foreground"
            {...itemProps}
          >
            <span
              aria-hidden="true"
              className="inline-block w-[18px] h-px bg-foreground opacity-55"
            />
            CLIENT-SIDE TOOLKIT
          </motion.span>

          <motion.h1
            className="mt-6 font-sans font-medium text-[length:clamp(40px,6.8vw,84px)] leading-[1.04] tracking-[-0.03em] text-foreground"
            {...itemProps}
          >
            Stop searching.
            <br />
            Start solving.
            <br />
            <span className="font-deva font-medium tracking-[-0.01em] text-muted-foreground">
              अस्त्र
            </span>{" "}
            at your command.
          </motion.h1>

          <motion.p
            className="mt-6 mx-auto max-w-[560px] text-[length:clamp(15px,1.5vw,17px)] leading-[1.55] tracking-[-0.01em] text-[hsl(var(--text-2))]"
            {...itemProps}
          >
            A fast collection of utilities that run entirely in your browser — no
            servers, no accounts, no tracking.
          </motion.p>

          <motion.div
            className="mt-9 flex flex-wrap items-center justify-center gap-3"
            {...itemProps}
          >
            <Link
              href="/explore"
              className={`${BTN_BASE} bg-primary text-primary-foreground shadow-[var(--btn-shadow)] motion-safe:hover:-translate-y-px`}
            >
              Explore tools →
            </Link>
            <Link href="/games" className={`${BTN_BASE} ${BTN_GHOST}`}>
              Browse games
            </Link>
            <button
              type="button"
              onClick={openPalette}
              aria-label="Open search command palette"
              className={`${BTN_BASE} ${BTN_GHOST}`}
            >
              Search ⌘K
            </button>
          </motion.div>

          <StatsBar />
        </motion.div>
      </div>
    </section>
  );
}
