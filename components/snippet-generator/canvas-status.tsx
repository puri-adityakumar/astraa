"use client";

import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { useSnippetGenerator } from "@/lib/stores/snippet-generator";
import { LANGUAGES, THEMES } from "@/lib/snippet-generator/defaults";

function useFontsReady(): boolean {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let cancelled = false;
    if (typeof document === "undefined") return;
    document.fonts.ready.then(() => {
      if (!cancelled) setReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);
  return ready;
}

function estimateBytes(w: number, h: number, scale = 2): number {
  return Math.round((w * h * scale * scale * 0.18) | 0);
}

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

export function CanvasStatus() {
  const aspect = useSnippetGenerator((s) => s.aspect);
  const theme = useSnippetGenerator((s) => s.theme);
  const font = useSnippetGenerator((s) => s.font);
  const padding = useSnippetGenerator((s) => s.padding);
  const mode = useSnippetGenerator((s) => s.mode);
  const language = useSnippetGenerator((s) => s.language);
  const fontsReady = useFontsReady();

  const themeName = THEMES.find((t) => t.id === theme)?.name ?? theme;
  const langName = LANGUAGES.find((l) => l.id === language)?.name ?? language;
  const estSize = estimateBytes(aspect.w, aspect.h, 2);

  return (
    <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-md border bg-muted/30 px-3 py-1.5 text-[11px] text-muted-foreground">
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-mono tabular-nums text-foreground">
          {aspect.w} × {aspect.h}
        </span>
        {mode === "code" && (
          <>
            <Chip>{themeName}</Chip>
            <Chip>{langName}</Chip>
            <Chip>
              <span className="font-mono">{font.family}</span> · {font.size}px
            </Chip>
          </>
        )}
        <Chip>
          padding <span className="font-mono tabular-nums">{padding}</span>
        </Chip>
      </div>
      <div className="flex items-center gap-2">
        {fontsReady && (
          <Chip>
            <Check className="h-3 w-3 text-success" aria-hidden />
            fonts ready
          </Chip>
        )}
        <span className="font-mono tabular-nums">~ {formatBytes(estSize)} · 2×</span>
      </div>
    </div>
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-background px-2 py-0.5 text-[11px]">
      {children}
    </span>
  );
}
