"use client";

import { useCallback } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useRegexTester } from "@/lib/stores/regex-tester";
import type { RegexFlag } from "@/lib/regex-tester/types";
import { cn } from "@/lib/utils";

type FlagInfo = {
  flag: RegexFlag;
  label: string;
  description: string;
};

const FLAGS: FlagInfo[] = [
  { flag: "g", label: "g", description: "Global — find all matches" },
  { flag: "i", label: "i", description: "Ignore case" },
  { flag: "m", label: "m", description: "Multiline — ^ and $ match line breaks" },
  { flag: "s", label: "s", description: "Dotall — . matches newlines" },
  { flag: "u", label: "u", description: "Unicode — full Unicode support" },
  { flag: "y", label: "y", description: "Sticky — match from lastIndex only" },
];

export function FlagChips() {
  const flags = useRegexTester((s) => s.flags);
  const toggleFlag = useRegexTester((s) => s.toggleFlag);

  const handleToggle = useCallback(
    (flag: RegexFlag) => () => toggleFlag(flag),
    [toggleFlag],
  );

  return (
    <div
      role="group"
      aria-label="Regex flags"
      className="flex flex-wrap items-center gap-2"
    >
      {FLAGS.map(({ flag, label, description }) => {
        const active = flags.includes(flag);
        return (
          <Tooltip key={flag} delayDuration={150}>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={handleToggle(flag)}
                aria-pressed={active}
                aria-label={`${description} (flag ${flag})`}
                className={cn(
                  "min-h-touch min-w-touch inline-flex items-center justify-center",
                  "rounded-md border px-3 text-sm font-mono font-medium",
                  "transition-colors focus-visible:outline-none focus-visible:ring-2",
                  "focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background",
                  active
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background text-muted-foreground border-input hover:bg-accent hover:text-accent-foreground",
                )}
              >
                {label}
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom">{description}</TooltipContent>
          </Tooltip>
        );
      })}
    </div>
  );
}
