"use client";

import { Toolbar } from "./toolbar";
import { useMarkdownEditor } from "@/lib/stores/markdown-editor";

export function MarkdownEditorClient() {
  const currentFile = useMarkdownEditor((s) =>
    s.files.find((f) => f.id === s.currentFileId),
  );
  return (
    <div className="container max-w-7xl pt-20 pb-6">
      <div className="mb-3">
        <h1 className="text-2xl font-bold">Markdown Editor</h1>
        <p className="text-xs text-muted-foreground/70">
          All processing happens locally in your browser
        </p>
      </div>
      <Toolbar />
      <div className="mt-3 rounded-md border p-4 text-sm text-muted-foreground">
        Editor + preview will appear here. Current file: {currentFile?.title ?? "(none)"}
      </div>
    </div>
  );
}
