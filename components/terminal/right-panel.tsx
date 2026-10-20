"use client";

import { useEffect, useRef, type RefObject } from "react";
import Link from "next/link";
import { X } from "lucide-react";
import { games } from "@/lib/games";
import { browserCommand } from "@/lib/terminal/commands/browser";
import { gameRows } from "@/lib/terminal/game-rows";
import { toolCommands } from "@/lib/terminal/rows";
import { getCommands } from "@/lib/terminal/registry";
import { cn } from "@/lib/utils";
import { SiteIcons } from "./left-rail";
import { SponsorSlot } from "./sponsor-slot";
import { ToolRow } from "./tool-row";
import { toolShortName } from "./tool-names";

interface RightPanelProps {
  open: boolean;
  onClose: () => void;
  triggerRef: RefObject<HTMLButtonElement | null>;
  /** Runs a bare tool command (row click) through the shell. */
  onRun: (input: string) => void;
}

/** The right-hand catalogue panel mirrors the left rail at lg and up; below
 *  lg (where three columns would squeeze the terminal) it is a modal drawer. */
export function RightPanel({ open, onClose, triggerRef, onRun }: RightPanelProps) {
  const commands = toolCommands(getCommands());
  const gameEntries = gameRows(games);
  const drawerRef = useRef<HTMLElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  const runRow = (input: string) => {
    onRun(input);
    onClose();
  };

  useEffect(() => {
    if (!open) return;
    const trigger = triggerRef.current;
    closeRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        onClose();
      } else if (event.key === "Tab") {
        const controls = Array.from(
          drawerRef.current?.querySelectorAll<HTMLElement>(
            "a[href], button:not([disabled]), [tabindex='0']",
          ) ?? [],
        ).filter((element) => element.getClientRects().length > 0);
        const first = controls[0];
        const last = controls[controls.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }
    };
    const desktop = window.matchMedia("(min-width: 1024px)");
    const handleDesktop = () => {
      if (desktop.matches) onClose();
    };
    window.addEventListener("keydown", handleKeyDown, true);
    desktop.addEventListener("change", handleDesktop);
    return () => {
      window.removeEventListener("keydown", handleKeyDown, true);
      desktop.removeEventListener("change", handleDesktop);
      trigger?.focus();
    };
  }, [open, onClose, triggerRef]);

  return (
    <>
      {open && (
        <button
          type="button"
          aria-label="Close tools menu"
          tabIndex={-1}
          onClick={onClose}
          className="fixed inset-0 z-40 bg-term-bg opacity-80 lg:hidden"
        />
      )}
      <aside
        ref={drawerRef}
        id="term-tools-panel"
        aria-label="Tools and games"
        role={open ? "dialog" : undefined}
        aria-modal={open ? true : undefined}
        data-term-drawer-open={open ? "" : undefined}
        className={cn(
          "min-h-0 shrink-0 flex-col border-l border-term-surface2 bg-term-surface",
          open
            ? "fixed inset-y-0 right-0 z-50 flex w-80 max-w-[90vw] lg:static lg:w-56"
            : "hidden w-56 lg:flex",
        )}
      >
        <div
          className={cn(
            "flex shrink-0 items-center justify-between px-4 py-2",
            "border-b border-term-surface2 lg:hidden",
          )}
        >
          <span className="font-mono text-sm text-term-fg">Tools &amp; games</span>
          <button
            ref={closeRef}
            type="button"
            aria-label="Close tools"
            onClick={onClose}
            className={cn(
              "flex min-h-touch min-w-touch items-center justify-center rounded-md",
              "text-term-muted hover:bg-term-surface2 hover:text-term-fg",
            )}
          >
            <X aria-hidden="true" className="h-5 w-5" />
          </button>
        </div>
        <div className="hidden shrink-0 justify-end px-5 py-6 lg:flex">
          <h2 className="select-none whitespace-nowrap font-pixel text-xl text-term-fg">
            tools
          </h2>
        </div>
        <nav aria-label="Tools and games" className="min-h-0 flex-1 overflow-y-auto px-2 py-5">
          <section aria-labelledby="term-tools-heading">
            <h2
              id="term-tools-heading"
              className={cn(
                "mb-2 flex items-center justify-between px-3",
                "font-mono text-xs text-term-muted",
              )}
            >
              Tools <span>{commands.length + 1}</span>
            </h2>
            <ul className="space-y-0.5">
              <li>
                <ToolRow
                  command={browserCommand}
                  displayName="Browser"
                  compact
                  onRun={runRow}
                />
              </li>
              {commands.map((command) => (
                <li key={command.name}>
                  <ToolRow
                    command={command}
                    displayName={toolShortName(command.slug)}
                    compact
                    onRun={runRow}
                  />
                </li>
              ))}
            </ul>
          </section>
          <section aria-labelledby="term-games-heading" className="mt-6">
            <h2
              id="term-games-heading"
              className={cn(
                "mb-2 flex items-center justify-between px-3",
                "font-mono text-xs text-term-muted",
              )}
            >
              Games <span>{gameEntries.length}</span>
            </h2>
            <ul className="space-y-0.5">
              {gameEntries.map((game) => (
                <li key={game.path}>
                  {game.comingSoon ? (
                    <div
                      className={cn(
                        "flex min-h-touch items-center justify-between gap-2 px-3",
                        "font-mono text-xs text-term-muted",
                      )}
                    >
                      <span>{game.name}</span>
                      <span className="text-[10px]">soon</span>
                    </div>
                  ) : (
                    <Link
                      href={game.path}
                      onClick={onClose}
                      className={cn(
                        "flex min-h-touch items-center rounded-md px-3",
                        "font-mono text-xs text-term-fg",
                        "hover:bg-term-surface2 focus-visible:bg-term-surface2",
                      )}
                    >
                      {game.name}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </section>
        </nav>
        <div className="shrink-0 space-y-3 border-t border-term-surface2 px-4 py-3 md:hidden">
          <SponsorSlot compact />
          <SiteIcons onNavigate={onClose} />
        </div>
      </aside>
    </>
  );
}
