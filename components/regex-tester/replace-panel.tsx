"use client";

import { useMemo } from "react";
import { ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useRegexTester } from "@/lib/stores/regex-tester";
import { compileRegex } from "@/lib/regex-tester/compile";
import { applyReplace } from "@/lib/regex-tester/replace";
import { cn } from "@/lib/utils";
import { CopyButton } from "./copy-button";

export function ReplacePanel() {
  const pattern = useRegexTester((s) => s.pattern);
  const flags = useRegexTester((s) => s.flags);
  const testString = useRegexTester((s) => s.testString);
  const replacement = useRegexTester((s) => s.replacement);
  const setReplacement = useRegexTester((s) => s.setReplacement);
  const replaceOpen = useRegexTester((s) => s.replaceOpen);
  const setReplaceOpen = useRegexTester((s) => s.setReplaceOpen);

  const previewState = useMemo(() => {
    if (pattern.length === 0) {
      return { result: "", error: null, delta: 0 };
    }
    const compiled = compileRegex(pattern, flags);
    if (!compiled.ok) {
      return { result: "", error: compiled.error, delta: 0 };
    }
    const r = applyReplace(compiled.regex, testString, replacement);
    if (!r.ok) {
      return { result: "", error: r.error, delta: 0 };
    }
    return {
      result: r.result,
      error: null,
      delta: r.result.length - testString.length,
    };
  }, [pattern, flags, testString, replacement]);

  return (
    <div className="rounded-md border border-border">
      <button
        type="button"
        onClick={() => setReplaceOpen(!replaceOpen)}
        aria-expanded={replaceOpen}
        aria-controls="regex-replace-body"
        className={cn(
          "w-full flex items-center justify-between gap-2 px-3 py-2",
          "text-sm font-medium text-foreground text-left",
          "min-h-touch",
          "hover:bg-muted/50 transition-colors duration-100 ease-out",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          "focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          "rounded-md",
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
        <div id="regex-replace-body" className="space-y-3 px-3 pb-3">
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
