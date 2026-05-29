"use client";

import { useEffect, useRef } from "react";
import { ShieldCheck, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { ViewTabs } from "./view-tabs";
import { Toolbar } from "./toolbar";
import { StatusBar } from "./status-bar";
import { TextView } from "./text-view";
import { TreeView } from "./tree-view";
import { ConvertView } from "./convert-view";
import { GenerateView } from "./generate-view";
import { DropzoneOverlay } from "./dropzone-overlay";
import { useJsonEditor } from "@/lib/stores/json-editor";
import { useToolSettings } from "@/lib/stores/tool-settings";
import { createParseClient, type ParseClient } from "@/lib/json/parse-client";
import { logError } from "@/lib/error-handler";

export function JsonEditorClient() {
  const text = useJsonEditor((s) => s.text);
  const view = useJsonEditor((s) => s.view);
  const setParseResult = useJsonEditor((s) => s.setParseResult);
  const updateToolUsage = useToolSettings((s) => s.updateToolUsage);
  const clientRef = useRef<ParseClient | null>(null);
  const debounceRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    updateToolUsage("/tools/json");
  }, [updateToolUsage]);

  useEffect(() => {
    try {
      const worker = new Worker(
        new URL("@/lib/json/parse-worker.ts", import.meta.url),
        { type: "module" },
      );
      clientRef.current = createParseClient(worker);
    } catch (e) {
      logError(e, { context: "json-editor/worker-init" });
    }
    return () => {
      clientRef.current?.destroy();
    };
  }, []);

  useEffect(() => {
    window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(async () => {
      if (clientRef.current) {
        const result = await clientRef.current.parse(text);
        setParseResult(result.value, result.diagnostics);
      } else {
        try {
          const value = text.trim() === "" ? null : JSON.parse(text);
          setParseResult(value, []);
        } catch (e) {
          setParseResult(null, [
            {
              severity: "error",
              message: e instanceof Error ? e.message : String(e),
            },
          ]);
        }
      }
    }, 200);
    return () => window.clearTimeout(debounceRef.current);
  }, [text, setParseResult]);

  return (
    <div className="relative">
      {/* Subtle dotted background */}
      <div
        className={cn(
          "pointer-events-none absolute inset-0 -z-10",
          "[background-image:radial-gradient(circle_at_1px_1px,hsl(var(--muted-foreground)/0.08)_1px,transparent_0)]",
          "[background-size:24px_24px]",
        )}
        aria-hidden
      />
      <div
        className={cn(
          "pointer-events-none absolute -top-32 right-0 -z-10 h-[420px] w-[520px]",
          "rounded-full opacity-30 blur-3xl",
          "bg-[radial-gradient(closest-side,hsl(var(--primary)/0.35),transparent)]",
        )}
        aria-hidden
      />

      <div className="container max-w-[1400px] pt-24 pb-12 space-y-4">
        {/* Hero */}
        <header className="flex flex-wrap items-end justify-between gap-4 pb-2">
          <div className="space-y-2.5">
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "inline-flex h-5 items-center gap-1 rounded-sm border border-primary/30",
                  "bg-primary/10 px-1.5 font-mono text-[10px] uppercase tracking-[0.18em]",
                  "text-primary",
                )}
              >
                <ShieldCheck className="h-2.5 w-2.5" aria-hidden />
                Local-first
              </span>
              <span
                className={cn(
                  "inline-flex h-5 items-center gap-1 rounded-sm border border-amber-500/30",
                  "bg-amber-500/10 px-1.5 font-mono text-[10px] uppercase tracking-[0.18em]",
                  "text-amber-500",
                )}
              >
                <Zap className="h-2.5 w-2.5" aria-hidden />
                Worker-parsed
              </span>
              <span
                className={cn(
                  "hidden sm:inline-flex h-5 items-center rounded-sm border border-border/60",
                  "bg-muted/40 px-1.5 font-mono text-[10px] uppercase tracking-[0.18em]",
                  "text-muted-foreground",
                )}
              >
                Up to 50 MB
              </span>
            </div>
            <h1
              className={cn(
                "font-mono text-[clamp(2rem,5vw,3.25rem)] font-medium leading-[0.95] tracking-tight",
                "flex flex-wrap items-baseline gap-x-3",
              )}
            >
              <span className="text-muted-foreground/30">{"{"}</span>
              <span className="text-foreground">JSON</span>
              <span className="text-primary/90">Editor</span>
              <span className="text-muted-foreground/30">{"}"}</span>
            </h1>
            <p className="text-sm text-muted-foreground max-w-2xl">
              Edit, format, convert and generate types from JSON — entirely in your
              browser. Parsing runs in a Web Worker so the UI never blocks.
            </p>
          </div>
          <ViewTabs />
        </header>

        <Toolbar />

        <div className="space-y-3">
          {view === "text" && <TextView />}
          {view === "tree" && <TreeView />}
          {view === "convert" && <ConvertView />}
          {view === "generate" && <GenerateView />}
          <StatusBar />
        </div>

        <DropzoneOverlay />
      </div>
    </div>
  );
}
