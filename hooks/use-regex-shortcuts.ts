"use client";

import { useEffect } from "react";

export interface RegexShortcutHandlers {
  onForceRun: () => void;
  onFocusPattern: () => void;
  onFocusTest: () => void;
  onToggleReplace: () => void;
  onCopyLiteral: () => void;
  onShare: () => void;
}

/**
 * Global keyboard-shortcut hub for the regex tester.
 *
 * Every shortcut requires a modifier key (Cmd on macOS, Ctrl elsewhere) and
 * consumes the event via `preventDefault`. Shift is additionally required for
 * the copy/share combos (so they are effectively Cmd/Ctrl+Shift+C and
 * Cmd/Ctrl+Shift+S). The listener re-binds whenever any handler identity
 * changes so the dispatched closures always see fresh state.
 */
export function useRegexShortcuts(handlers: RegexShortcutHandlers): void {
  const { onForceRun, onFocusPattern, onFocusTest, onToggleReplace, onCopyLiteral, onShare } =
    handlers;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      if (!mod) return;
      if (e.key === "Enter") {
        e.preventDefault();
        onForceRun();
        return;
      }
      if (e.key.toLowerCase() === "k") {
        e.preventDefault();
        onFocusPattern();
        return;
      }
      if (e.key.toLowerCase() === "l") {
        e.preventDefault();
        onFocusTest();
        return;
      }
      if (e.key === "/") {
        e.preventDefault();
        onToggleReplace();
        return;
      }
      if (e.shiftKey && e.key.toLowerCase() === "c") {
        e.preventDefault();
        onCopyLiteral();
        return;
      }
      if (e.shiftKey && e.key.toLowerCase() === "s") {
        e.preventDefault();
        onShare();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onForceRun, onFocusPattern, onFocusTest, onToggleReplace, onCopyLiteral, onShare]);
}
