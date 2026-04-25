"use client";

import { Toolbar } from "./toolbar";
import { FileSidebar } from "./file-sidebar";
import { Preview } from "./preview";
import { useMarkdownEditor } from "@/lib/stores/markdown-editor";

export function MarkdownEditorClient() {
  const viewMode = useMarkdownEditor((s) => s.viewMode);
  const currentFileId = useMarkdownEditor((s) => s.currentFileId);

  return (
    <div className="container max-w-7xl pt-20 pb-6">
      <div className="mb-3">
        <h1 className="text-2xl font-bold">Markdown Editor</h1>
        <p className="text-xs text-muted-foreground/70">
          All processing happens locally in your browser
        </p>
      </div>
      <Toolbar />
      <div className="mt-3 flex h-[70vh] overflow-hidden rounded-md border">
        <FileSidebar />
        <div className="flex flex-1 overflow-hidden">
          {viewMode !== "preview" && (
            <div className="flex-1 border-r p-4 text-sm text-muted-foreground">
              Editor coming in Task 9.
            </div>
          )}
          {viewMode !== "editor" && (
            <div className="flex-1 overflow-hidden">
              <Preview key={currentFileId} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
