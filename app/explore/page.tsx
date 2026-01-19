"use client";

import { motion } from "framer-motion";
import { Gamepad2, Wrench } from "lucide-react";
import { ContentGrid } from "@/components/content-grid";
import type { ContentItem } from "@/components/content-grid";
import { games } from "@/lib/games";
import { useTools } from "@/lib/tools-context";

export default function ExplorePage() {
  const { tools } = useTools();

  const toolItems: ContentItem[] = tools.map((tool) => ({
    ...tool,
    category: "tool",
  }));

  const gameItems: ContentItem[] = games.map((game) => ({
    ...game,
    category: "game",
  }));

  return (
    <div className="mx-auto max-w-7xl space-y-8 pt-16 sm:space-y-12">
      <motion.div
        className="space-y-3 px-4 text-center sm:space-y-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-fluid-4xl font-bold">Explore</h1>
        <p className="mx-auto max-w-2xl text-fluid-base text-muted-foreground">
          Discover our collection of tools and games
        </p>
      </motion.div>

      {/* Tools Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-4 sm:space-y-6"
      >
        <div className="flex items-center gap-2 px-4">
          <Wrench className="h-5 w-5 sm:h-6 sm:w-6" />
          <h2 className="text-fluid-2xl font-semibold">Tools</h2>
          <span className="text-sm text-muted-foreground">
            ({tools.length})
          </span>
        </div>
        <ContentGrid items={toolItems} />
      </motion.div>

      {/* Games Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-4 sm:space-y-6"
      >
        <div className="flex items-center gap-2 px-4">
          <Gamepad2 className="h-5 w-5 sm:h-6 sm:w-6" />
          <h2 className="text-fluid-2xl font-semibold">Games</h2>
          <span className="text-sm text-muted-foreground">
            ({games.length})
          </span>
        </div>
        <ContentGrid items={gameItems} />
      </motion.div>
    </div>
  );
}
