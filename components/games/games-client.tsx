"use client";

import { motion } from "framer-motion";
import { ContentGrid } from "@/components/content-grid";
import { Badge } from "@/components/ui/badge";
import { fadeInUp } from "@/lib/animations/variants";
import { useReducedMotion } from "@/lib/animations/hooks";
import { availableGames, comingSoonGames, games } from "@/lib/games";
import type { ContentItem } from "@/components/content-grid";

export function GamesClient() {
  const shouldReduce = useReducedMotion();
  const gameItems: ContentItem[] = games.map((game) => ({
    ...game,
    category: "game",
  }));
  const availabilitySummary =
    `${formatGameCount(availableGames.length)} ${
      availableGames.length === 1 ? "is" : "are"
    } playable now. ` +
    `${formatGameCount(comingSoonGames.length)} ${
      comingSoonGames.length === 1 ? "remains" : "remain"
    } planned without a release date.`;

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
        <h1 className="mt-5 text-[clamp(3rem,7vw,5.5rem)]">Play browser games.</h1>
        <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground">
          {availabilitySummary}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Badge variant="outline">{availableGames.length} available</Badge>
          <Badge variant="outline">{comingSoonGames.length} planned</Badge>
        </div>
      </motion.div>

      {/* Games Grid */}
      <ContentGrid items={gameItems} />
    </div>
  );
}

function formatGameCount(count: number): string {
  return `${count} ${count === 1 ? "game" : "games"}`;
}
