"use client";

import { Toolbar } from "./toolbar";
import { FileSidebar } from "./file-sidebar";

export function MarkdownEditorClient() {
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
        <div className="flex-1 p-4 text-sm text-muted-foreground">
          Editor + preview will appear here.
        </div>
      </div>
    </div>
  );
}
