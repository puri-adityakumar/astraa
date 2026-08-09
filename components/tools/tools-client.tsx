"use client";

import { motion } from "framer-motion";
import { ContentGrid } from "@/components/content-grid";
import { Badge } from "@/components/ui/badge";
import { fadeInUp } from "@/lib/animations/variants";
import { useReducedMotion } from "@/lib/animations/hooks";
import { availableTools, toolCategories, tools } from "@/lib/tools";

export function ToolsClient() {
  const shouldReduce = useReducedMotion();

  return (
    <div className="mx-auto max-w-7xl space-y-8 py-4 sm:space-y-12 sm:py-8">
      <motion.div
        className="border-b pb-10 sm:pb-12"
        variants={shouldReduce ? {} : fadeInUp}
        initial="hidden"
        animate="show"
      >
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
          Astraa / Tools
        </p>
        <h1 className="mt-5 text-[clamp(3rem,7vw,5.5rem)]">Choose a browser tool.</h1>
        <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground">
          Use calculators, converters, editors, generators, and developer utilities. Each tool
          states whether its work happens in your browser or uses a provider.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Badge variant="outline">{availableTools.length} available</Badge>
          <Badge variant="outline">{tools.length - availableTools.length} planned</Badge>
        </div>
      </motion.div>

      {/* Categorized Tools List */}
      {toolCategories.map((category, categoryIndex) => (
        <motion.div
          key={category.name}
          initial={shouldReduce ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: shouldReduce ? 0 : categoryIndex * 0.08 }}
          className="space-y-5"
        >
          <div className="flex items-end justify-between border-b pb-4">
            <h2 className="text-xl font-semibold tracking-[-0.03em]">{category.name}</h2>
            <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
              {category.items.filter((tool) => tool.status === "available").length} available
            </span>
          </div>
          <ContentGrid
            items={category.items.map((tool) => ({
              ...tool,
              category: category.name.toLowerCase(),
            }))}
          />
        </motion.div>
      ))}
    </div>
  );
}
