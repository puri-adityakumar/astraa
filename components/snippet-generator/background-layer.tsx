"use client";

import { useMemo } from "react";
import type { CSSProperties } from "react";
import { BG_PRESETS } from "@/lib/snippet-generator/defaults";
import type { BackgroundState } from "@/lib/snippet-generator/types";

function resolveBackground(bg: BackgroundState): CSSProperties {
  switch (bg.kind) {
    case "preset": {
      const preset = BG_PRESETS.find((p) => p.id === bg.id);
      return { background: preset?.css ?? "" };
    }
    case "solid":
      return { background: bg.color };
    case "gradient":
      return { background: `linear-gradient(${bg.angle}deg, ${bg.from}, ${bg.to})` };
    case "image":
      return {
        backgroundImage: `url(${bg.dataUrl})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        opacity: bg.opacity,
      };
  }
}

export function BackgroundLayer({ bg }: { bg: BackgroundState }) {
  const style = useMemo(() => resolveBackground(bg), [bg]);
  return <div className="absolute inset-0" style={style} aria-hidden />;
}
