"use client";

import { useState } from "react";
import { toolCategories } from "@/lib/tools";
import { commandsInCategory } from "@/lib/terminal/rows";
import { getCommands } from "@/lib/terminal/registry";
import { cn } from "@/lib/utils";
import { TERM_COLUMN } from "./column";
import { CategoryTabs, categoryId } from "./category-tabs";
import { ToolRow } from "./tool-row";

interface HomeViewProps {
  /** Runs a bare tool command (row click) through the shell. */
  onRun?: (input: string) => void;
}

/**
 * The terminal home view, shown while the scrollback is empty. Categories
 * stay visible before any tool command is registered.
 */
export function HomeView({ onRun }: HomeViewProps = {}) {
  const categories = toolCategories.map((category) => category.name);
  const [active, setActive] = useState(categories[0] ?? "");
  const activeCommands = commandsInCategory(getCommands(), active);
  const tabId = categoryId("term", active);

  return (
    <div className={cn(TERM_COLUMN, "flex flex-col py-6 sm:py-8")}>
      <section className="rounded-xl border border-term-surface2 p-4 font-mono sm:p-5">
        <h2 className="flex items-center gap-3 text-base text-term-fg">
          <span aria-hidden="true" className="text-xl text-term-accent">✻</span>
          Welcome to astraa
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-term-muted">
          /help for commands, /config for settings
        </p>
        <p className="mt-1 text-sm leading-relaxed text-term-muted">
          All processing happens locally in your browser.
        </p>
      </section>

      <div>
        <div className="mt-8">
          <CategoryTabs
            categories={categories}
            active={active}
            idPrefix="term"
            onChange={setActive}
          />
        </div>

        <div
          role="tabpanel"
          id={`${tabId}-panel`}
          aria-labelledby={tabId}
          className="mt-3 space-y-1"
        >
          {activeCommands.length === 0 ? (
            <p className="px-3 py-2 font-mono text-sm text-term-muted">
              No commands in this category yet.
            </p>
          ) : (
            activeCommands.map((command) => (
              <ToolRow key={command.name} command={command} showSummary onRun={onRun} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
