"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight, type LucideIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { staggerContainerFast, staggerItem } from "@/lib/animations/variants";
import { useReducedMotion } from "@/lib/animations/hooks";

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

export function ContentGrid({ items, emptyMessage = "No items found" }: ContentGridProps) {
  const shouldReduce = useReducedMotion();

  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-dashed px-6 py-16 text-center">
        <p className="text-sm text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <motion.div
      variants={shouldReduce ? {} : staggerContainerFast}
      initial="hidden"
      animate="show"
      className="grid gap-px overflow-hidden rounded-xl border bg-border sm:grid-cols-2 lg:grid-cols-3"
    >
      {items.map((contentItem, index) => {
        const Icon = contentItem.icon;
        const typeLabel = contentItem.category === "game" ? "Game" : "Tool";

        return (
          <motion.div
            key={contentItem.path}
            variants={shouldReduce ? {} : staggerItem}
            className="bg-background"
          >
            <Link
              href={contentItem.comingSoon ? "#" : contentItem.path}
              className="group relative flex min-h-[210px] flex-col bg-background p-5 transition-colors duration-150 hover:bg-background-2 sm:p-6"
              aria-disabled={contentItem.comingSoon}
              onClick={(event) => {
                if (contentItem.comingSoon) event.preventDefault();
              }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-md border bg-muted/30">
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </div>
                <ArrowUpRight
                  className="h-4 w-4 text-muted-foreground transition-transform duration-150 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-foreground"
                  aria-hidden="true"
                />
              </div>

              <div className="mt-auto pt-8">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                    {typeLabel} {String(index + 1).padStart(2, "0")}
                  </span>
                  {contentItem.wip && <Badge variant="outline">WIP</Badge>}
                  {contentItem.comingSoon && (
                    <Badge variant="outline">Coming soon</Badge>
                  )}
                </div>
                <h3 className="text-base font-semibold tracking-[-0.02em]">
                  {contentItem.name}
                </h3>
                <p className="mt-1.5 text-sm leading-6 text-muted-foreground">
                  {contentItem.description}
                </p>
              </div>
            </Link>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
