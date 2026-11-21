"use client";

import { memo } from "react";
import { cn } from "@/lib/utils";

const FULL_SIZE_READOUT_LIMIT = 16;

interface CalculatorDisplayProps {
  value: string;
  expression: string;
}

export const CalculatorDisplay = memo(function CalculatorDisplay({
  value,
  expression,
}: CalculatorDisplayProps) {
  const readout = value || "0";

  return (
    <div className="space-y-2 p-4 bg-muted/50 rounded-lg font-mono">
      <div className="text-sm text-muted-foreground h-6 text-right">
        {expression || "\u00A0"}
      </div>
      <div
        className={cn(
          "text-right break-all",
          readout.length > FULL_SIZE_READOUT_LIMIT ? "text-xl sm:text-3xl" : "text-3xl",
        )}
      >
        {readout}
      </div>
    </div>
  );
});
