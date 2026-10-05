"use client";

import type { KeyboardEvent } from "react";
import { cn } from "@/lib/utils";

interface CategoryTabsProps {
  categories: readonly string[];
  active: string;
  idPrefix: string;
  onChange: (category: string) => void;
}

/** DOM id shared by a category tab and its row panel. */
export function categoryId(idPrefix: string, category: string): string {
  return `${idPrefix}-${category.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
}

/**
 * Category tab list with automatic activation: ArrowLeft/ArrowRight (plus
 * Home/End) move both focus and selection; roving tabindex keeps a single
 * tab stop. No animation, so reduced motion holds by construction.
 */
export function CategoryTabs({ categories, active, idPrefix, onChange }: CategoryTabsProps) {
  const neighbour = (offset: number): string | undefined => {
    const count = categories.length;
    if (count === 0) return undefined;
    const index = categories.indexOf(active);
    const current = index === -1 ? 0 : index;
    return categories[(current + offset + count) % count];
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    let next: string | undefined;
    if (event.key === "ArrowRight") next = neighbour(1);
    else if (event.key === "ArrowLeft") next = neighbour(-1);
    else if (event.key === "Home") next = categories[0];
    else if (event.key === "End") next = categories[categories.length - 1];
    else return;
    event.preventDefault();
    if (next !== undefined) {
      onChange(next);
      document.getElementById(categoryId(idPrefix, next))?.focus();
    }
  };

  return (
    <div
      role="tablist"
      aria-label="Tool categories"
      onKeyDown={handleKeyDown}
      className="flex flex-wrap gap-1"
    >
      {categories.map((category) => {
        const selected = category === active;
        return (
          <button
            key={category}
            type="button"
            role="tab"
            id={categoryId(idPrefix, category)}
            aria-selected={selected}
            // Only the selected tab owns a panel — the single tabpanel below
            // re-labels itself — so inactive tabs must not reference one.
            aria-controls={selected ? `${categoryId(idPrefix, category)}-panel` : undefined}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(category)}
            className={cn(
              "min-h-touch rounded-md border px-3 font-sans text-sm",
              selected
                ? "border-term-surface2 bg-term-surface2 text-term-fg"
                : "border-transparent text-term-muted hover:text-term-fg",
            )}
          >
            {category}
          </button>
        );
      })}
    </div>
  );
}
