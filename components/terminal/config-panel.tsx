"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";

import { cycleTermTheme } from "@/lib/terminal/config";
import { TERM_THEMES, type TermTheme } from "@/lib/terminal/cookies";
import { getScheme } from "@/lib/terminal/themes";
import { cn } from "@/lib/utils";

import { switchToLegacyFlavour } from "./flavour-switch";
import { PanelFrame } from "./panel-frame";
import { useTerminalTheme } from "./terminal-theme";

interface ConfigPanelProps {
  onClose: () => void;
}

const FOCUS_RING = cn(
  "focus-visible:outline focus-visible:outline-2",
  "focus-visible:outline-term-accent",
);
const ROW_BUTTON = cn(
  "flex items-center gap-3 px-3 min-h-touch w-full text-left rounded-md",
  FOCUS_RING,
);
const OPTION_BUTTON = cn(
  "px-2 min-h-touch text-xs rounded hover:bg-term-surface2",
  FOCUS_RING,
);

export function ConfigPanel({ onClose }: ConfigPanelProps) {
  const { theme, setTheme } = useTerminalTheme();
  const [selectedRow, setSelectedRow] = useState<0 | 1>(0);
  const [confirmLegacy, setConfirmLegacy] = useState(false);
  const themeRowRef = useRef<HTMLButtonElement>(null);
  const interfaceRowRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    themeRowRef.current?.focus();
  }, []);

  function selectTheme(next: TermTheme): void {
    setConfirmLegacy(false);
    setTheme(next);
  }

  function focusRow(row: 0 | 1): void {
    setSelectedRow(row);
    setConfirmLegacy(false);
    const target = row === 0 ? themeRowRef : interfaceRowRef;
    target.current?.focus();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>): void {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    if (event.repeat && (event.key === "Enter" || event.key === " ")) {
      event.preventDefault();
      return;
    }
    if (event.key === "ArrowUp" || event.key === "ArrowDown") {
      event.preventDefault();
      event.stopPropagation();
      focusRow(selectedRow === 0 ? 1 : 0);
    } else if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      event.preventDefault();
      event.stopPropagation();
      if (selectedRow === 0) {
        selectTheme(cycleTermTheme(theme, event.key === "ArrowLeft" ? -1 : 1));
      } else {
        setConfirmLegacy((pending) => !pending);
        interfaceRowRef.current?.focus();
      }
    }
  }

  function activateInterface(): void {
    if (confirmLegacy) {
      switchToLegacyFlavour();
    } else {
      setConfirmLegacy(true);
    }
  }

  return (
    <PanelFrame title="Settings" panelKey="config" focusKey="config" onClose={onClose}>
      <div
        role="group"
        aria-label="Terminal settings"
        aria-describedby="term-config-keys"
        onKeyDown={handleKeyDown}
        className="space-y-2 font-mono text-sm text-term-fg"
      >
        <p className="pb-3 text-term-muted">Changes are saved in this browser.</p>
        <ul className="space-y-2">
          <li
            onFocusCapture={() => {
              setSelectedRow(0);
              setConfirmLegacy(false);
            }}
            className={cn(
              "rounded-md border border-term-surface2",
              selectedRow === 0 && "bg-term-surface",
            )}
          >
            <button
              ref={themeRowRef}
              type="button"
              aria-label={`Colour scheme: ${theme}. Select to cycle schemes.`}
              onClick={() => selectTheme(cycleTermTheme(theme, 1))}
              className={ROW_BUTTON}
            >
              <span aria-hidden="true" className="w-3 shrink-0 text-term-accent">
                {selectedRow === 0 ? "›" : ""}
              </span>
              <span className="shrink-0">Colour scheme</span>
              <span
                aria-hidden="true"
                className="min-w-2 flex-1 border-b border-dotted border-term-surface2"
              />
              <span className="break-words text-right text-term-accent">{theme}</span>
            </button>
            <div
              role="group"
              aria-label="Colour scheme options"
              className="flex flex-wrap gap-1 px-3 pb-3 sm:pl-9"
            >
              {TERM_THEMES.map((option) => {
                const description = option === "auto" ? "system" : getScheme(option).kind;
                return (
                  <button
                    key={option}
                    type="button"
                    aria-pressed={theme === option}
                    aria-label={`${option} (${description})`}
                    title={
                      option === "auto" ? "Follow the system setting" : `${description} scheme`
                    }
                    onClick={() => selectTheme(option)}
                    className={cn(
                      OPTION_BUTTON,
                      "text-term-muted hover:text-term-fg",
                      theme === option && "bg-term-bg text-term-accent",
                    )}
                  >
                    <span aria-hidden="true">{theme === option ? "● " : ""}</span>
                    {option}
                  </button>
                );
              })}
            </div>
          </li>
          <li
            onFocusCapture={() => setSelectedRow(1)}
            className={cn(
              "rounded-md border border-term-surface2",
              selectedRow === 1 && "bg-term-surface",
            )}
          >
            <button
              ref={interfaceRowRef}
              type="button"
              aria-label={
                confirmLegacy
                  ? "Interface: terminal. Select again to confirm switching to legacy."
                  : "Interface: terminal. Select to switch to legacy."
              }
              aria-expanded={confirmLegacy}
              aria-controls={confirmLegacy ? "term-config-interface-confirmation" : undefined}
              onClick={activateInterface}
              className={ROW_BUTTON}
            >
              <span aria-hidden="true" className="w-3 shrink-0 text-term-accent">
                {selectedRow === 1 ? "›" : ""}
              </span>
              <span>Interface</span>
              <span
                aria-hidden="true"
                className="min-w-2 flex-1 border-b border-dotted border-term-surface2"
              />
              <span className="text-term-accent">terminal</span>
            </button>
            <div
              role="group"
              aria-label="Interface options"
              className="flex flex-wrap gap-1 px-3 pb-3 sm:pl-9"
            >
              <button
                type="button"
                aria-pressed
                onClick={() => setConfirmLegacy(false)}
                className={cn(OPTION_BUTTON, "bg-term-bg text-term-accent")}
              >
                <span aria-hidden="true">● </span>terminal
              </button>
              <button
                type="button"
                aria-label="Switch to the legacy interface"
                onClick={() => setConfirmLegacy(true)}
                className={cn(OPTION_BUTTON, "text-term-muted hover:text-term-fg")}
              >
                legacy
              </button>
            </div>
            {confirmLegacy && (
              <div id="term-config-interface-confirmation" className="px-3 pb-3 sm:pl-9">
                <p role="status" className="text-xs text-term-muted">
                  Press Enter again on Interface to switch to the legacy UI. This reloads the page.
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={switchToLegacyFlavour}
                    className={cn(
                      OPTION_BUTTON,
                      "px-3 text-term-accent border border-term-surface2",
                    )}
                  >
                    Switch to legacy
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setConfirmLegacy(false);
                      interfaceRowRef.current?.focus();
                    }}
                    className={cn(OPTION_BUTTON, "px-3 text-term-muted")}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </li>
        </ul>
        <p role="status" aria-live="polite" aria-atomic="true" className="sr-only">
          Colour scheme: {theme}.
        </p>
        <p id="term-config-keys" className="pt-4 text-xs text-term-muted">
          ↑↓ move · ←→ change · Enter select · Esc close
        </p>
      </div>
    </PanelFrame>
  );
}
