"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Key, FileJson, Terminal, Binary, Hash, Code } from "lucide-react";
import { TCard } from "@/components/ui/tcard";
import { useReducedMotion } from "@/lib/animations/hooks";

const POPULAR_TOOLS = [
  {
    icon: Key,
    title: "Password Generator",
    desc: "Create strong, secure passwords",
    href: "/tools/password",
    tag: "LOCAL",
  },
  {
    icon: FileJson,
    title: "JSON Editor",
    desc: "Format, validate & convert",
    href: "/tools/json",
    tag: "LOCAL",
  },
  {
    icon: Terminal,
    title: "Regex Tester",
    desc: "Live pattern matching",
    href: "/tools/regex",
    tag: "LOCAL",
  },
  {
    icon: Binary,
    title: "Base64",
    desc: "Encode & decode anything",
    href: "/tools/base64",
    tag: "LOCAL",
  },
  {
    icon: Hash,
    title: "Hash Generator",
    desc: "MD5, SHA-256 & more",
    href: "/tools/hash",
    tag: "LOCAL",
  },
  {
    icon: Code,
    title: "Snippet Generator",
    desc: "Beautiful code images",
    href: "/tools/snippet-generator",
    tag: "LOCAL",
  },
] as const;

const fadeInUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const } },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

export function PopularSection() {
  const shouldReduce = useReducedMotion();
  const containerProps = shouldReduce
    ? {}
    : { variants: stagger, initial: "hidden" as const, animate: "show" as const };
  const itemProps = shouldReduce ? {} : { variants: fadeInUp };

  return (
    <section
      className="py-[clamp(44px,7vw,84px)] relative"
      aria-labelledby="popular-heading"
    >
      <div className="w-full max-w-[1080px] mx-auto px-7">
        {/* Head row */}
        <div className="flex items-end justify-between gap-4 mb-[26px]">
          <div className="flex flex-col gap-3">
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
              POPULAR
            </span>
            <h2
              id="popular-heading"
              className="text-[clamp(24px,3.4vw,32px)] font-bold tracking-[-0.03em] leading-[1.1]"
            >
              Start here
            </h2>
          </div>
          <Link
            href="/tools"
            className={[
              "inline-flex items-center gap-[6px] shrink-0",
              "font-mono text-[11px] tracking-[0.1em] uppercase text-muted-foreground",
              "hover:text-foreground transition-colors duration-150",
            ].join(" ")}
          >
            View all tools
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-[13px] h-[13px]"
              aria-hidden="true"
            >
              <path d="M7 17L17 7M9 7h8v8" />
            </svg>
          </Link>
        </div>

        {/* 3-column grid → 1 col on mobile */}
        <motion.div
          className={[
            "grid gap-4",
            "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
          ].join(" ")}
          {...containerProps}
        >
          {POPULAR_TOOLS.map((tool) => (
            <motion.div key={tool.href} {...itemProps}>
              <TCard
                icon={tool.icon}
                title={tool.title}
                desc={tool.desc}
                href={tool.href}
                tag={tool.tag}
              />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
