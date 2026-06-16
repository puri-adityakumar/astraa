"use client"

import { Slider } from "@/components/ui/slider"

import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

interface PasswordOptionsProps {
  length: number[]
  options: {
    uppercase: boolean
    lowercase: boolean
    numbers: boolean
    symbols: boolean
  }
  onLengthChange: (value: number[]) => void
  onOptionsChange: (options: any) => void
}

export function PasswordOptions({
  length,
  options,
  onLengthChange,
  onOptionsChange,
}: PasswordOptionsProps) {
  const toggles = [
    { key: "uppercase", label: "ABC", title: "Uppercase" },
    { key: "lowercase", label: "abc", title: "Lowercase" },
    { key: "numbers", label: "123", title: "Numbers" },
    { key: "symbols", label: "#!@", title: "Symbols" },
  ] as const

  return (
    <div className="flex flex-col lg:flex-row gap-6 p-6 rounded-xl bg-muted/30 border border-border/50">
      {/* Length Slider Section - Takes more space */}
      <div className="flex-1 space-y-4">
        <div className="flex items-center justify-between">
          <Label className="font-medium text-muted-foreground">Length</Label>
          <span className="text-2xl font-bold tabular-nums text-foreground">
            {length[0]}
          </span>
        </div>
        <Slider
          value={length}
          onValueChange={onLengthChange}
          min={6}
          max={64}
          step={1}
          className="py-4"
        />
        <div className="flex justify-between text-xs text-muted-foreground px-1">
          <span>6</span>
          <span>12</span>
          <span>24</span>
          <span>32</span>
          <span>64</span>
        </div>
      </div>

      {/* Divider */}
      <div className="hidden lg:block w-px bg-border my-2" />
      <div className="block lg:hidden h-px bg-border" />

      {/* Options Toggles Section - Compact Grid */}
      <div className="flex-shrink-0 grid grid-cols-2 sm:grid-cols-4 gap-3 min-w-[320px]">
        {toggles.map(({ key, label, title }) => (
          <div
            key={key}
            onClick={() => {
              // Prevent disabling the last option
              const enabledCount = Object.values(options).filter(Boolean).length
              if (!options[key] || enabledCount > 1) {
                onOptionsChange({ ...options, [key]: !options[key] })
              }
            }}
            className={cn(
              "flex flex-col items-center justify-center p-3 rounded-lg border cursor-pointer transition-all duration-200 select-none",
              options[key]
                ? "bg-background border-foreground/30 text-foreground shadow-sm ring-1 ring-foreground/10"
                : "bg-muted/50 border-transparent text-muted-foreground hover:bg-muted/80"
            )}
          >
            <span className="text-lg font-bold mb-1">{label}</span>
            <span className="text-[10px] uppercase tracking-wider opacity-70">{title}</span>
          </div>
        ))}
      </div>
    </div>
  )
}