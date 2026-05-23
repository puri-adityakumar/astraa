// components/snippet-generator/panel/layout-section.tsx
"use client";

import { cn } from "@/lib/utils";
import { ASPECT_PRESETS, PADDING_PRESETS } from "@/lib/snippet-generator/defaults";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { useSnippetGenerator } from "@/lib/stores/snippet-generator";
import type { Padding } from "@/lib/snippet-generator/types";

export function LayoutSection() {
  const s = useSnippetGenerator();

  return (
    <div className="space-y-4">
      <div>
        <Label>Padding</Label>
        <div className="grid grid-cols-4 gap-2 pt-1">
          {PADDING_PRESETS.map((p) => (
            <button
              key={p}
              onClick={() => s.setPadding(p as Padding)}
              aria-pressed={s.padding === p}
              className={cn(
                "px-2 py-2 text-xs rounded-md border min-h-touch",
                s.padding === p ? "border-primary bg-primary/10" : "border-border",
              )}
            >
              {p}px
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <Label htmlFor="line-numbers-toggle">Line numbers</Label>
        <Switch
          id="line-numbers-toggle"
          checked={s.lineNumbers}
          onCheckedChange={s.setLineNumbers}
        />
      </div>

      <div className="flex items-center justify-between">
        <Label htmlFor="shadow-toggle">Drop shadow</Label>
        <Switch
          id="shadow-toggle"
          checked={s.dropShadow}
          onCheckedChange={s.setDropShadow}
        />
      </div>

      <div>
        <Label>Aspect ratio</Label>
        <div className="grid grid-cols-2 gap-2 pt-1">
          {ASPECT_PRESETS.map((a) => {
            const active = s.aspect.w === a.w && s.aspect.h === a.h;
            return (
              <button
                key={a.id}
                onClick={() => s.setAspect({ w: a.w, h: a.h })}
                aria-pressed={active}
                className={cn(
                  "px-2 py-2 text-xs rounded-md border min-h-touch",
                  active ? "border-primary bg-primary/10" : "border-border",
                )}
              >
                {a.name}
              </button>
            );
          })}
        </div>
        <div className="grid grid-cols-2 gap-2 pt-2">
          <div>
            <Label htmlFor="custom-w">Width</Label>
            <Input
              id="custom-w"
              type="number"
              min={100}
              max={4000}
              value={s.aspect.w}
              onChange={(e) => {
                const w = Math.max(100, Math.min(4000, Number(e.target.value) || 0));
                if (w > 0) s.setAspect({ ...s.aspect, w });
              }}
            />
          </div>
          <div>
            <Label htmlFor="custom-h">Height</Label>
            <Input
              id="custom-h"
              type="number"
              min={100}
              max={4000}
              value={s.aspect.h}
              onChange={(e) => {
                const h = Math.max(100, Math.min(4000, Number(e.target.value) || 0));
                if (h > 0) s.setAspect({ ...s.aspect, h });
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
