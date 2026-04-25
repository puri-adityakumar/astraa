"use client";

import { useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { Toolbar } from "./toolbar";
import { FileSidebar } from "./file-sidebar";
import { Preview } from "./preview";
import { useMarkdownEditor } from "@/lib/stores/markdown-editor";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { processImageDrop } from "@/lib/markdown/image-utils";
import { cn } from "@/lib/utils";
import type { EditorHandle } from "./editor";

const Editor = dynamic(() => import("./editor").then((m) => m.Editor), {
  ssr: false,
  loading: () => (
    <div className="p-4 text-sm text-muted-foreground">Loading editor…</div>
  ),
});

export function MarkdownEditorClient() {
  const viewMode = useMarkdownEditor((s) => s.viewMode);
  const currentFileId = useMarkdownEditor((s) => s.currentFileId);
  const file = useMarkdownEditor((s) => s.files.find((f) => f.id === s.currentFileId));
  const updateContent = useMarkdownEditor((s) => s.updateContent);
  const editorRef = useRef<EditorHandle | null>(null);
  const { toast } = useToast();

  const setViewMode = useMarkdownEditor((s) => s.setViewMode);
  const toggleSidebar = useMarkdownEditor((s) => s.toggleSidebar);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const mod = e.ctrlKey || e.metaKey;
      if (!mod) return;
      const target = e.target;
      if (target instanceof HTMLElement) {
        const tag = target.tagName;
        if (tag === "INPUT" || tag === "TEXTAREA") return;
      }
      const key = e.key.toLowerCase();
      const handle = editorRef.current;
      if (key === "b") {
        e.preventDefault();
        handle?.wrapSelection("**");
      } else if (key === "i") {
        e.preventDefault();
        handle?.wrapSelection("*");
      } else if (key === "k") {
        e.preventDefault();
        const url = window.prompt("URL:");
        if (url) handle?.wrapSelection("[", `](${url})`);
      } else if (key === "p") {
        e.preventDefault();
        window.print();
      } else if (key === "s") {
        e.preventDefault();
        toast({ title: "Saved automatically" });
      } else if (key === "1") {
        e.preventDefault();
        setViewMode("editor");
      } else if (key === "2") {
        e.preventDefault();
        setViewMode("split");
      } else if (key === "3") {
        e.preventDefault();
        setViewMode("preview");
      } else if (key === "\\") {
        e.preventDefault();
        toggleSidebar();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setViewMode, toggleSidebar, toast]);

  const handleDrop = async (droppedFile: File) => {
    const result = await processImageDrop(droppedFile);
    if (result.kind === "ok") {
      editorRef.current?.insertAtCursor(`\n${result.markdown}\n`);
      if (result.warning) {
        toast({ title: "Large image", description: result.warning });
      }
    } else if (result.kind === "blocked") {
      toast({
        title: "Image rejected",
        description: result.reason,
        variant: "destructive",
      });
    } else if (result.kind === "error") {
      toast({
        title: "Couldn't read image",
        description: result.message,
        variant: "destructive",
      });
    }
    // ignored → silent no-op (matches the spec)
  };

  return (
    <div className="container max-w-7xl pt-20 pb-6">
      <div className="mb-3">
        <h1 className="text-2xl font-bold">Markdown Editor</h1>
        <p className="text-xs text-muted-foreground/70">
          All processing happens locally in your browser
        </p>
      </div>
      <Toolbar editorRef={editorRef} />
      <div className="mt-3 flex h-[70vh] overflow-hidden rounded-md border">
        <FileSidebar />
        <div className="flex flex-1 overflow-hidden">
          {/* Desktop: side-by-side */}
          <div className="hidden md:flex flex-1 overflow-hidden">
            {viewMode !== "preview" && (
              <div className="flex-1 border-r overflow-hidden print:hidden">
                <Editor
                  ref={editorRef}
                  value={file?.content ?? ""}
                  onChange={(v) => file && updateContent(file.id, v)}
                  onDropFile={handleDrop}
                />
              </div>
            )}
            <div
              className={cn(
                "flex-1 overflow-hidden print:block",
                viewMode === "editor" && "hidden",
              )}
            >
              <Preview key={currentFileId} />
            </div>
          </div>

          {/* Mobile: tabs */}
          <Tabs defaultValue="editor" className="md:hidden flex-1 flex flex-col">
            <TabsList className="m-2">
              <TabsTrigger value="editor">Editor</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
            </TabsList>
            <TabsContent value="editor" className="flex-1 overflow-hidden">
              <Editor
                ref={editorRef}
                value={file?.content ?? ""}
                onChange={(v) => file && updateContent(file.id, v)}
                onDropFile={handleDrop}
              />
            </TabsContent>
            <TabsContent value="preview" className="flex-1 overflow-hidden">
              <Preview key={currentFileId} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
