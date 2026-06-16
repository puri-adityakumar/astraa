"use client";

import { motion } from "framer-motion";
import { useTools } from "@/lib/tools-context";
import { games } from "@/lib/games";
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

export function ExploreClient() {
  const { tools } = useTools();
  const shouldReduce = useReducedMotion();

  const containerProps = shouldReduce
    ? {}
    : { variants: stagger, initial: "hidden" as const, animate: "show" as const };
  const itemProps = shouldReduce ? {} : { variants: fadeInUp };

  return (
    <div className="py-[clamp(44px,7vw,84px)] relative">
      <div className="w-full max-w-[1080px] mx-auto px-7 space-y-14">
        {/* Page heading */}
        <div>
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
            EVERYTHING
          </span>
          <h1 className="mt-3 text-[clamp(32px,5vw,44px)] font-extrabold tracking-[-0.035em] leading-[1.02]">
            Explore
          </h1>
          <p className="mt-4 text-[clamp(15px,1.4vw,17px)] text-[hsl(var(--text-2))] tracking-[-0.01em] leading-[1.6] max-w-[560px]">
            Every tool and game in one place.
          </p>
        </div>

        {/* Tools section */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <h2 className="text-[17px] font-semibold tracking-[-0.015em] text-foreground">
              Tools
            </h2>
            <span className="text-[13px] text-muted-foreground">({tools.length})</span>
          </div>

          <motion.div
            className={[
              "grid gap-4",
              "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
            ].join(" ")}
            {...containerProps}
          >
            {tools.map((tool) => (
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

        {/* Games section */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <h2 className="text-[17px] font-semibold tracking-[-0.015em] text-foreground">
              Games
            </h2>
            <span className="text-[13px] text-muted-foreground">({games.length})</span>
          </div>

          <motion.div
            className={[
              "grid gap-4",
              "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
            ].join(" ")}
            {...(!shouldReduce && {
              variants: stagger,
              initial: "hidden" as const,
              animate: "show" as const,
              transition: { delayChildren: 0.15 },
            })}
          >
            {games.map((game) => (
              <motion.div key={game.path} {...itemProps}>
                <TCard
                  icon={game.icon}
                  title={game.name}
                  desc={game.description}
                  {...(!game.comingSoon && { href: game.path })}
                  tag={game.comingSoon ? "SOON" : "GAME"}
                  soon={game.comingSoon ?? false}
                />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
