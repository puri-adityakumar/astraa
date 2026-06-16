"use client";

import { motion } from "framer-motion";
import { Monitor, ShieldCheck, Github } from "lucide-react";
import { TCard } from "@/components/ui/tcard";
import { useReducedMotion } from "@/lib/animations/hooks";

const PRINCIPLES = [
  {
    icon: Monitor,
    title: "Runs in your browser",
    desc: "Every computation happens on your device — nothing is sent anywhere.",
    href: "/about",
    tag: "LOCAL",
  },
  {
    icon: ShieldCheck,
    title: "No account, ever",
    desc: "No sign-ups, no emails, no cookies tracking what you do here.",
    href: "/about",
    tag: "PRIVATE",
  },
  {
    icon: Github,
    title: "Open source",
    desc: "Inspect, fork or self-host the whole thing — released under MIT.",
    href: "/contribute",
    tag: "MIT",
  },
] as const;

const fadeInUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const } },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};

export function PrinciplesSection() {
  const shouldReduce = useReducedMotion();
  const containerProps = shouldReduce
    ? {}
    : { variants: stagger, initial: "hidden" as const, animate: "show" as const };
  const itemProps = shouldReduce ? {} : { variants: fadeInUp };

  return (
    <section
      className="py-[clamp(44px,7vw,84px)] relative"
      aria-labelledby="principles-heading"
    >
      <div className="w-full max-w-[1080px] mx-auto px-7">
        {/* Section head */}
        <div className="flex flex-col gap-[14px] mb-7">
          <span
            className={[
              "inline-flex items-center gap-[9px]",
              "font-mono text-[11px] font-medium tracking-[0.2em] uppercase",
              "text-muted-foreground",
            ].join(" ")}
          >
            <span
              className="inline-block w-[18px] h-px bg-foreground"
              style={{ opacity: 0.55 }}
              aria-hidden="true"
            />
            PRINCIPLES
          </span>
          <h2
            id="principles-heading"
            className="text-[clamp(24px,3.4vw,32px)] font-bold tracking-[-0.03em] leading-[1.1]"
          >
            No catch
          </h2>
        </div>

        {/* 3-column grid → 1 col on mobile */}
        <motion.div
          className={[
            "grid gap-4",
            "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
          ].join(" ")}
          {...containerProps}
        >
          {PRINCIPLES.map((p) => (
            <motion.div key={p.title} {...itemProps}>
              <TCard
                icon={p.icon}
                title={p.title}
                desc={p.desc}
                href={p.href}
                tag={p.tag}
              />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
