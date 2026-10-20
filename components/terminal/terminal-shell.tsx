"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Menu } from "lucide-react";
import {
  browserHistoryBack,
  browserHistoryForward,
  navigateBrowser,
  type BrowserHistory,
} from "@/lib/terminal/browser-history";
import { outputToLiveText } from "@/lib/terminal/live-text";
import { commandForSlug, runInput } from "@/lib/terminal/registry";
import { scrollAction } from "@/lib/terminal/scroll-policy";
import {
  appendScrollbackEntry,
  completeScrollbackEntry,
  type ScrollbackEntry,
} from "@/lib/terminal/scrollback";
import type { OutputBlock, ToolSlug } from "@/lib/terminal/types";
import { cn } from "@/lib/utils";
import { TERM_COLUMN } from "./column";
import { BrowserPanel } from "./browser-panel";
import { switchToLegacyFlavour } from "./flavour-switch";
import { HomeView } from "./home-view";
import { PanelHost } from "./panel-host";
import { PromptBar } from "./prompt-bar";
import { Scrollback } from "./scrollback";
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
  // The browser panel is session state like the scrollback: no URL sync, no
  // persistence. The object (not just the url) is the open flag so the start
  // page (url null) still keeps the panel open, and it carries the panel's
  // back/forward stacks (cross-origin frame history is not inspectable).
  const [browser, setBrowser] = useState<BrowserHistory | null>(null);
  const closeBrowser = useCallback(() => setBrowser(null), []);
  // Coming-soon tools (music, sql) never open a panel: a direct load of
  // their URL prints the coming-soon line in the scrollback instead
  // (architecture §5 rule 5).
  const initialCommand =
    initialTool !== undefined ? commandForSlug(initialTool) : undefined;
  const initialComingSoon = initialCommand?.status === "coming-soon";
  const { panel, open, close } = usePanelUrl(
    initialComingSoon ? undefined : initialTool,
    closeBrowser,
  );
  const { theme, setTheme } = useTerminalTheme();
  const mainRef = useRef<HTMLElement>(null);
  const previousPanelRef = useRef<ToolSlug | "browser" | null>(
    initialComingSoon ? null : (initialTool ?? null),
  );
  const seededToolRef = useRef<string | null>(null);
  const nextIdRef = useRef(0);
  const generationRef = useRef(0);

  // The browser and tool panels are mutually exclusive: opening one closes
  // the other. close() also rewinds a pushed /tools/<slug> history entry.
  // openBrowser is a fresh visit: drop the forward stack. Back and forward
  // move between the stacks without touching it.
  const openBrowser = useCallback(
    (url: string | null) => {
      close();
      setBrowser((current) => navigateBrowser(current, url));
    },
    [close],
  );
  const browserBack = useCallback(() => {
    setBrowser(browserHistoryBack);
  }, []);
  const browserForward = useCallback(() => {
    setBrowser(browserHistoryForward);
  }, []);

  const clearScreen = useCallback(() => {
    generationRef.current += 1;
    setEntries([]);
    setLiveText("Screen cleared.");
    close();
    setBrowser(null);
  }, [close]);

  // Keep the newest output in view without pushing a freshly opened panel's
  // header (and its Esc hint) off the top: an opening or switching panel
  // scrolls to the top of the column, nonempty scrollback chases its newest
  // entry, and an empty history (the home view, fresh or after /clear) stays
  // at the top. Entries added while a panel stays open never scroll-jack.
  // Panel alignment re-applies while the panel settles: the tool client is
  // dynamically imported, so the panel grows after the first paint (chunk
  // compile on cold opens) and a one-shot scroll would strand it mid-view —
  // a scroll container also clamps, so the panel column carries min-h-dvh
  // (PanelFrame) to keep top-alignment reachable for short panels.
  useEffect(() => {
    const main = mainRef.current;
    if (!main) return;
    const panelKey: ToolSlug | "browser" | null = browser !== null ? "browser" : panel;
    const panelChanged = previousPanelRef.current !== panelKey;
    previousPanelRef.current = panelKey;
    const action = scrollAction({
      panelOpen: panelKey !== null,
      panelChanged,
      hasEntries: entries.length > 0,
    });
    if (action === "panel") {
      const el = main.querySelector<HTMLElement>("[data-term-panel]");
      if (el) {
        const align = () => {
          if (!el.isConnected) return;
          main.scrollTop +=
            el.getBoundingClientRect().top - main.getBoundingClientRect().top;
        };
        align();
        const observer = new ResizeObserver(align);
        observer.observe(el);
        const timeout = window.setTimeout(() => observer.disconnect(), 2000);
        return () => {
          window.clearTimeout(timeout);
          observer.disconnect();
        };
      }
    } else if (action === "bottom") {
      main.scrollTo({ top: main.scrollHeight });
    } else if (action === "top") {
      main.scrollTo({ top: 0 });
    }
    return undefined;
  }, [entries, panel, browser]);

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
      if (input.trim() === "") return;
      const id = ++nextIdRef.current;
      const generation = generationRef.current;
      setEntries((previous) => appendScrollbackEntry(previous, { id, input, output: [] }));
      const result = await runInput(input, theme);
      if (generation !== generationRef.current) return;
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
      } else if (id === nextIdRef.current) {
        if (result.type === "browser") {
          openBrowser(result.url);
        } else if (result.type === "open" || result.type === "fallback") {
          setBrowser(null);
          open(result.slug);
        }
      }
      const output: OutputBlock[] =
        result.type === "fallback"
          ? [{ type: "error", text: result.message }]
          : (result.output ?? []);
      setEntries((previous) => completeScrollbackEntry(previous, id, output));
      setLiveText(outputToLiveText(output));
    },
    [clearScreen, theme, setTheme, open, openBrowser],
  );

  // Direct coming-soon loads use the same ordering and clear guards as typed commands.
  useEffect(() => {
    const command = initialCommand;
    if (!command || command.status !== "coming-soon") return;
    if (seededToolRef.current !== null) return;
    seededToolRef.current = command.name;
    void handleSubmit(`/${command.name}`);
  }, [initialCommand, handleSubmit]);

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
        {/* One content column: scrollback, panels and the frame overlay live
            in the scroll region; the prompt sits below it as a flex sibling
            so it is always pinned to the bottom. main hides its scrollbar
            (terminal.css) — a zero-space scrollbar means the column can
            never shift under the prompt, which is what keeps every surface
            on one grid. */}
        <main ref={mainRef} className="relative flex min-h-0 flex-1 flex-col overflow-y-auto">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 left-1/2 w-full max-w-3xl -translate-x-1/2 border-x border-term-surface2"
          />
          <div className="min-h-0 flex-1">
            {entries.length > 0 && (
              <div className={cn(TERM_COLUMN, "py-8")}>
                <Scrollback entries={entries} />
              </div>
            )}
            {browser !== null ? (
              <BrowserPanel
                url={browser.url}
                canBack={browser.past.length > 0}
                canForward={browser.future.length > 0}
                onBack={browserBack}
                onForward={browserForward}
                onNavigate={openBrowser}
                onClose={closeBrowser}
              />
            ) : panel !== null ? (
              <PanelHost slug={panel} onClose={close} />
            ) : entries.length === 0 ? (
              <HomeView onRun={handleSubmit} />
            ) : null}
            <div aria-live="polite" aria-atomic="true" className="sr-only">
              {liveText}
            </div>
          </div>
        </main>
        <PromptBar onSubmit={handleSubmit} autoFocus={panel === null && browser === null} />
      </div>
    </div>
  );
}
