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
 * Escape belongs to open overlays, including the prompt suggestions and
 * mobile drawer, before it can close the panel.
 */
function hasOpenOverlay(): boolean {
  return (
    document.getElementById("term-suggestions") !== null ||
    document.querySelector("[data-term-drawer-open]") !== null ||
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
      if (hasOpenOverlay()) return;
      event.preventDefault();
      event.stopPropagation();
      onClose();
    };
    window.addEventListener("keydown", handleKeyDown, true);
    return () => window.removeEventListener("keydown", handleKeyDown, true);
  }, [onClose]);

  return (
    <div className={cn(TERM_COLUMN, "min-h-dvh pb-8")}>
      <section
        ref={frameRef}
        tabIndex={-1}
        data-term-panel={panelKey}
        aria-label={`${title} panel`}
        className="pt-4 outline-none sm:pt-6"
      >
        <header
          className="mb-5 flex min-h-touch items-center gap-3 border-b border-term-surface2 pb-3"
        >
          <span aria-hidden="true" className="font-mono text-lg text-term-accent">✻</span>
          <h2 className="min-w-0 break-words font-mono text-sm font-medium text-term-fg">
            {title}
          </h2>
          <span className="ml-auto hidden shrink-0 font-mono text-xs text-term-muted sm:inline">
            Esc to close
          </span>
          <button
            type="button"
            aria-label={`Close ${title}`}
            onClick={onClose}
            className={cn(
              "ml-auto flex min-h-touch min-w-touch shrink-0 items-center justify-center rounded-md",
              "text-term-muted hover:bg-term-surface2 hover:text-term-fg sm:ml-0",
            )}
          >
            <X aria-hidden="true" className="h-5 w-5" />
          </button>
        </header>
        {children}
      </section>
    </div>
  );
}
