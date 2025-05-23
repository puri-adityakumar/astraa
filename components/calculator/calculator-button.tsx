"use client"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface CalculatorButtonProps {
  value: string
  onClick: () => void
  variant?: "default" | "secondary" | "outline"
  className?: string
}

export function CalculatorButton({
  value,
  onClick,
  variant = "outline",
  className
}: CalculatorButtonProps) {
  return (
    <Button
      variant={variant}
      onClick={onClick}
      className={cn(
        "h-14 text-lg font-mono",
        className
      )}
    >
      {value}
    </Button>
  )
}