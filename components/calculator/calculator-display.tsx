"use client"

interface CalculatorDisplayProps {
  value: string
  expression: string
}

export function CalculatorDisplay({ value, expression }: CalculatorDisplayProps) {
  return (
    <div className="space-y-2 p-4 bg-muted/50 rounded-lg font-mono">
      <div className="text-sm text-muted-foreground h-6 text-right">
        {expression || "\u00A0"}
      </div>
      <div className="text-3xl text-right truncate">
        {value || "0"}
      </div>
    </div>
  )
}