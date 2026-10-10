// components/snippet-generator/snippet-generator-client.tsx
"use client";

import { useCallback, useEffect, useRef } from "react";
import { Canvas } from "./canvas";
import { CanvasStatus } from "./canvas-status";
import { ModeToggle } from "./mode-toggle";
import { TopExport } from "./top-export";
import { CustomizeSheet, DesktopPanel, MobilePanelTrigger } from "./panel/panel";
import { FittedCanvas } from "./fitted-canvas";
import { selectedExportSize } from "@/lib/snippet-generator/capture";
import { useToolSettings } from "@/lib/stores/tool-settings";
import { useSnippetGenerator } from "@/lib/stores/snippet-generator";

export type SnippetGeneratorVariant = "page" | "panel";

interface SnippetGeneratorClientProps {
  variant?: SnippetGeneratorVariant;
}

export function SnippetGeneratorClient({
  variant = "page",
}: SnippetGeneratorClientProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const getCanvasNode = useCallback(() => canvasRef.current, []);
  const updateToolUsage = useToolSettings((s) => s.updateToolUsage);

  useEffect(() => {
    updateToolUsage("/tools/snippet-generator");
  }, [updateToolUsage]);

  // Terminal panels export the selected composition size, independent of the
  // fitted display bounds; the exporter multiplies by the requested scale.
  // The legacy page keeps its measured-bounds export (provider omitted).
  const getExportSize = useCallback(
    () =>
      variant === "panel"
        ? selectedExportSize(useSnippetGenerator.getState().aspect, 1)
        : undefined,
    [variant],
  );

  const controls = (
    <div className="flex items-center gap-3">
      <ModeToggle />
      <div className={variant === "panel" ? undefined : "hidden sm:block"}>
        <TopExport getNode={getCanvasNode} getExportSize={getExportSize} />
      </div>
    </div>
  );

  const body = (
    <>
      <div className="flex flex-col lg:flex-row gap-6 lg:gap-0">
        <div className="flex-1 min-w-0">
          <Canvas ref={canvasRef} />
          <CanvasStatus />
        </div>
        <DesktopPanel getCanvasNode={getCanvasNode} getExportSize={getExportSize} />
      </div>
      <MobilePanelTrigger getCanvasNode={getCanvasNode} getExportSize={getExportSize} />
    </>
  );

  if (variant === "panel") {
    return (
      <div className="w-full">
        {/* View switcher left, export action right — the placement rule the
            JSON panel already follows. */}
        <div className="mb-4 flex items-center justify-between gap-3">
          <ModeToggle />
          <TopExport getNode={getCanvasNode} getExportSize={getExportSize} />
        </div>
        <FittedCanvas captureRef={canvasRef} />
        <CanvasStatus />
        <div className="mt-4">
          <CustomizeSheet getCanvasNode={getCanvasNode} getExportSize={getExportSize} />
        </div>
      </div>
    );
  }

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
        {controls}
      </div>
      {body}
    </div>
  );
}
