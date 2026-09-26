"use client";

import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
  type ChangeEvent,
  type KeyboardEvent,
} from "react";
import { cn } from "@/lib/utils";
import { tokenize } from "@/lib/regex-tester/tokenize";
import { tokenLabel } from "@/lib/regex-tester/token-labels";
import type { PatternToken } from "@/lib/regex-tester/types";

export interface PatternHighlightInputProps {
  value: string;
  onChange: (next: string) => void;
  placeholder?: string;
  "aria-label"?: string;
  "aria-describedby"?: string | undefined;
  "aria-invalid"?: boolean;
  invalid?: boolean;
  className?: string;
}

export interface PatternHighlightInputHandle {
  focus: () => void;
  insertAtCaret: (text: string) => void;
  getTokens: () => PatternToken[];
}

const TOKEN_CLASS: Record<PatternToken["type"], string> = {
  literal: "text-foreground",
  escape: "text-sky-500 dark:text-sky-400",
  charClassOpen: "text-emerald-500 dark:text-emerald-400",
  charClassClose: "text-emerald-500 dark:text-emerald-400",
  range: "text-emerald-500 dark:text-emerald-400",
  groupOpen: "text-violet-500 dark:text-violet-400",
  namedGroupOpen: "text-violet-500 dark:text-violet-400",
  nonCaptureGroupOpen: "text-violet-500 dark:text-violet-400",
  groupClose: "text-violet-500 dark:text-violet-400",
  lookaheadPositive: "text-fuchsia-500 dark:text-fuchsia-400",
  lookaheadNegative: "text-fuchsia-500 dark:text-fuchsia-400",
  lookbehindPositive: "text-fuchsia-500 dark:text-fuchsia-400",
  lookbehindNegative: "text-fuchsia-500 dark:text-fuchsia-400",
  alternation: "text-amber-500 dark:text-amber-400 font-bold",
  quantifier: "text-amber-500 dark:text-amber-400",
  anchorStart: "text-rose-500 dark:text-rose-400",
  anchorEnd: "text-rose-500 dark:text-rose-400",
  wordBoundary: "text-rose-500 dark:text-rose-400",
  nonWordBoundary: "text-rose-500 dark:text-rose-400",
  backreference: "text-sky-500 dark:text-sky-400",
};

export const PatternHighlightInput = forwardRef<
  PatternHighlightInputHandle,
  PatternHighlightInputProps
>(function PatternHighlightInput(
  {
    value,
    onChange,
    placeholder,
    invalid,
    className,
    "aria-label": ariaLabel,
    "aria-describedby": ariaDescribedBy,
    "aria-invalid": ariaInvalid,
  },
  ref,
) {
  const inputRef = useRef<HTMLInputElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  const tokens = useMemo(() => tokenize(value).tokens, [value]);

  useImperativeHandle(
    ref,
    () => ({
      focus: () => inputRef.current?.focus(),
      insertAtCaret: (text) => {
        const el = inputRef.current;
        if (!el) {
          onChange(value + text);
          return;
        }
        const start = el.selectionStart ?? value.length;
        const end = el.selectionEnd ?? value.length;
        const next = value.slice(0, start) + text + value.slice(end);
        onChange(next);
        requestAnimationFrame(() => {
          if (!inputRef.current) return;
          const pos = start + text.length;
          try {
            inputRef.current.focus();
            inputRef.current.setSelectionRange(pos, pos);
          } catch {
            // ignore selection errors
          }
        });
      },
      getTokens: () => tokens,
    }),
    [onChange, tokens, value],
  );

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      // Strip any newline a user might paste — pattern is single-line.
      const next = e.target.value.replace(/\r?\n/g, "");
      onChange(next);
    },
    [onChange],
  );

  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") e.preventDefault();
  }, []);

  const handleScroll = useCallback(() => {
    const overlay = overlayRef.current;
    const el = inputRef.current;
    if (!overlay || !el) return;
    overlay.scrollLeft = el.scrollLeft;
  }, []);

  return (
    <div className={cn("relative flex-1", className)}>
      <div
        ref={overlayRef}
        aria-hidden="true"
        className={cn(
          "absolute inset-0 overflow-hidden whitespace-pre",
          "rounded-md border border-transparent",
          "px-3 py-2 font-mono text-sm leading-6",
          "pointer-events-none select-none",
        )}
      >
        {tokens.length === 0 ? (
          <span className="text-muted-foreground/50">{placeholder}</span>
        ) : (
          tokens.map((token) => {
            const { label, detail } = tokenLabel(token);
            return (
              <span
                key={token.id}
                title={`${label} — ${detail}`}
                className={TOKEN_CLASS[token.type]}
              >
                {token.value}
              </span>
            );
          })
        )}
      </div>
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onScroll={handleScroll}
        placeholder={placeholder}
        aria-label={ariaLabel}
        aria-describedby={ariaDescribedBy}
        aria-invalid={ariaInvalid}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
        className={cn(
          "relative w-full bg-transparent caret-foreground text-transparent",
          "rounded-md border border-input",
          "px-3 py-2 font-mono text-sm leading-6 min-h-touch",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          "focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          "placeholder:text-transparent",
          invalid && "border-destructive focus-visible:ring-destructive",
        )}
      />
    </div>
  );
});
