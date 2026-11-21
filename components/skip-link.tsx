"use client";

import type { KeyboardEvent, MouseEvent } from "react";
import { cn } from "@/lib/utils";

const MAIN_CONTENT_ID = "main-content";

/**
 * WCAG 2.4.1 bypass link. Each flavour renders it first in its chrome, so it
 * is the document's first focusable element; `.skip-to-main` keeps it out of
 * the layout until keyboard focus reaches it.
 */
export function SkipLink({ className }: { className?: string }) {
  const focusMainContent = () => {
    const main = document.getElementById(MAIN_CONTENT_ID);
    if (!main) return false;
    main.focus();
    return true;
  };

  // A plain fragment jump would add a history entry, and the terminal's
  // popstate handler reads any non-panel state as "close the open panel".
  // Focus the landmark directly instead; the href stays as the no-JS and
  // link-semantics fallback.
  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (focusMainContent()) event.preventDefault();
  };

  // A tool's page-level shortcut can also listen for Enter (the calculator
  // keypad does), so keep this keydown from reaching it. The default action
  // still synthesizes the click handled above.
  const handleKeyDown = (event: KeyboardEvent<HTMLAnchorElement>) => {
    if (event.key === "Enter") event.stopPropagation();
  };

  return (
    <a
      href={`#${MAIN_CONTENT_ID}`}
      className={cn("skip-to-main", className)}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      Skip to main content
    </a>
  );
}
