"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import type { ToolSlug } from "@/lib/terminal/types";
import { cn } from "@/lib/utils";
import { TERM_COLUMN } from "./column";
import { PANEL_CLIENTS } from "./panel-clients";
import { toolDisplayName } from "./tool-names";

interface PanelHostProps {
  slug: ToolSlug;
  onClose: () => void;
}

/**
 * Whether a portalled Radix overlay (Select/Popover/DropdownMenu content
 * wrapper, a Dialog or an AlertDialog) is currently open. Escape inside one
 * must dismiss the overlay itself, not the whole panel.
 */
function hasOpenRadixOverlay(): boolean {
  return (
    document.querySelector(
      "[data-radix-popper-content-wrapper] [data-state='open'], [role='dialog'][data-state='open'], [role='alertdialog'][data-state='open']",
    ) !== null
  );
}

/**
 * The panel host: mounts the tool client for `slug` in the main column
 * above the prompt with a header (tool name, Esc hint, labelled close
 * button). Focus moves into the panel on open and back to the prompt on
 * close (via the prompt's autoFocus flip). Escape closes the panel from a
 * capture listener so the tool client's own Escape handling never fights
 * it — except when a Radix overlay is open inside the panel, which
 * consumes that Escape first.
 */
export function PanelHost({ slug, onClose }: PanelHostProps) {
  const panelRef = useRef<HTMLElement>(null);
  const Client = PANEL_CLIENTS[slug];
  const name = toolDisplayName(slug);

  useEffect(() => {
    panelRef.current?.focus();
  }, [slug]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (hasOpenRadixOverlay()) return;
      event.preventDefault();
      event.stopPropagation();
      onClose();
    };
    window.addEventListener("keydown", handleKeyDown, true);
    return () => window.removeEventListener("keydown", handleKeyDown, true);
  }, [onClose]);

  return (
    <div className={cn(TERM_COLUMN, "pb-8")}>
      <section
        ref={panelRef}
        tabIndex={-1}
        data-term-panel={slug}
        aria-label={`${name} panel`}
        className="outline-none"
      >
        <header className="mb-4 flex min-h-touch items-center gap-3">
          <h2 className="font-sans text-base font-semibold text-term-fg sm:text-lg">
            {name}
          </h2>
          <span className="font-mono text-xs text-term-muted">Esc to close</span>
          <button
            type="button"
            aria-label={`Close ${name}`}
            onClick={onClose}
            className="ml-auto flex min-h-touch min-w-touch items-center justify-center rounded-md text-term-muted hover:bg-term-surface2 hover:text-term-fg"
          >
            <X aria-hidden="true" className="h-5 w-5" />
          </button>
        </header>
        <Client variant="panel" />
      </section>
    </div>
  );
}
