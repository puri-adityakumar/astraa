"use client"

import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import type { LucideIcon } from "lucide-react"
import { staggerContainerFast, staggerItem } from "@/lib/animations/variants"
import { useReducedMotion } from "@/lib/animations/hooks"
import { ArrowUpRight } from "lucide-react"

const container = staggerContainerFast
const item = staggerItem

export interface ContentItem {
  name: string
  description: string
  path: string
  icon: LucideIcon
  wip?: boolean
  comingSoon?: boolean
  category?: string
}

interface ContentGridProps {
  items: ContentItem[]
  emptyMessage?: string
}

export function ContentGrid({ items, emptyMessage = "No items found" }: ContentGridProps) {
  const shouldReduce = useReducedMotion()

  if (items.length === 0) {
    return (
      <div className="text-center py-20 px-4">
        <p className="text-muted-foreground text-lg font-medium">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <motion.div
      variants={shouldReduce ? {} : container}
      initial="hidden"
      animate="show"
      className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3"
    >
      {items.map((contentItem) => (
        <motion.div 
          key={contentItem.path} 
          variants={shouldReduce ? {} : item}
          className="h-full"
        >
          <Link href={contentItem.comingSoon ? "#" : contentItem.path} className="block h-full outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-xl">
            <div className="group relative h-full flex flex-col justify-between rounded-xl border border-border/50 bg-background/50 backdrop-blur-sm p-6 transition-all duration-300 hover:border-foreground/20 hover:shadow-sm hover:bg-background/80">
              
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors duration-300">
                    <contentItem.icon className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={1.5} />
                  </div>
                  
                  <div className="flex gap-2 items-center">
                    {contentItem.wip && (
                      <Badge variant="secondary" className="text-[10px] px-2 h-5 font-medium bg-orange-500/10 text-orange-600 dark:text-orange-400 hover:bg-orange-500/20 border-orange-500/20">WIP</Badge>
                    )}
                    {contentItem.comingSoon && (
                      <Badge variant="secondary" className="text-xs px-2 h-5">Coming Soon</Badge>
                    )}
                    {!contentItem.comingSoon && (
                      <ArrowUpRight className="h-4 w-4 text-muted-foreground/50 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-300" />
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-base sm:text-lg font-semibold tracking-tight text-foreground/90 group-hover:text-foreground transition-colors">
                    {contentItem.name}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                    {contentItem.description}
                  </p>
                </div>
              </div>
            </div>
          </Link>
        </motion.div>
      ))}
    </motion.div>
  )
}
