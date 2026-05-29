// components/snippet-generator/panel/font-section.tsx
"use client";

import { cn } from "@/lib/utils";
import { FONTS } from "@/lib/snippet-generator/defaults";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useSnippetGenerator } from "@/lib/stores/snippet-generator";

export function FontSection() {
  const font = useSnippetGenerator((s) => s.font);
  const setFont = useSnippetGenerator((s) => s.setFont);

  return (
    <div className="space-y-3">
      <div>
        <Label>Font</Label>
        <div className="grid grid-cols-2 gap-1.5 pt-1">
          {FONTS.map((f) => {
            const active = font.family === f.family;
            return (
              <button
                key={f.family}
                onClick={() => setFont({ ...font, family: f.family })}
                aria-pressed={active}
                className={cn(
                  "flex flex-col items-start gap-0.5 px-2.5 py-2 text-left rounded-md border bg-background min-h-touch",
                  "transition-colors duration-100 ease-out",
                  active
                    ? "border-primary bg-primary/10"
                    : "border-border hover:bg-muted",
                )}
              >
                <span
                  className="text-xs font-medium text-foreground"
                  style={{ fontFamily: f.family }}
                >
                  {f.label}
                </span>
                <span
                  className="text-[10px] text-muted-foreground"
                  style={{ fontFamily: f.family }}
                >
                  const x = 1;
                </span>
              </button>
            );
          })}
        </div>
      </div>
      <div>
        <div className="flex items-baseline justify-between">
          <Label>Size</Label>
          <span className="text-[11px] tabular-nums text-muted-foreground">
            {font.size}px
          </span>
        </div>
        <Slider
          value={[font.size]}
          min={12}
          max={20}
          step={1}
          onValueChange={([v]) => setFont({ ...font, size: v ?? 14 })}
        />
      </div>
    </div>
  );
}
