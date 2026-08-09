// components/snippet-generator/snippet-generator-client.tsx
"use client";

import { useCallback, useRef } from "react";
import { Canvas } from "./canvas";
import { CanvasStatus } from "./canvas-status";
import { ModeToggle } from "./mode-toggle";
import { TopExport } from "./top-export";
import { DesktopPanel, MobilePanelTrigger } from "./panel/panel";

export function SnippetGeneratorClient() {
  const canvasRef = useRef<HTMLDivElement>(null);
  const getCanvasNode = useCallback(() => canvasRef.current, []);

  return (
    <div className="mx-auto max-w-[1400px] pb-8">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b pb-8">
        <div className="min-w-0">
          <h1 className="text-fluid-xl font-semibold">Code Snippet Generator</h1>
          <p className="text-sm text-muted-foreground">
            Turn code or a screenshot into a styled PNG. Processed in this browser.
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
