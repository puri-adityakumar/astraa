"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Menu } from "lucide-react";
import { outputToLiveText } from "@/lib/terminal/live-text";
import { runInput } from "@/lib/terminal/registry";
import type { OutputBlock, ToolSlug } from "@/lib/terminal/types";
import { HomeView } from "./home-view";
import { PanelHost } from "./panel-host";
import { PromptBar } from "./prompt-bar";
import { Scrollback, type ScrollbackEntry } from "./scrollback";
import { Sidebar } from "./sidebar";
import { usePanelUrl } from "./use-panel-url";
import { useTerminalTheme } from "./terminal-theme";

interface TerminalShellProps {
  /** Slug for direct /tools/<slug> loads; renders with that panel open. */
  initialTool?: ToolSlug;
}

/**
 * The terminal shell: desktop sidebar rail (or mobile top bar + drawer), a
 * scrolling main column with the home view, scrollback and the open tool
 * panel, and the interactive prompt pinned to the bottom. Submitted lines
 * run through the command registry; everything stays in memory — nothing
 * here persists.
 */
export function TerminalShell({ initialTool }: TerminalShellProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [entries, setEntries] = useState<ScrollbackEntry[]>([]);
  const [liveText, setLiveText] = useState("");
  const { panel, open, close } = usePanelUrl(initialTool);
  const { theme, setTheme } = useTerminalTheme();
  const mainRef = useRef<HTMLElement>(null);
  const nextIdRef = useRef(0);

  const clearScreen = useCallback(() => {
    setEntries([]);
    setLiveText("Screen cleared.");
    close();
  }, [close]);

  // Keep the newest entry in view: the prompt is a flex sibling of the
  // scrolling column, so scrolling the column to its end never hides output
  // behind it.
  useEffect(() => {
    mainRef.current?.scrollTo({ top: mainRef.current.scrollHeight });
  }, [entries]);

  // Ctrl+L clears the screen like /clear, wherever the focus is.
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.ctrlKey &&
        !event.altKey &&
        !event.metaKey &&
        event.key.toLowerCase() === "l"
      ) {
        event.preventDefault();
        clearScreen();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [clearScreen]);

  // Runs a submitted line (typed or clicked from a row) through the
  // registry: echoes it in the scrollback and executes its result.
  const handleSubmit = useCallback(
    async (input: string) => {
      const result = await runInput(input, theme);
      if (result === null) return;
      if (result.type === "builtin") {
        const { action } = result;
        if (action.kind === "clear") {
          clearScreen();
          return;
        }
        // /theme persists the cookie, flips the attribute and re-forces the
        // html class via the theme provider; /legacy waits for flavour
        // switching. Both answers still echo to the scrollback.
        if (action.kind === "theme") setTheme(action.theme);
      } else if (result.type === "open" || result.type === "fallback") {
        open(result.slug);
      }
      const output: OutputBlock[] =
        result.type === "fallback"
          ? [{ type: "error", text: result.message }]
          : (result.output ?? []);
      nextIdRef.current += 1;
      setEntries((previous) => [
        ...previous,
        { id: nextIdRef.current, input, output },
      ]);
      setLiveText(outputToLiveText(output));
    },
    [clearScreen, theme, setTheme, open],
  );

  return (
    <div className="flex h-dvh overflow-hidden bg-term-bg text-term-fg">
      <Sidebar
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        onRun={handleSubmit}
      />
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
        <main ref={mainRef} className="min-h-0 flex-1 overflow-y-auto">
          {entries.length > 0 && (
            <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6">
              <Scrollback entries={entries} />
            </div>
          )}
          {panel !== null ? (
            <PanelHost slug={panel} onClose={close} />
          ) : entries.length === 0 ? (
            <HomeView onRun={handleSubmit} />
          ) : null}
          <div aria-live="polite" aria-atomic="true" className="sr-only">
            {liveText}
          </div>
        </main>
        <PromptBar onSubmit={handleSubmit} autoFocus={panel === null} />
      </div>
    </div>
  );
}
