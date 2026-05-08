"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { Toolbar } from "./toolbar";
import { Sidebar } from "./sidebar";
import { Dropzone } from "./dropzone";
import { ConfirmDialog } from "./confirm-dialog";
import { Preview } from "./preview";
import { useToast } from "@/components/ui/use-toast";
import { useMarkdownEditor } from "@/lib/stores/markdown-editor";
import { acceptMarkdownFile } from "@/lib/markdown/file-accept";
import { processImageDrop } from "@/lib/markdown/image-utils";
import { exportAsHtml, exportAsMarkdown, exportAsPdf } from "@/lib/markdown/export";
import { logError } from "@/lib/error-handler";
import type { EditorHandle } from "./editor";

const Editor = dynamic(() => import("./editor").then((m) => m.Editor), {
  ssr: false,
  loading: () => (
    <div className="p-4 text-sm text-muted-foreground">Loading editor…</div>
  ),
});

type PendingAction =
  | { kind: "switch"; id: string }
  | { kind: "view-toggle" }
  | { kind: "delete"; id: string };

export function MarkdownEditorClient() {
  const file = useMarkdownEditor((s) =>
    s.files.find((f) => f.id === s.currentId),
  );
  const mode = useMarkdownEditor((s) => s.mode);
  const draft = useMarkdownEditor((s) => s.draft);
  const uploadFile = useMarkdownEditor((s) => s.uploadFile);
  const selectFile = useMarkdownEditor((s) => s.selectFile);
  const deleteFile = useMarkdownEditor((s) => s.deleteFile);
  const setMode = useMarkdownEditor((s) => s.setMode);
  const setDraft = useMarkdownEditor((s) => s.setDraft);
  const save = useMarkdownEditor((s) => s.save);

  const editorRef = useRef<EditorHandle | null>(null);
  const filePickerRef = useRef<HTMLInputElement | null>(null);
  const previewWrapRef = useRef<HTMLDivElement | null>(null);
  const { toast } = useToast();

  const [pending, setPending] = useState<PendingAction | null>(null);
  const [pendingReplace, setPendingReplace] = useState<{ file: File } | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const dirty = draft !== null && file !== undefined && draft !== file.content;

  const ingestFile = useCallback(
    async (raw: File) => {
      const result = await acceptMarkdownFile(raw);
      if (result.kind === "rejected") {
        toast({ title: "Couldn't load file", description: result.reason, variant: "destructive" });
        return;
      }
      uploadFile(result.name, result.text);
      toast({ title: `Loaded ${result.name}` });
    },
    [toast, uploadFile],
  );

  const tryIngest = useCallback(
    (raw: File) => {
      if (dirty) {
        setPendingReplace({ file: raw });
        return;
      }
      void ingestFile(raw);
    },
    [dirty, ingestFile],
  );

  const onPickFile = useCallback(() => filePickerRef.current?.click(), []);

  useEffect(() => {
    const onDragOver = (e: DragEvent) => {
      if (e.dataTransfer?.types?.includes("Files")) {
        e.preventDefault();
        setDragOver(true);
      }
    };
    const onDragLeave = (e: DragEvent) => {
      if (e.target === document.documentElement) setDragOver(false);
    };
    const onDrop = (e: DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const dropped = e.dataTransfer?.files?.[0];
      if (!dropped) return;
      if (dropped.type.startsWith("image/")) return;
      tryIngest(dropped);
    };
    window.addEventListener("dragover", onDragOver);
    window.addEventListener("dragleave", onDragLeave);
    window.addEventListener("drop", onDrop);
    return () => {
      window.removeEventListener("dragover", onDragOver);
      window.removeEventListener("dragleave", onDragLeave);
      window.removeEventListener("drop", onDrop);
    };
  }, [tryIngest]);

  useEffect(() => {
    if (!dirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  const onToggleMode = useCallback(() => {
    if (mode === "edit") {
      if (dirty) {
        setPending({ kind: "view-toggle" });
        return;
      }
      setMode("view");
      return;
    }
    setMode("edit");
  }, [mode, dirty, setMode]);

  const onSelect = useCallback(
    (id: string) => {
      if (id === file?.id) return;
      if (dirty) {
        setPending({ kind: "switch", id });
        return;
      }
      selectFile(id);
    },
    [dirty, file?.id, selectFile],
  );

  const onDelete = useCallback((id: string) => {
    setPending({ kind: "delete", id });
  }, []);

  const confirmPending = useCallback(() => {
    if (!pending) return;
    if (pending.kind === "switch") {
      selectFile(pending.id);
    } else if (pending.kind === "view-toggle") {
      setMode("view");
    } else if (pending.kind === "delete") {
      deleteFile(pending.id);
    }
    setPending(null);
  }, [pending, selectFile, setMode, deleteFile]);

  const confirmReplace = useCallback(() => {
    if (pendingReplace) {
      void ingestFile(pendingReplace.file);
      setPendingReplace(null);
    }
  }, [pendingReplace, ingestFile]);

  const onImageDrop = useCallback(
    async (img: File) => {
      const r = await processImageDrop(img);
      if (r.kind === "ok") {
        editorRef.current?.insertAtCursor(`\n${r.markdown}\n`);
        if (r.warning) toast({ title: "Large image", description: r.warning });
      } else if (r.kind === "blocked") {
        toast({ title: "Image rejected", description: r.reason, variant: "destructive" });
      } else if (r.kind === "error") {
        toast({ title: "Couldn't read image", description: r.message, variant: "destructive" });
        logError(new Error(r.message), { context: "markdown.image-drop" });
      }
    },
    [toast],
  );

  const onExportMd = () => file && exportAsMarkdown(file.name, file.content);
  const onExportHtml = () => {
    if (!file) return;
    const node = document.querySelector<HTMLDivElement>(".markdown-preview");
    exportAsHtml(file.name, node);
  };
  const onExportPdf = () => exportAsPdf();

  const pendingDescription = (() => {
    if (pending?.kind === "switch") return `Discard unsaved changes in "${file?.name}"?`;
    if (pending?.kind === "view-toggle") return `Discard unsaved changes in "${file?.name}"?`;
    if (pending?.kind === "delete") {
      const target = useMarkdownEditor.getState().files.find((f) => f.id === pending.id);
      return `Delete "${target?.name}"? This cannot be undone.`;
    }
    return "";
  })();

  return (
    <div className="container max-w-5xl pt-24 pb-12 space-y-8">
      <div className="space-y-2 text-center sm:text-left">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Markdown</h1>
        <p className="text-sm text-muted-foreground">
          Drop, view, edit. All processing happens locally in your browser.
        </p>
      </div>

      <div className="relative h-[72vh] min-h-[480px]">
        <Sidebar onSelect={onSelect} onDelete={onDelete} />
        <div className="flex h-full flex-col overflow-hidden rounded-xl border bg-card shadow-sm">
          <Toolbar
            onPickFile={onPickFile}
            onToggleMode={onToggleMode}
            onSave={save}
            onExportMd={onExportMd}
            onExportHtml={onExportHtml}
            onExportPdf={onExportPdf}
          />
          <div className="flex-1 overflow-auto" ref={previewWrapRef}>
            {!file ? (
              <div className="flex h-full items-center justify-center p-6">
                <Dropzone onPick={tryIngest} variant="empty" />
              </div>
            ) : mode === "view" ? (
              <Preview content={file.content} />
            ) : (
              <Editor
                ref={editorRef}
                value={draft ?? ""}
                onChange={setDraft}
                onDropFile={onImageDrop}
              />
            )}
          </div>
        </div>
      </div>

      <Dropzone onPick={() => {}} variant="overlay" visible={dragOver} />

      <input
        ref={filePickerRef}
        type="file"
        accept=".md,.markdown,.txt,text/markdown,text/plain"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) tryIngest(f);
          e.target.value = "";
        }}
      />

      <ConfirmDialog
        open={!!pending}
        title={pending?.kind === "delete" ? "Delete file" : "Discard changes"}
        description={pendingDescription}
        confirmLabel={pending?.kind === "delete" ? "Delete" : "Discard"}
        onConfirm={confirmPending}
        onCancel={() => setPending(null)}
      />

      <ConfirmDialog
        open={!!pendingReplace}
        title="Replace file"
        description={`Replace "${pendingReplace?.file.name}"? Unsaved edits will be lost.`}
        confirmLabel="Replace"
        onConfirm={confirmReplace}
        onCancel={() => setPendingReplace(null)}
      />
    </div>
  );
}
