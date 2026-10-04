"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { KeyboardEvent as ReactKeyboardEvent } from "react";
import {
  initialHistoryNav,
  recallNext,
  recallPrevious,
  type HistoryNav,
} from "@/lib/terminal/history";
import { suggest } from "@/lib/terminal/registry";
import { cn } from "@/lib/utils";

interface PromptBarProps {
  /** Runs a submitted input line through the command registry. */
  onSubmit: (input: string) => void;
  /**
   * Focus the input when it becomes true — on mount (home loads) and every
   * time a panel closes. Panels focus themselves while open.
   */
  autoFocus?: boolean;
}

/**
 * The interactive prompt: single-line input with in-memory history recall
 * (ArrowUp/ArrowDown), a filtered suggestion list opened by typing "/",
 * Tab completion of the command name, Enter to run, Esc to dismiss the
 * list, and empty-input no-op. State is component-local — nothing here
 * persists across reloads.
 */
export function PromptBar({ onSubmit, autoFocus = true }: PromptBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [nav, setNav] = useState<HistoryNav>(initialHistoryNav);
  const [listDismissed, setListDismissed] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);

  // Keep the highlighted suggestion visible inside a long list.
  useEffect(() => {
    if (activeIndex < 0) return;
    document
      .getElementById(`term-suggestion-${activeIndex}`)
      ?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  // Suggestions cover the command name only: input starts with "/" and has
  // no whitespace yet. Anything else (args, plain text) closes the list.
  const trimmed = value.trim();
  const token =
    trimmed.startsWith("/") && !/\s/.test(trimmed) ? trimmed.slice(1) : null;
  const suggestions = useMemo(
    () => (token === null ? [] : suggest(token)),
    [token],
  );
  const listOpen = token !== null && !listDismissed && suggestions.length > 0;

  const acceptSuggestion = (name: string) => {
    setValue(`/${name}`);
    setListDismissed(true);
    setActiveIndex(-1);
    inputRef.current?.focus();
  };

  const submit = () => {
    const input = value.trim();
    if (input === "") return;
    onSubmit(input);
    setValue("");
    setHistory((previous) => [...previous, input]);
    setNav(initialHistoryNav);
    setListDismissed(false);
    setActiveIndex(-1);
  };

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      if (listOpen && activeIndex >= 0) {
        const selected = suggestions[activeIndex];
        if (selected) acceptSuggestion(selected.name);
        return;
      }
      submit();
      return;
    }
    if (event.key === "Tab") {
      if (token === null) return;
      event.preventDefault();
      const selected = (listOpen ? suggestions[activeIndex] : undefined) ?? suggestions[0];
      if (selected) acceptSuggestion(selected.name);
      return;
    }
    if (event.key === "Escape") {
      if (listOpen) {
        event.preventDefault();
        setListDismissed(true);
        setActiveIndex(-1);
      }
      return;
    }
    if (event.key === "ArrowUp") {
      if (listOpen && activeIndex > 0) {
        event.preventDefault();
        setActiveIndex(activeIndex - 1);
        return;
      }
      if (listOpen) {
        // Leaving the list: from here the arrows walk the history.
        setListDismissed(true);
      }
      const next = recallPrevious(nav, history, value);
      if (next !== nav) {
        event.preventDefault();
        setNav(next);
        if (next.index !== null) setValue(history[next.index] ?? "");
      }
      return;
    }
    if (event.key === "ArrowDown") {
      if (listOpen && activeIndex < suggestions.length - 1) {
        event.preventDefault();
        setActiveIndex(activeIndex >= 0 ? activeIndex + 1 : 0);
        return;
      }
      if (listOpen) return; // bottom of the list: keep the highlight
      const next = recallNext(nav, history);
      if (next !== nav) {
        event.preventDefault();
        setNav(next);
        setValue(next.index === null ? next.draft : (history[next.index] ?? ""));
      }
    }
  };

  return (
    <div className="shrink-0 border-t border-term-surface2 bg-term-surface px-4 py-3">
      <div className="relative mx-auto flex w-full max-w-3xl items-center gap-2 font-mono text-sm">
        <label htmlFor="term-prompt" className="sr-only">
          Terminal command
        </label>
        <span
          aria-hidden="true"
          className="select-none whitespace-nowrap text-term-green"
        >
          guest@astraa &gt;
        </span>
        <input
          ref={inputRef}
          id="term-prompt"
          type="text"
          role="combobox"
          aria-expanded={listOpen}
          aria-controls="term-suggestions"
          aria-autocomplete="list"
          aria-activedescendant={
            listOpen && activeIndex >= 0 ? `term-suggestion-${activeIndex}` : undefined
          }
          autoComplete="off"
          autoCapitalize="off"
          spellCheck={false}
          placeholder="/help"
          value={value}
          onChange={(event) => {
            setValue(event.target.value);
            setListDismissed(false);
            setActiveIndex(-1);
          }}
          onKeyDown={handleKeyDown}
          className="min-h-touch w-full min-w-0 bg-transparent text-term-fg outline-none placeholder:text-term-muted"
        />
        {listOpen && (
          <ul
            id="term-suggestions"
            role="listbox"
            aria-label="Command suggestions"
            className="absolute bottom-full left-0 right-0 z-10 mb-2 max-h-64 overflow-y-auto rounded-md border border-term-surface2 bg-term-surface py-1 shadow-lg"
          >
            {suggestions.map((command, index) => (
              <li
                key={command.name}
                id={`term-suggestion-${index}`}
                role="option"
                aria-selected={index === activeIndex}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => acceptSuggestion(command.name)}
                className={cn(
                  "flex min-h-touch cursor-default items-center gap-3 px-3 py-2 font-mono text-sm",
                  index === activeIndex
                    ? "bg-term-surface2 text-term-fg"
                    : "text-term-muted hover:bg-term-surface2",
                )}
              >
                <span className="shrink-0 text-term-accent">/{command.name}</span>
                <span className="min-w-0 truncate">{command.summary}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
