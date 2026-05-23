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
        <div className="grid grid-cols-2 gap-2 pt-1">
          {FONTS.map((f) => (
            <button
              key={f.family}
              onClick={() => setFont({ ...font, family: f.family })}
              aria-pressed={font.family === f.family}
              className={cn(
                "px-2 py-2 text-xs rounded-md border min-h-touch",
                font.family === f.family ? "border-primary bg-primary/10" : "border-border",
              )}
              style={{ fontFamily: f.family }}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>
      <div>
        <Label>Size ({font.size}px)</Label>
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
