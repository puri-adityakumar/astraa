"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import { HomeView } from "./home-view";
import { PromptBar } from "./prompt-bar";
import { Sidebar } from "./sidebar";
import { ToolPlaceholder } from "./tool-placeholder";

interface TerminalShellProps {
  /** Slug for direct /tools/<slug> loads; renders the tool stand-in. */
  initialTool?: string;
}

/**
 * The terminal shell: desktop sidebar rail (or mobile top bar + drawer),
 * scrolling main column, and the prompt pinned to the bottom of the
 * viewport. The main column scrolls; the prompt never does.
 */
export function TerminalShell({ initialTool }: TerminalShellProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="flex h-dvh overflow-hidden bg-term-bg text-term-fg">
      <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-term-surface2 px-4 md:hidden">
          <span aria-hidden="true" className="select-none font-pixel text-base text-term-fg">
            ASTRAA
          </span>
          <button
            type="button"
            aria-label="Menu"
            aria-expanded={menuOpen}
            aria-controls="term-sidebar"
            onClick={() => setMenuOpen((open) => !open)}
            className="flex min-h-touch min-w-touch items-center justify-center rounded-md hover:bg-term-surface2"
          >
            <Menu aria-hidden="true" className="h-5 w-5" />
          </button>
        </header>
        <main className="min-h-0 flex-1 overflow-y-auto">
          {initialTool === undefined ? <HomeView /> : <ToolPlaceholder tool={initialTool} />}
        </main>
        <PromptBar />
      </div>
    </div>
  );
}
