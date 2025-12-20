"use client"

import { useMemo } from "react"
import { motion } from "framer-motion"
import { games } from "@/lib/games"
import { ContentGrid } from "@/components/content-grid"
import type { ContentItem } from "@/components/content-grid"

export default function GamesPage() {
  // Convert games to ContentItem format
  const gameItems: ContentItem[] = useMemo(() =>
    games.map(game => ({
      ...game,
      category: "game"
    })),
    []
  )

  const availableCount = gameItems.filter(g => !g.comingSoon).length

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
          Take a break with our collection of games
        </p>
        <div className="flex justify-center gap-4 text-sm text-muted-foreground">
          <span>{availableCount} Available</span>
        </div>
      </motion.div>

      {/* Games Grid */}
      <ContentGrid items={gameItems} />
    </div>
  )
}