"use client";

import { motion } from "framer-motion";
import { useTools } from "@/lib/tools-context";
import { TCard } from "@/components/ui/tcard";
import { useReducedMotion } from "@/lib/animations/hooks";

const fadeInUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const } },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
};

export function ToolsClient() {
  const { categories } = useTools();
  const shouldReduce = useReducedMotion();

  const tools = categories.flatMap((c) => c.items);
  const totalTools = tools.length;

  const itemProps = shouldReduce ? {} : { variants: fadeInUp };

  return (
    <section className="py-[clamp(44px,7vw,84px)] relative">
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
              UTILITIES
            </span>
            <h1 className="text-[clamp(32px,5vw,44px)] font-extrabold tracking-[-0.035em] leading-[1.02]">
              Tools
            </h1>
          </div>
          <span
            className={[
              "font-mono text-[10px] font-medium tracking-[0.14em] uppercase",
              "px-[6px] py-0.5 whitespace-nowrap text-muted-foreground shrink-0",
              "border border-[color:var(--hairline)] rounded-[4px]",
            ].join(" ")}
          >
            {totalTools} TOOLS
          </span>
        </div>

        {/* Lede */}
        <p className="text-[clamp(15px,1.4vw,17px)] text-[hsl(var(--text-2))] tracking-[-0.01em] leading-[1.6] max-w-[560px] mb-6">
          {totalTools} focused utilities. Each runs locally, instantly.
        </p>

        {/* Per-category grids */}
        {categories.map((category, categoryIndex) => (
          <div key={category.name} className="mb-10 last:mb-0">
            {/* Category sub-heading */}
            <div className="flex items-center gap-3 mb-4">
              <h2 className="text-[17px] font-semibold tracking-[-0.015em] text-foreground">
                {category.name}
              </h2>
              <span className="text-[13px] text-muted-foreground">
                ({category.items.length})
              </span>
            </div>

            {/* grid-4 → 2 cols @900px → 1 col @560px (mirrors system.css responsive) */}
            <motion.div
              className={[
                "grid gap-4",
                "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
              ].join(" ")}
              {...(!shouldReduce && {
                variants: stagger,
                initial: "hidden" as const,
                animate: "show" as const,
                transition: { delayChildren: categoryIndex * 0.08 },
              })}
            >
              {category.items.map((tool) => (
                <motion.div key={tool.path} {...itemProps}>
                  <TCard
                    icon={tool.icon}
                    title={tool.name}
                    desc={tool.description}
                    {...(!(tool.comingSoon || tool.wip) && { href: tool.path })}
                    tag={tool.comingSoon ? "SOON" : tool.wip ? "WIP" : "LOCAL"}
                    soon={tool.comingSoon ?? false}
                  />
                </motion.div>
              ))}
            </motion.div>
          </div>
        ))}
      </div>
    </section>
  );
}
