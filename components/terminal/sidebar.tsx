"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Monitor } from "lucide-react";
import { toolCommands } from "@/lib/terminal/rows";
import { getCommands } from "@/lib/terminal/registry";
import { cn } from "@/lib/utils";
import { switchToLegacyFlavour } from "./flavour-switch";
import { SchemePicker } from "./scheme-picker";
import { ToolRow } from "./tool-row";

const SITE_LINKS = [
  { href: "/explore", label: "Explore" },
  { href: "/contribute", label: "Contribute" },
  { href: "/privacy", label: "Privacy" },
] as const;

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  /** Runs a bare tool command (row click) through the shell. */
  onRun?: (input: string) => void;
}

/**
 * Terminal sidebar: the desktop rail (>= 768px) and, below that, the
 * slide-over drawer opened by the top bar's menu button. A single content
 * instance keeps heading and panel ids unique across both presentations.
 */
export function Sidebar({ open, onClose, onRun }: SidebarProps) {
  const commands = toolCommands(getCommands());

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  return (
    <>
      {open && (
        <div
          aria-hidden="true"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/60 md:hidden"
        />
      )}
      <aside
        id="term-sidebar"
        className={cn(
          "z-50 flex-col border-r border-term-surface2 bg-term-surface",
          open
            ? "fixed inset-y-0 left-0 flex w-72 max-w-[85vw] md:static md:w-64"
            : "hidden md:static md:flex md:w-64",
        )}
      >
        <div className="px-4 pb-2 pt-5">
          <h1 aria-label="Astraa" className="select-none font-pixel text-xl text-term-fg">
            ASTRAA
          </h1>
        </div>

        <nav aria-label="Tools" className="min-h-0 flex-1 overflow-y-auto px-2 py-2">
          {commands.length === 0 ? (
            <p className="px-3 py-2 font-sans text-sm text-term-muted">
              No tools registered yet.
            </p>
          ) : (
            <ul className="space-y-1">
              {commands.map((command) => (
                <li key={command.name}>
                  <ToolRow
                    command={command}
                    onRun={(input) => {
                      onRun?.(input);
                      onClose();
                    }}
                  />
                </li>
              ))}
            </ul>
          )}
        </nav>

        <div className="space-y-1 border-t border-term-surface2 px-2 py-3">
          <SchemePicker />
          <div className="px-2 py-1">
            <button
              type="button"
              onClick={switchToLegacyFlavour}
              className="flex min-h-touch w-full items-center justify-between rounded-md px-3 font-sans text-sm text-term-fg hover:bg-term-surface2"
            >
              <span>Legacy UI</span>
              <Monitor className="h-4 w-4 shrink-0 text-term-muted" aria-hidden="true" />
            </button>
          </div>
        </div>

        <nav aria-label="Site" className="border-t border-term-surface2 px-2 py-3">
          <ul className="space-y-1">
            {SITE_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={onClose}
                  className="flex min-h-touch items-center rounded-md px-3 font-sans text-sm text-term-fg hover:bg-term-surface2"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
    </>
  );
}
