"use client";

import { useMarkdownEditor } from "@/lib/stores/markdown-editor";

export function MarkdownEditorClient() {
  const currentFile = useMarkdownEditor((state) =>
    state.files.find((f) => f.id === state.currentFileId),
  );
  return (
    <div className="container max-w-5xl pt-24 pb-12">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Markdown Editor</h1>
        <p className="text-muted-foreground">
          Write Markdown with live preview
        </p>
        <p className="text-xs text-muted-foreground/70">
          All processing happens locally in your browser
        </p>
      </div>
      <p className="text-sm">Current file: {currentFile?.title ?? "(none)"}</p>
    </div>
  );
}
