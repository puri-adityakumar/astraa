// components/snippet-generator/panel/layout-section.tsx
"use client";

import { useState } from "react";
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

function clampDimension(raw: string): number {
  return Math.max(100, Math.min(4000, Number(raw) || 100));
}

export function LayoutSection() {
  const s = useSnippetGenerator();

  // Keep uncommitted text drafts so users can type intermediate values (e.g.
  // "8" on the way to "800") without the field snapping to the 100 minimum on
  // every keystroke. Clamp and commit to the store on blur/Enter instead.
  const [wDraft, setWDraft] = useState(String(s.aspect.w));
  const [hDraft, setHDraft] = useState(String(s.aspect.h));

  // Resync drafts when the store aspect changes elsewhere (e.g. a preset click).
  // setAspect produces a new object, so a reference check detects external edits.
  const [prevAspect, setPrevAspect] = useState(s.aspect);
  if (s.aspect !== prevAspect) {
    setPrevAspect(s.aspect);
    setWDraft(String(s.aspect.w));
    setHDraft(String(s.aspect.h));
  }

  const commitW = () => {
    const w = clampDimension(wDraft);
    setWDraft(String(w));
    if (w !== s.aspect.w) s.setAspect({ ...s.aspect, w });
  };
  const commitH = () => {
    const h = clampDimension(hDraft);
    setHDraft(String(h));
    if (h !== s.aspect.h) s.setAspect({ ...s.aspect, h });
  };

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
                    ? "border-foreground/30 bg-foreground/10"
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
              value={wDraft}
              onChange={(e) => setWDraft(e.target.value)}
              onBlur={commitW}
              onKeyDown={(e) => {
                if (e.key === "Enter") e.currentTarget.blur();
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
              value={hDraft}
              onChange={(e) => setHDraft(e.target.value)}
              onBlur={commitH}
              onKeyDown={(e) => {
                if (e.key === "Enter") e.currentTarget.blur();
              }}
              className="tabular-nums"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
