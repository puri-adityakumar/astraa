"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Menu } from "lucide-react";
import { outputToLiveText } from "@/lib/terminal/live-text";
import { commandForSlug, runInput } from "@/lib/terminal/registry";
import { scrollAction } from "@/lib/terminal/scroll-policy";
import type { OutputBlock, ToolSlug } from "@/lib/terminal/types";
import { cn } from "@/lib/utils";
import { TERM_COLUMN } from "./column";
import { switchToLegacyFlavour } from "./flavour-switch";
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
  // Coming-soon tools (music, sql) never open a panel: a direct load of
  // their URL prints the coming-soon line in the scrollback instead
  // (architecture §5 rule 5).
  const initialCommand =
    initialTool !== undefined ? commandForSlug(initialTool) : undefined;
  const initialComingSoon = initialCommand?.status === "coming-soon";
  const { panel, open, close } = usePanelUrl(
    initialComingSoon ? undefined : initialTool,
  );
  const { theme, setTheme } = useTerminalTheme();
  const mainRef = useRef<HTMLElement>(null);
  const previousPanelRef = useRef<ToolSlug | null>(
    initialComingSoon ? null : (initialTool ?? null),
  );
  const seededToolRef = useRef<string | null>(null);
  const nextIdRef = useRef(0);

  // Direct loads of /tools/music and /tools/sql seed the scrollback with
  // the command's coming-soon answer, exactly as if it had been typed.
  useEffect(() => {
    const command = initialCommand;
    if (!command || command.status !== "coming-soon") return;
    if (seededToolRef.current !== null) return;
    seededToolRef.current = command.name;
    void runInput(`/${command.name}`, theme).then((result) => {
      if (!result || result.type !== "answer") return;
      nextIdRef.current += 1;
      const id = nextIdRef.current;
      setEntries((previous) => [
        ...previous,
        { id, input: `/${command.name}`, output: result.output },
      ]);
      setLiveText(outputToLiveText(result.output));
    });
  }, [initialCommand, theme]);

  const clearScreen = useCallback(() => {
    setEntries([]);
    setLiveText("Screen cleared.");
    close();
  }, [close]);

  // Keep the newest output in view without pushing a freshly opened panel's
  // header (and its Esc hint) off the top: an opening or switching panel
  // scrolls to the top of the column, nonempty scrollback chases its newest
  // entry, and an empty history (the home view, fresh or after /clear) stays
  // at the top. Entries added while a panel stays open never scroll-jack.
  useEffect(() => {
    const main = mainRef.current;
    if (!main) return;
    const panelChanged = previousPanelRef.current !== panel;
    previousPanelRef.current = panel;
    const action = scrollAction({
      panelOpen: panel !== null,
      panelChanged,
      hasEntries: entries.length > 0,
    });
    if (action === "panel") {
      main
        .querySelector<HTMLElement>("[data-term-panel]")
        ?.scrollIntoView({ block: "start" });
    } else if (action === "bottom") {
      main.scrollTo({ top: main.scrollHeight });
    } else if (action === "top") {
      main.scrollTo({ top: 0 });
    }
  }, [entries, panel]);

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
        // html class via the theme provider; /legacy persists the flavour
        // cookie and reloads into the legacy routes. Both answers still
        // echo to the scrollback first.
        if (action.kind === "theme") setTheme(action.theme);
        if (action.kind === "legacy") switchToLegacyFlavour();
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
          {/* Carries the page's accessible name while the sidebar (the desktop
              h1) is hidden below 768px. */}
          <h1 aria-label="Astraa" className="select-none font-pixel text-base text-term-fg">
            ASTRAA
          </h1>
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
            <div className={cn(TERM_COLUMN, "py-8")}>
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
