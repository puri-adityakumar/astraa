"use client";

import { ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useRegexTester } from "@/lib/stores/regex-tester";
import { cn } from "@/lib/utils";
import { CopyButton } from "./copy-button";

interface ReplacePanelProps {
  previewResult: string;
  previewError: string | null;
  inputLength: number;
  isRunning: boolean;
}

export function ReplacePanel({
  previewResult,
  previewError,
  inputLength,
  isRunning,
}: ReplacePanelProps) {
  const pattern = useRegexTester((s) => s.pattern);
  const replacement = useRegexTester((s) => s.replacement);
  const setReplacement = useRegexTester((s) => s.setReplacement);
  const replaceOpen = useRegexTester((s) => s.replaceOpen);
  const setReplaceOpen = useRegexTester((s) => s.setReplaceOpen);

  const delta = previewResult.length - inputLength;

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
        <div id="regex-replace-body" className="space-y-3">
          <div className="space-y-1.5">
            <label htmlFor="regex-replacement" className="text-xs font-medium text-foreground">
              Replacement pattern{" "}
              <span className="text-muted-foreground">(supports $1, $2, $&lt;name&gt;)</span>
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
              <span className="text-xs font-medium text-foreground">Preview</span>
              <CopyButton
                text={previewResult}
                label="replacement result"
                size="icon"
                disabled={pattern.length === 0 || previewResult.length === 0 || isRunning}
              />
            </div>
            {previewError ? (
              <p className="text-xs text-destructive" role="alert">
                {previewError}
              </p>
            ) : (
              <Textarea
                readOnly
                value={previewResult}
                aria-label="Replacement preview"
                placeholder={isRunning ? "Checking pattern safely…" : ""}
                className={cn(
                  "font-mono text-sm leading-relaxed",
                  "min-h-[6rem] resize-y",
                  "bg-muted/30",
                )}
              />
            )}
            <p className="text-xs text-muted-foreground tabular-nums" aria-live="polite">
              Length: {inputLength.toLocaleString()} → {previewResult.length.toLocaleString()}{" "}
              (delta {delta > 0 ? `+${delta.toLocaleString()}` : delta.toLocaleString()})
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
