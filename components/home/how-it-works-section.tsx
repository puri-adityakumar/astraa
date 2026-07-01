"use client";

import { motion } from "framer-motion";

import { useReducedMotion } from "@/lib/animations/hooks";
import { fadeInUpGentle, staggerGentle } from "@/lib/animations/variants";
import { CornerMarkers } from "@/components/ui/corner-marker";
import { SectionHeader } from "@/components/ui/section-header";
import {
  BlueprintRings,
  BlueprintRadiate,
  BlueprintArrows,
} from "@/components/ui/blueprint-art";

import type { ComponentType } from "react";

interface BlueprintArtProps {
  className?: string;
}

interface Step {
  num: string;
  label: string;
  title: string;
  desc: string;
  Art: ComponentType<BlueprintArtProps>;
}

const STEPS: readonly Step[] = [
  {
    num: "01",
    label: "Pick a tool",
    title: "Pick a tool",
    desc: "Search ⌘K or browse the catalog — 15+ utilities at your command.",
    Art: BlueprintRings,
  },
  {
    num: "02",
    label: "Paste or type",
    title: "Paste or type",
    desc: "Drop in your text, file, or numbers — no setup, no sign-in.",
    Art: BlueprintRadiate,
  },
  {
    num: "03",
    label: "Get it instantly",
    title: "Get it instantly",
    desc: "Everything runs locally in your browser — no servers, no accounts.",
    Art: BlueprintArrows,
  },
] as const;

export function HowItWorksSection() {
  const shouldReduce = useReducedMotion();
  const containerProps = shouldReduce
    ? {}
    : { variants: staggerGentle, initial: "hidden" as const, animate: "show" as const };
  const itemProps = shouldReduce ? {} : { variants: fadeInUpGentle };

  return (
    <section
      className="py-[clamp(44px,7vw,84px)] relative"
      aria-labelledby="how-it-works-heading"
    >
      <div className="w-full max-w-[1080px] mx-auto px-7">
        <SectionHeader
          label="HOW IT WORKS"
          title="Three steps, zero servers."
          description="No installs, no accounts — just open a tool and go."
        />

        {/* 3-column grid → 1 col on mobile, mirroring the tcard grids */}
        <motion.div
          className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
          {...containerProps}
        >
          {STEPS.map(({ num, label, title, desc, Art }) => (
            <motion.div key={num} {...itemProps}>
              <div
                className={[
                  "group relative flex flex-col p-5 bg-[hsl(var(--card))]",
                  "border border-[color:var(--hairline)] rounded-[var(--radius)]",
                  "transition-[border-color,background-color] duration-200",
                  "hover:border-[color:var(--hairline-strong)] hover:bg-[hsl(var(--surface-3))]",
                ].join(" ")}
              >
                <CornerMarkers />

                {/* Blueprint motif topper */}
                <div className="mb-5 flex items-center justify-center overflow-hidden">
                  <Art />
                </div>

                {/* Mono numbered label — polar style "01 — Pick a tool" */}
                <span
                  className={[
                    "font-mono text-[11px] font-medium leading-[1.3] uppercase",
                    "tracking-[0.16em] text-muted-foreground",
                  ].join(" ")}
                >
                  {num} — {label}
                </span>

                <h3 className="mt-2 mb-[6px] text-[15px] font-semibold tracking-[-0.015em] text-foreground">
                  {title}
                </h3>
                <p className="text-[13px] leading-[1.45] tracking-[-0.005em] text-muted-foreground">
                  {desc}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
