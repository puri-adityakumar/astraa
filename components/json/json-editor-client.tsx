"use client";

import { useEffect, useRef } from "react";
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
    <div className="container max-w-[1400px] pt-24 pb-12 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-fluid-xl font-semibold">JSON Editor</h1>
          <p className="text-sm text-muted-foreground">
            Edit, format, convert and generate types from JSON. Up to 50 MB,
            parsed off the main thread.
          </p>
        </div>
        <ViewTabs />
      </div>
      <Toolbar />
      {view === "text" && <TextView />}
      {view === "tree" && <TreeView />}
      {view === "convert" && <ConvertView />}
      {view === "generate" && <GenerateView />}
      <StatusBar />
      <DropzoneOverlay />
    </div>
  );
}
