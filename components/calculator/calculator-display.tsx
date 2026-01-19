"use client";

interface CalculatorDisplayProps {
  value: string;
  expression: string;
}

export function CalculatorDisplay({
  value,
  expression,
}: CalculatorDisplayProps) {
  return (
    <div className="space-y-2 rounded-lg bg-muted/50 p-4 font-mono">
      <div className="h-6 text-right text-sm text-muted-foreground">
        {expression || "\u00A0"}
      </div>
      <div className="truncate text-right text-3xl">{value || "0"}</div>
    </div>
  );
}
