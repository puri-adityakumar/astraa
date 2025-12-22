"use client"

import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import type { LucideIcon } from "lucide-react"
import { staggerContainerFast, staggerItem } from "@/lib/animations/variants"
import { useReducedMotion } from "@/lib/animations/hooks"

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
      <div className="text-center py-12 px-4">
        <p className="text-muted-foreground text-lg">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <motion.div
      variants={shouldReduce ? {} : container}
      initial="hidden"
      animate="show"
      className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 px-4"
    >
      {items.map((contentItem) => (
        <motion.div 
          key={contentItem.path} 
          variants={shouldReduce ? {} : item}
          whileHover={shouldReduce ? {} : { y: -8 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <Link href={contentItem.comingSoon ? "#" : contentItem.path}>
            <Card className="p-5 sm:p-6 glass glass-hover group space-y-3 sm:space-y-4 h-full min-h-touch relative overflow-hidden">
              {/* Hover gradient effect */}
              {!shouldReduce && (
                <motion.div
                  className="absolute inset-0 bg-gradient-to-br from-primary/5 via-secondary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                />
              )}
              
              <div className="relative z-10">
                <div className="flex items-center justify-between">
                  <motion.div
                    whileHover={shouldReduce ? {} : { rotate: 360, scale: 1.1 }}
                    transition={{ duration: 0.6 }}
                  >
                    <contentItem.icon className="h-7 w-7 sm:h-8 sm:w-8 text-primary group-hover:text-accent transition-colors" />
                  </motion.div>
                  <div className="flex gap-2">
                    {contentItem.wip && (
                      <Badge variant="secondary" className="text-xs">Work in Progress</Badge>
                    )}
                    {contentItem.comingSoon && (
                      <Badge variant="secondary" className="text-xs">Coming Soon</Badge>
                    )}
                  </div>
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                    {contentItem.name}
                  </h3>
                  <p className="text-muted-foreground text-sm sm:text-base group-hover:text-foreground/80 transition-colors">
                    {contentItem.description}
                  </p>
                </div>
              </div>
            </Card>
          </Link>
        </motion.div>
      ))}
    </motion.div>
  )
}
