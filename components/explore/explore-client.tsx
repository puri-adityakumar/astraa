"use client";

import { motion } from "framer-motion";
import { Gamepad2, Wrench } from "lucide-react";

import { ContentGrid, type ContentItem } from "@/components/content-grid";
import { Badge } from "@/components/ui/badge";
import { fadeInUp } from "@/lib/animations/variants";
import { useReducedMotion } from "@/lib/animations/hooks";
import { games } from "@/lib/games";
import { useTools } from "@/lib/tools-context";

export function ExploreClient() {
  const { tools } = useTools();
  const shouldReduce = useReducedMotion();

  const toolItems: ContentItem[] = tools.map((tool) => ({
    ...tool,
    category: "tool",
  }));

  const gameItems: ContentItem[] = games.map((game) => ({
    ...game,
    category: "game",
  }));

  return (
    <div className="mx-auto max-w-6xl space-y-16 py-4 sm:space-y-20 sm:py-8">
      <motion.header
        className="border-b pb-10 sm:pb-12"
        variants={shouldReduce ? {} : fadeInUp}
        initial="hidden"
        animate="show"
      >
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
          Astraa catalog / 2026
        </p>
        <div className="mt-5 grid gap-6 lg:grid-cols-[1fr_0.7fr] lg:items-end">
          <div>
            <h1 className="text-[clamp(3rem,7vw,5.5rem)]">Explore the toolkit.</h1>
          </div>
          <div>
            <p className="max-w-xl text-base leading-7 text-muted-foreground">
              Small, precise tools for development, content, data, and focused work.
              Everything opens instantly and most processing stays on your device.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Badge variant="outline">{tools.length} tools</Badge>
              <Badge variant="outline">{games.length} games</Badge>
              <Badge variant="outline">No sign-up</Badge>
            </div>
          </div>
        </div>
      </motion.header>

      <CatalogSection
        count={tools.length}
        description="Utilities for data, code, files, calculations, and everyday browser tasks."
        icon={Wrench}
        items={toolItems}
        title="Tools"
      />

      <CatalogSection
        count={games.length}
        description="Small browser games for a quick reset between focused sessions."
        icon={Gamepad2}
        items={gameItems}
        title="Games"
      />
    </div>
  );
}

interface CatalogSectionProps {
  count: number;
  description: string;
  icon: typeof Wrench;
  items: ContentItem[];
  title: string;
}

function CatalogSection({
  count,
  description,
  icon: Icon,
  items,
  title,
}: CatalogSectionProps) {
  return (
    <section aria-labelledby={`${title.toLowerCase()}-heading`}>
      <div className="mb-5 flex flex-col gap-3 border-b pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-md border bg-muted/30">
            <Icon className="h-4 w-4" aria-hidden="true" />
          </div>
          <div>
            <h2
              id={`${title.toLowerCase()}-heading`}
              className="text-xl font-semibold tracking-[-0.03em]"
            >
              {title}
            </h2>
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
              {count} available
            </p>
          </div>
        </div>
        <p className="max-w-lg text-sm leading-6 text-muted-foreground sm:text-right">
          {description}
        </p>
      </div>
      <ContentGrid items={items} />
    </section>
  );
}
