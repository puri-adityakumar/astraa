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
 * The terminal home view, shown while the scrollback is empty: pixel ASTRAA
 * banner, intro, registry-driven category tabs and rows, and the /help tip
 * card. Rows are empty-safe — tool categories stay visible before any tool
 * command is registered.
 */
export function HomeView({ onRun }: HomeViewProps = {}) {
  const categories = toolCategories.map((category) => category.name);
  const [active, setActive] = useState(categories[0] ?? "");
  const activeCommands = commandsInCategory(getCommands(), active);
  const tabId = categoryId("term", active);

  return (
    <div className={cn(TERM_COLUMN, "flex min-h-[calc(100dvh-10rem)] flex-col py-8")}>
      <div
        aria-hidden="true"
        className="select-none font-pixel text-4xl leading-none text-term-fg sm:text-5xl"
      >
        ASTRAA
      </div>
      <p className="mt-4 max-w-prose font-mono text-sm leading-relaxed text-term-muted">
        A browser-based utility toolkit — all processing happens locally in
        your browser. Pick a tool below or type a command at the prompt.
      </p>

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

      <div className="flex-1" />

      <div className="mt-8 rounded-md border border-term-surface2 bg-term-surface p-4 font-mono text-sm text-term-muted">
        Tip: type <span className="font-mono text-term-fg">/help</span> to see all commands
      </div>
    </div>
  );
}
