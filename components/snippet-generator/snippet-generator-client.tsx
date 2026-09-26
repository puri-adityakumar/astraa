// components/snippet-generator/snippet-generator-client.tsx
"use client";

import { useCallback, useEffect, useRef } from "react";
import { Canvas } from "./canvas";
import { CanvasStatus } from "./canvas-status";
import { ModeToggle } from "./mode-toggle";
import { TopExport } from "./top-export";
import { DesktopPanel, MobilePanelTrigger } from "./panel/panel";
import { useToolSettings } from "@/lib/stores/tool-settings";

export function SnippetGeneratorClient() {
  const canvasRef = useRef<HTMLDivElement>(null);
  const getCanvasNode = useCallback(() => canvasRef.current, []);
  const updateToolUsage = useToolSettings((s) => s.updateToolUsage);

  useEffect(() => {
    updateToolUsage("/tools/snippet-generator");
  }, [updateToolUsage]);

  return (
    <div className="container max-w-[1400px] pt-24 pb-12">
      <div className="flex flex-wrap items-center justify-between mb-6 gap-4">
        <div className="min-w-0">
          <h1 className="text-fluid-xl font-semibold">Code Snippet Generator</h1>
          <p className="text-sm text-muted-foreground">
            Make shareable code or screenshot images. All processing happens
            locally in your browser.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <ModeToggle />
          <div className="hidden sm:block">
            <TopExport getNode={getCanvasNode} />
          </div>
        </div>
      </div>
      <div className="flex flex-col lg:flex-row gap-6 lg:gap-0">
        <div className="flex-1 min-w-0">
          <Canvas ref={canvasRef} />
          <CanvasStatus />
        </div>
        <DesktopPanel getCanvasNode={getCanvasNode} />
      </div>
      <MobilePanelTrigger getCanvasNode={getCanvasNode} />
    </div>
  );
}
