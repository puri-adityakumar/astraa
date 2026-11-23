"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { availableGames } from "@/lib/games";
import { ContentGrid } from "@/components/content-grid";
import type { ContentItem } from "@/components/content-grid";

export function GamesClient() {
  // Coming-soon entries stay out of the grid so the catalogue never renders
  // placeholder links to routes that do not exist yet.
  const shippedItems: ContentItem[] = useMemo(
    () =>
      availableGames().map((game) => ({
        ...game,
        category: "game",
      })),
    [],
  );

  const hasShippedGames = shippedItems.length > 0;

  return (
    <div className="max-w-7xl mx-auto space-y-8 sm:space-y-12 pt-16">
      <motion.div
        className="text-center space-y-3 sm:space-y-4 px-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-fluid-4xl font-bold">Games</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto text-fluid-base">
          {hasShippedGames
            ? "Take a break with our collection of games"
            : "Our collection of browser games is in the works"}
        </p>
        {hasShippedGames && (
          <div className="flex justify-center gap-4 text-sm text-muted-foreground">
            <span>{shippedItems.length} Available</span>
          </div>
        )}
      </motion.div>

      {/* Games Grid */}
      <ContentGrid
        items={shippedItems}
        emptyMessage="No games are live yet — new ones are on the way. Check back soon!"
      />
    </div>
  );
}
