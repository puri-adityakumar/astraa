// components/snippet-generator/panel/layout-section.tsx
"use client";

import { cn } from "@/lib/utils";
import { ASPECT_PRESETS, PADDING_PRESETS } from "@/lib/snippet-generator/defaults";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { useSnippetGenerator } from "@/lib/stores/snippet-generator";
import type { Padding } from "@/lib/snippet-generator/types";

const ASPECT_GLYPH: Record<string, { w: number; h: number }> = {
  twitter:  { w: 20, h: 11 },
  square:   { w: 14, h: 14 },
  linkedin: { w: 22, h: 11 },
  story:    { w: 9,  h: 16 },
};

export function LayoutSection() {
  const s = useSnippetGenerator();

  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-baseline justify-between">
          <Label>Padding</Label>
          <span className="text-[11px] tabular-nums text-muted-foreground">
            {s.padding}px
          </span>
        </div>
        <div className="grid grid-cols-4 gap-1 p-0.5 rounded-md bg-muted">
          {PADDING_PRESETS.map((p) => (
            <button
              key={p}
              onClick={() => s.setPadding(p as Padding)}
              aria-pressed={s.padding === p}
              className={cn(
                "py-1.5 text-xs font-medium tabular-nums rounded min-h-touch",
                "transition-colors duration-100 ease-out",
                s.padding === p
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <Label htmlFor="line-numbers-toggle" className="cursor-pointer">
          Line numbers
        </Label>
        <Switch
          id="line-numbers-toggle"
          checked={s.lineNumbers}
          onCheckedChange={s.setLineNumbers}
        />
      </div>

      <div className="flex items-center justify-between">
        <Label htmlFor="shadow-toggle" className="cursor-pointer">
          Drop shadow
        </Label>
        <Switch
          id="shadow-toggle"
          checked={s.dropShadow}
          onCheckedChange={s.setDropShadow}
        />
      </div>

      <div>
        <div className="flex items-baseline justify-between">
          <Label>Aspect ratio</Label>
          <span className="text-[11px] tabular-nums text-muted-foreground">
            {s.aspect.w} × {s.aspect.h}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-1.5 pt-1">
          {ASPECT_PRESETS.map((a) => {
            const active = s.aspect.w === a.w && s.aspect.h === a.h;
            const glyph = ASPECT_GLYPH[a.id] ?? { w: 18, h: 10 };
            const ratio = (a.w / a.h).toFixed(2);
            const label =
              a.id === "square"
                ? "1 : 1"
                : a.id === "linkedin"
                ? "1.91 : 1"
                : a.id === "story"
                ? "9 : 16"
                : a.id === "twitter"
                ? "16 : 9"
                : `${ratio} : 1`;
            return (
              <button
                key={a.id}
                onClick={() => s.setAspect({ w: a.w, h: a.h })}
                aria-pressed={active}
                className={cn(
                  "flex items-center gap-2 px-2 py-2 text-xs rounded-md border bg-background min-h-touch text-left",
                  "transition-colors duration-100 ease-out",
                  active
                    ? "border-primary bg-primary/10"
                    : "border-border hover:bg-muted",
                )}
              >
                <span
                  className="flex-shrink-0 rounded-sm border border-border bg-muted"
                  style={{ width: glyph.w, height: glyph.h }}
                  aria-hidden
                />
                <span className="flex flex-col leading-tight">
                  <span className="text-xs font-medium text-foreground">
                    {a.name.replace(/\s+\d+(?::|×).*$/, "")}
                  </span>
                  <span className="text-[10px] tabular-nums text-muted-foreground">
                    {label}
                  </span>
                </span>
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
              className="tabular-nums"
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
              className="tabular-nums"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
