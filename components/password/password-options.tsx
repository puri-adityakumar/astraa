"use client";

import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

interface PasswordOptionsProps {
  length: number[];
  options: {
    uppercase: boolean;
    lowercase: boolean;
    numbers: boolean;
    symbols: boolean;
  };
  onLengthChange: (value: number[]) => void;
  onOptionsChange: (options: any) => void;
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
  ] as const;

  return (
    <div className="flex flex-col gap-6 rounded-xl border border-border/50 bg-muted/30 p-6 lg:flex-row">
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
        <div className="flex justify-between px-1 text-xs text-muted-foreground">
          <span>6</span>
          <span>12</span>
          <span>24</span>
          <span>32</span>
          <span>64</span>
        </div>
      </div>

      {/* Divider */}
      <div className="my-2 hidden w-px bg-border lg:block" />
      <div className="block h-px bg-border lg:hidden" />

      {/* Options Toggles Section - Compact Grid */}
      <div className="grid min-w-[320px] flex-shrink-0 grid-cols-2 gap-3 sm:grid-cols-4">
        {toggles.map(({ key, label, title }) => (
          <div
            key={key}
            onClick={() => {
              // Prevent disabling the last option
              const enabledCount =
                Object.values(options).filter(Boolean).length;
              if (!options[key] || enabledCount > 1) {
                onOptionsChange({ ...options, [key]: !options[key] });
              }
            }}
            className={cn(
              "flex cursor-pointer select-none flex-col items-center justify-center rounded-lg border p-3 transition-all duration-200",
              options[key]
                ? "border-primary/50 bg-background text-foreground shadow-sm ring-1 ring-primary/20"
                : "border-transparent bg-muted/50 text-muted-foreground hover:bg-muted/80",
            )}
          >
            <span className="mb-1 text-lg font-bold">{label}</span>
            <span className="text-[10px] uppercase tracking-wider opacity-70">
              {title}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
