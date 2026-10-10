"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { TERM_COLUMN } from "./column";

interface PanelFrameProps {
  /** Header title and accessible name root ("<title> panel"). */
  title: string;
  /** Value carried by data-term-panel — the shell's scroll target key. */
  panelKey: string;
  /** When this changes, focus moves into the frame. */
  focusKey: string;
  onClose: () => void;
  children: ReactNode;
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
 * Shared panel chrome: the content column, header (title, Esc hint, labelled
 * close button), focus on open and a capture-phase Escape handler so the
 * frame closes from anywhere unless a Radix overlay inside consumes it
 * first. Tool panels (PanelHost) and the browser panel render inside it.
 */
export function PanelFrame({ title, panelKey, focusKey, onClose, children }: PanelFrameProps) {
  const frameRef = useRef<HTMLElement>(null);

  useEffect(() => {
    frameRef.current?.focus();
  }, [focusKey]);

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
        ref={frameRef}
        tabIndex={-1}
        data-term-panel={panelKey}
        aria-label={`${title} panel`}
        className="outline-none"
      >
        <header className="mb-4 flex min-h-touch items-center gap-3">
          <h2 className="font-sans text-base font-semibold text-term-fg sm:text-lg">
            {title}
          </h2>
          <span className="font-mono text-xs text-term-muted">Esc to close</span>
          <button
            type="button"
            aria-label={`Close ${title}`}
            onClick={onClose}
            className="ml-auto flex min-h-touch min-w-touch items-center justify-center rounded-md text-term-muted hover:bg-term-surface2 hover:text-term-fg"
          >
            <X aria-hidden="true" className="h-5 w-5" />
          </button>
        </header>
        {children}
      </section>
    </div>
  );
}
