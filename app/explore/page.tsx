"use client"

import { motion } from "framer-motion"
import { Gamepad2, Wrench } from "lucide-react"
import { useTools } from "@/lib/tools-context"
import { games } from "@/lib/games"
import { ContentGrid } from "@/components/content-grid"
import type { ContentItem } from "@/components/content-grid"

export default function ExplorePage() {
  const { tools } = useTools()

  const toolItems: ContentItem[] = [...tools]
    .sort((a, b) => {
      const aUnavailable = (a.comingSoon || a.wip) ? 1 : 0
      const bUnavailable = (b.comingSoon || b.wip) ? 1 : 0
      return aUnavailable - bUnavailable
    })
    .map(tool => ({
      ...tool,
      category: "tool"
    }))

  const gameItems: ContentItem[] = games.map(game => ({
    ...game,
    category: "game"
  }))

  return (
    <div className="max-w-7xl mx-auto space-y-8 sm:space-y-12 pt-16">
      <motion.div 
        className="text-center space-y-3 sm:space-y-4 px-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-fluid-4xl font-bold">Explore</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto text-fluid-base">
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
          <span className="text-muted-foreground text-sm">({tools.length})</span>
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
          <span className="text-muted-foreground text-sm">({games.length})</span>
        </div>
        <ContentGrid items={gameItems} />
      </motion.div>
    </div>
  )
}
