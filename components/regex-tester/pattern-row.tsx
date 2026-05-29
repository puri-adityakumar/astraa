"use client";

import { useCallback } from "react";
import { AlertCircle, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { CopyButton } from "./copy-button";
import { FlagChips } from "./flag-chips";
import { useRegexTester } from "@/lib/stores/regex-tester";
import { cn } from "@/lib/utils";

export interface PatternRowProps {
  error: string | null;
}

export function PatternRow({ error }: PatternRowProps) {
  const pattern = useRegexTester((s) => s.pattern);
  const flags = useRegexTester((s) => s.flags);
  const setPattern = useRegexTester((s) => s.setPattern);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setPattern(e.target.value);
    },
    [setPattern],
  );

  const literal = `/${pattern}/${flags}`;
  const hasError = Boolean(error);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <span
          aria-hidden="true"
          className="font-mono text-lg text-muted-foreground select-none"
        >
          /
        </span>
        <Input
          type="text"
          value={pattern}
          onChange={handleChange}
          placeholder="Enter a regular expression"
          aria-label="Regular expression pattern"
          aria-invalid={hasError}
          aria-describedby={hasError ? "pattern-error" : undefined}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          className={cn(
            "font-mono text-sm flex-1 min-h-touch",
            hasError && "border-destructive focus-visible:ring-destructive",
          )}
        />
        <span
          aria-hidden="true"
          className="font-mono text-lg text-muted-foreground select-none"
        >
          /
        </span>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <FlagChips />
        <div className="flex items-center gap-2">
          <CopyButton
            text={literal}
            label="regex literal"
            size="icon"
          />
          <Tooltip delayDuration={150}>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="icon"
                disabled
                aria-label="Share link (coming soon)"
                className="shrink-0 min-h-touch min-w-touch"
              >
                <Share2 className="h-4 w-4" aria-hidden="true" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">Share link (coming soon)</TooltipContent>
          </Tooltip>
        </div>
      </div>

      {hasError && (
        <p
          id="pattern-error"
          role="alert"
          className="flex items-start gap-2 text-sm text-destructive"
        >
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
}
