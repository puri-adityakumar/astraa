"use client";

import { useCallback } from "react";
import { ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useRegexTester } from "@/lib/stores/regex-tester";
import { runReplaceSafe } from "@/lib/regex-tester/redos-client";
import type { ReplaceResult } from "@/lib/regex-tester/replace";
import { cn } from "@/lib/utils";
import { CopyButton } from "./copy-button";
import { useRegexWorker } from "./use-regex-worker";

const EMPTY_PREVIEW: ReplaceResult = { ok: true, result: "" };

export function ReplacePanel() {
  const pattern = useRegexTester((s) => s.pattern);
  const flags = useRegexTester((s) => s.flags);
  const testString = useRegexTester((s) => s.testString);
  const replacement = useRegexTester((s) => s.replacement);
  const setReplacement = useRegexTester((s) => s.setReplacement);
  const replaceOpen = useRegexTester((s) => s.replaceOpen);
  const setReplaceOpen = useRegexTester((s) => s.setReplaceOpen);

  const previewTask = useCallback(async (signal: AbortSignal) => {
    if (!replaceOpen || pattern.length === 0) return EMPTY_PREVIEW;
    return runReplaceSafe(pattern, flags, testString, replacement, signal);
  }, [pattern, flags, testString, replacement, replaceOpen]);
  const { value, error, pending } = useRegexWorker(previewTask, EMPTY_PREVIEW);
  const previewState = {
    result: value.ok ? value.result : "",
    error: error ?? (value.ok ? null : value.error),
    delta: value.ok ? value.result.length - testString.length : 0,
  };

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={() => setReplaceOpen(!replaceOpen)}
        aria-expanded={replaceOpen}
        aria-controls="regex-replace-body"
        className={cn(
          "w-full flex items-center justify-between gap-2",
          "text-sm font-medium text-foreground text-left",
          "min-h-touch -mx-1 px-1 rounded",
          "hover:text-foreground/80 transition-colors duration-100 ease-out",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          "focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        )}
      >
        <span>Replace mode</span>
        <ChevronRight
          className={cn(
            "h-4 w-4 text-muted-foreground transition-transform duration-150 ease-out",
            replaceOpen && "rotate-90",
          )}
          aria-hidden="true"
        />
      </button>

      {replaceOpen && (
        <div id="regex-replace-body" className="space-y-3" aria-busy={pending}>
          {pending && <p role="status" className="text-xs text-muted-foreground">Replacing…</p>}
          <div className="space-y-1.5">
            <label
              htmlFor="regex-replacement"
              className="text-xs font-medium text-foreground"
            >
              Replacement pattern{" "}
              <span className="text-muted-foreground">
                (supports $1, $2, $&lt;name&gt;)
              </span>
            </label>
            <Input
              id="regex-replacement"
              value={replacement}
              onChange={(e) => setReplacement(e.target.value)}
              placeholder="$1-replaced"
              spellCheck={false}
              autoCorrect="off"
              autoCapitalize="off"
              className="font-mono text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-medium text-foreground">
                Preview
              </span>
              <CopyButton
                text={previewState.result}
                label="replacement result"
                size="icon"
                disabled={
                  pending ||
                  previewState.error !== null ||
                  pattern.length === 0 ||
                  previewState.result.length === 0
                }
              />
            </div>
            {previewState.error ? (
              <p className="text-xs text-destructive" role="alert">
                {previewState.error}
              </p>
            ) : (
              <Textarea
                readOnly
                value={previewState.result}
                aria-label="Replacement preview"
                className={cn(
                  "font-mono text-sm leading-relaxed",
                  "min-h-[6rem] resize-y",
                  "bg-muted/30",
                )}
              />
            )}
            <p
              className="text-xs text-muted-foreground tabular-nums"
              aria-live="polite"
            >
              Length: {testString.length.toLocaleString()} →{" "}
              {previewState.result.length.toLocaleString()} (delta{" "}
              {previewState.delta > 0
                ? `+${previewState.delta.toLocaleString()}`
                : previewState.delta.toLocaleString()}
              )
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
