"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { ContentGrid } from "@/components/content-grid";
import { Badge } from "@/components/ui/badge";
import { fadeInUp } from "@/lib/animations/variants";
import { useReducedMotion } from "@/lib/animations/hooks";
import { games } from "@/lib/games";
import type { ContentItem } from "@/components/content-grid";

export function GamesClient() {
  const shouldReduce = useReducedMotion();
  // Convert games to ContentItem format
  const gameItems: ContentItem[] = useMemo(() =>
    games.map(game => ({
      ...game,
      category: "game",
    })),
    [],
  );

  const availableCount = gameItems.filter(g => !g.comingSoon).length;

  return (
    <div className="mx-auto max-w-7xl space-y-8 py-4 sm:space-y-12 sm:py-8">
      <motion.div
        className="border-b pb-10 sm:pb-12"
        variants={shouldReduce ? {} : fadeInUp}
        initial="hidden"
        animate="show"
      >
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
          Astraa / Games
        </p>
        <h1 className="mt-5 text-[clamp(3rem,7vw,5.5rem)]">Take a quick reset.</h1>
        <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground">
          Take a break with our collection of games
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Badge variant="outline">{availableCount} available</Badge>
          <Badge variant="outline">{gameItems.length} planned</Badge>
        </div>
      </motion.div>

      {/* Games Grid */}
      <ContentGrid items={gameItems} />
    </div>
  );
}
