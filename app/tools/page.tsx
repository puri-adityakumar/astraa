"use client"

import { motion } from "framer-motion"
import { useTools } from "@/lib/tools-context"
import { ContentGrid } from "@/components/content-grid"

export default function ToolsPage() {
  const { categories } = useTools()

  // Calculate stats
  const tools = categories.flatMap(c => c.items)
  const totalTools = tools.length
  const availableTools = tools.filter(t => !t.comingSoon && !t.wip).length

  return (
    <div className="max-w-7xl mx-auto space-y-8 sm:space-y-12 pt-16">
      <motion.div
        className="text-center space-y-3 sm:space-y-4 px-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-fluid-4xl font-bold">Tools Arsenal</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto text-fluid-base">
          Discover our collection of powerful tools designed to enhance your workflow
        </p>
        <div className="flex justify-center gap-4 text-sm text-muted-foreground">
          <span>{totalTools} Total Tools</span>
          <span>•</span>
          <span>{availableTools} Available</span>
        </div>
      </motion.div>

    {categories.map((category, categoryIndex) => (
        <motion.div
          key={category.name}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: categoryIndex * 0.1 }}
          className="space-y-4 sm:space-y-6"
        >
          <div className="flex items-center gap-2 px-4">
            <h2 className="text-fluid-2xl font-semibold">{category.name}</h2>
            <span className="text-muted-foreground text-sm">({category.items.length})</span>
          </div>
          <ContentGrid
            items={[...category.items]
              .sort((a, b) => {
                const aUnavailable = (a.comingSoon || a.wip) ? 1 : 0
                const bUnavailable = (b.comingSoon || b.wip) ? 1 : 0
                return aUnavailable - bUnavailable
              })
              .map(tool => ({ ...tool, category: category.name.toLowerCase() }))}
          />
        </motion.div>
      ))}
    </div>
  )
}