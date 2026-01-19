"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useReducedMotion } from "@/lib/animations/hooks";
import { staggerContainerFast, staggerItem } from "@/lib/animations/variants";

const container = staggerContainerFast;

const item = staggerItem;

export interface ContentItem {
  name: string;
  description: string;
  path: string;
  icon: LucideIcon;
  wip?: boolean;
  comingSoon?: boolean;
  category?: string;
}

interface ContentGridProps {
  items: ContentItem[];
  emptyMessage?: string;
}

export function ContentGrid({
  items,
  emptyMessage = "No items found",
}: ContentGridProps) {
  const shouldReduce = useReducedMotion();

  if (items.length === 0) {
    return (
      <div className="px-4 py-12 text-center">
        <p className="text-lg text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <motion.div
      variants={shouldReduce ? {} : container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 gap-4 px-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3"
    >
      {items.map((contentItem) => (
        <motion.div
          key={contentItem.path}
          variants={shouldReduce ? {} : item}
          whileHover={shouldReduce ? {} : { y: -8 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <Link href={contentItem.comingSoon ? "#" : contentItem.path}>
            <Card className="glass glass-hover group relative h-full min-h-touch space-y-3 overflow-hidden p-5 sm:space-y-4 sm:p-6">
              {/* Hover gradient effect */}
              {!shouldReduce && (
                <motion.div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-secondary/5 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              )}

              <div className="relative z-10">
                <div className="flex items-center justify-between">
                  <motion.div
                    whileHover={shouldReduce ? {} : { rotate: 360, scale: 1.1 }}
                    transition={{ duration: 0.6 }}
                  >
                    <contentItem.icon className="h-7 w-7 text-primary transition-colors group-hover:text-accent sm:h-8 sm:w-8" />
                  </motion.div>
                  <div className="flex gap-2">
                    {contentItem.wip && (
                      <Badge variant="secondary" className="text-xs">
                        Work in Progress
                      </Badge>
                    )}
                    {contentItem.comingSoon && (
                      <Badge variant="secondary" className="text-xs">
                        Coming Soon
                      </Badge>
                    )}
                  </div>
                </div>
                <div>
                  <h3 className="mb-2 text-lg font-semibold transition-colors group-hover:text-primary sm:text-xl">
                    {contentItem.name}
                  </h3>
                  <p className="text-sm text-muted-foreground transition-colors group-hover:text-foreground/80 sm:text-base">
                    {contentItem.description}
                  </p>
                </div>
              </div>
            </Card>
          </Link>
        </motion.div>
      ))}
    </motion.div>
  );
}
