"use client";

import { useState } from "react";
import { toolCategories } from "@/lib/tools";
import { commandsInCategory } from "@/lib/terminal/rows";
import { getCommands } from "@/lib/terminal/registry";
import { CategoryTabs, categoryId } from "./category-tabs";
import { ToolRow } from "./tool-row";

/**
 * The terminal home view, shown while the scrollback is empty: pixel ASTRAA
 * banner, intro, registry-driven category tabs and rows, and the /help tip
 * card. Rows are empty-safe — tool categories stay visible before any tool
 * command is registered.
 */
export function HomeView() {
  const categories = toolCategories.map((category) => category.name);
  const [active, setActive] = useState(categories[0] ?? "");
  const activeCommands = commandsInCategory(getCommands(), active);
  const tabId = categoryId("term", active);

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6">
      <div
        aria-hidden="true"
        className="select-none font-pixel text-4xl leading-none text-term-fg sm:text-5xl"
      >
        ASTRAA
      </div>
      <p className="mt-4 max-w-prose font-sans text-term-muted">
        A browser-based utility toolkit — all processing happens locally in
        your browser. Pick a tool below or type a command at the prompt.
      </p>

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
          <p className="px-3 py-2 font-sans text-sm text-term-muted">
            No commands in this category yet.
          </p>
        ) : (
          activeCommands.map((command) => (
            <ToolRow key={command.name} command={command} showSummary />
          ))
        )}
      </div>

      <div className="mt-8 rounded-lg border border-term-surface2 bg-term-surface p-4 font-sans text-sm text-term-muted">
        Tip: type <span className="font-mono text-term-fg">/help</span> to see all commands
      </div>
    </div>
  );
}
