"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { CornerMarkers } from "@/components/ui/corner-marker";
import { useReducedMotion } from "@/lib/animations/hooks";

const fadeInUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const } },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};

const FACTS = [
  { label: "STACK", value: "Next.js · React · TypeScript" },
  { label: "PRIVACY", value: "100% local · 0 trackers" },
  { label: "LICENSE", value: "MIT · open source" },
  { label: "TOOLS", value: "12 and counting" },
] as const;

export function AboutClient() {
  const shouldReduce = useReducedMotion();

  const containerProps = shouldReduce
    ? {}
    : { variants: stagger, initial: "hidden" as const, animate: "show" as const };
  const itemProps = shouldReduce ? {} : { variants: fadeInUp };

  return (
    <section className="py-[clamp(44px,7vw,84px)] relative">
      <div className="w-full max-w-[1080px] mx-auto px-7">
        {/* narrow reading column — max-w 720px per system.css .measure */}
        <motion.div className="max-w-[720px]" {...containerProps}>
          {/* Eyebrow */}
          <motion.span
            className={[
              "inline-flex items-center gap-[9px]",
              "font-mono text-[11px] font-medium tracking-[0.2em] uppercase",
              "text-muted-foreground",
            ].join(" ")}
            {...itemProps}
          >
            <span
              className="inline-block w-[18px] h-px bg-foreground"
              style={{ opacity: 0.55 }}
              aria-hidden="true"
            />
            ABOUT
          </motion.span>

          {/* Headline */}
          <motion.h1
            className="mt-4 text-[clamp(32px,5vw,44px)] font-extrabold tracking-[-0.035em] leading-[1.02]"
            {...itemProps}
          >
            Built for speed, privacy, and craft.
          </motion.h1>

          {/* Lead paragraph */}
          <motion.p
            className="mt-5 text-[clamp(15px,1.4vw,17px)] text-[hsl(var(--text-2))] tracking-[-0.01em] leading-[1.6] max-w-[60ch]"
            {...itemProps}
          >
            astraa is a fast, local-first collection of browser utilities. No servers,
            no sign-ups, no accounts — every tool runs entirely on your machine, and
            nothing you type or paste ever leaves it.
          </motion.p>

          {/* Body paragraphs */}
          <motion.p
            className="mt-[18px] text-[hsl(var(--text-2))] text-[15px] leading-[1.65] max-w-[64ch]"
            {...itemProps}
          >
            <strong className="text-foreground font-semibold">Privacy is the foundation.</strong>
            {" "}Every tool is client-side by design. There is no backend to send your data to,
            no analytics watching what you do, and no request that quietly carries your input
            off the page. What you paste in stays in your browser, where it belongs.
          </motion.p>

          <motion.p
            className="mt-[18px] text-[hsl(var(--text-2))] text-[15px] leading-[1.65] max-w-[64ch]"
            {...itemProps}
          >
            <strong className="text-foreground font-semibold">The design is deliberate.</strong>
            {" "}astraa is monochrome and minimal on purpose — premium restraint over decoration.
            No gradients competing for attention, no noise, no clutter. Just the work,
            presented clearly, so the tool gets out of your way.
          </motion.p>

          <motion.p
            className="mt-[18px] text-[hsl(var(--text-2))] text-[15px] leading-[1.65] max-w-[64ch]"
            {...itemProps}
          >
            <strong className="text-foreground font-semibold">The name has intent.</strong>
            {" "}
            <span className="font-deva text-muted-foreground">अस्त्र</span>
            {" "}(astra) is Sanskrit for a weapon or instrument —
            a tool wielded with purpose, never idly. Each utility here is meant to be exactly
            that: precise, ready, and answerable only to you.{" "}
            <span className="font-deva text-muted-foreground">अस्त्र</span> at your command.
          </motion.p>

          <motion.p
            className="mt-[18px] text-[hsl(var(--text-2))] text-[15px] leading-[1.65] max-w-[64ch]"
            {...itemProps}
          >
            <strong className="text-foreground font-semibold">Built on solid ground.</strong>
            {" "}astraa is made with Next.js and React, runs entirely in the browser, and is
            open source — free to read, fork, and trust.
          </motion.p>

          {/* Facts panel — TCard style with CornerMarkers */}
          <motion.div
            className={[
              "relative mt-[42px]",
              "bg-[hsl(var(--card))] border border-[color:var(--hairline)] rounded-[var(--radius)]",
              "px-5 py-0",
            ].join(" ")}
            {...itemProps}
          >
            <CornerMarkers />
            {FACTS.map((fact, i) => (
              <div
                key={fact.label}
                className={[
                  "flex items-center justify-between gap-3",
                  "py-4 px-0",
                  i < FACTS.length - 1
                    ? "border-b border-[color:var(--hairline-faint)]"
                    : "",
                ].join(" ")}
              >
                <span className="font-mono text-[11px] tracking-[0.14em] uppercase text-muted-foreground">
                  {fact.label}
                </span>
                <span className="text-foreground text-[14px] tracking-[-0.005em] text-right">
                  {fact.value}
                </span>
              </div>
            ))}
          </motion.div>

          {/* CTAs */}
          <motion.div
            className="mt-[38px] flex flex-wrap items-center gap-3"
            {...itemProps}
          >
            <Link
              href="/tools"
              className={[
                "inline-flex items-center justify-center gap-2",
                "h-11 px-[18px] rounded-[9px]",
                "font-sans text-[14px] font-medium tracking-[-0.01em]",
                "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]",
                "shadow-[var(--btn-shadow)]",
                "transition-transform duration-[0.12s] ease",
                "motion-safe:hover:-translate-y-px",
                "focus-visible:ring-2 focus-visible:ring-[color:var(--ring)] focus-visible:outline-none",
              ].join(" ")}
            >
              Explore tools →
            </Link>
            <Link
              href="/"
              className={[
                "inline-flex items-center justify-center gap-2",
                "h-11 px-[18px] rounded-[9px]",
                "font-sans text-[14px] font-medium tracking-[-0.01em]",
                "bg-transparent text-foreground",
                "border border-[hsl(var(--border-strong,var(--border)))]",
                "hover:bg-[hsl(var(--card))]",
                "transition-[background-color,border-color] duration-200",
                "focus-visible:ring-2 focus-visible:ring-[color:var(--ring)] focus-visible:outline-none",
              ].join(" ")}
            >
              Back home
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
