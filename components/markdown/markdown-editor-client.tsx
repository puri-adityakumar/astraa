"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { FileText } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Toolbar } from "./toolbar";
import { Sidebar } from "./sidebar";
import { Dropzone } from "./dropzone";
import { ConfirmDialog } from "./confirm-dialog";
import { Preview } from "./preview";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { useMarkdownEditor } from "@/lib/stores/markdown-editor";
import { useToolSettings } from "@/lib/stores/tool-settings";
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

export type MarkdownEditorVariant = "page" | "panel";

interface MarkdownEditorClientProps {
  variant?: MarkdownEditorVariant;
}

export function MarkdownEditorClient({ variant = "page" }: MarkdownEditorClientProps) {
  const file = useMarkdownEditor((s) =>
    s.files.find((f) => f.id === s.currentId),
  );
  const files = useMarkdownEditor((s) => s.files);
  const mode = useMarkdownEditor((s) => s.mode);
  const draft = useMarkdownEditor((s) => s.draft);
  const sidebarOpen = useMarkdownEditor((s) => s.sidebarOpen);
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
  const [fullscreen, setFullscreen] = useState(false);

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

  // Panel-only: Radix AlertDialog has no trigger element here (controlled by
  // file-list rows), so dismissing it drops focus to <body>. Remember the
  // initiating control at open time (before the dialog mounts and grabs
  // focus) and put focus back on cancel. The page rendering keeps its
  // existing behaviour.
  const dialogReturnFocusRef = useRef<HTMLElement | null>(null);
  const armReturnFocus = useCallback(() => {
    if (variant !== "panel") return;
    dialogReturnFocusRef.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
  }, [variant]);
  const restoreDialogFocus = useCallback(() => {
    if (variant !== "panel") return;
    // Defer past the dialog unmount: the unmount removes the focused button
    // and the browser would otherwise leave focus on <body>.
    const el = dialogReturnFocusRef.current;
    dialogReturnFocusRef.current = null;
    if (el) window.setTimeout(() => el.focus(), 0);
  }, [variant]);
  const cancelPending = useCallback(() => {
    setPending(null);
    restoreDialogFocus();
  }, [restoreDialogFocus]);
  const cancelReplace = useCallback(() => {
    setPendingReplace(null);
    restoreDialogFocus();
  }, [restoreDialogFocus]);

  const tryIngest = useCallback(
    (raw: File) => {
      if (dirty) {
        armReturnFocus();
        setPendingReplace({ file: raw });
        return;
      }
      void ingestFile(raw);
    },
    [dirty, ingestFile, armReturnFocus],
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

  useEffect(() => {
    useToolSettings.getState().updateToolUsage("/tools/markdown");
  }, []);

  useEffect(() => {
    if (!fullscreen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setFullscreen(false);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [fullscreen]);

  const onToggleMode = useCallback(() => {
    if (mode === "edit") {
      if (dirty) {
        armReturnFocus();
        setPending({ kind: "view-toggle" });
        return;
      }
      setMode("view");
      return;
    }
    setMode("edit");
  }, [mode, dirty, setMode, armReturnFocus]);

  const onSelect = useCallback(
    (id: string) => {
      if (id === file?.id) return;
      if (dirty) {
        armReturnFocus();
        setPending({ kind: "switch", id });
        return;
      }
      selectFile(id);
    },
    [dirty, file?.id, selectFile, armReturnFocus],
  );

  const onDelete = useCallback(
    (id: string) => {
      armReturnFocus();
      setPending({ kind: "delete", id });
    },
    [armReturnFocus],
  );

  const confirmPending = useCallback(() => {
    if (!pending) return;
    if (pending.kind === "switch") {
      selectFile(pending.id);
    } else if (pending.kind === "view-toggle") {
      setMode("view");
    } else if (pending.kind === "delete") {
      deleteFile(pending.id);
    }
    dialogReturnFocusRef.current = null;
    setPending(null);
  }, [pending, selectFile, setMode, deleteFile]);

  const confirmReplace = useCallback(() => {
    if (pendingReplace) {
      void ingestFile(pendingReplace.file);
      dialogReturnFocusRef.current = null;
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
  const onExportPdf = () => {
    if (!file) return;
    const node = document.querySelector<HTMLDivElement>(".markdown-preview");
    exportAsPdf(file.name, node);
  };

  const pendingDescription = (() => {
    if (pending?.kind === "switch") return `Discard unsaved changes in "${file?.name}"?`;
    if (pending?.kind === "view-toggle") return `Discard unsaved changes in "${file?.name}"?`;
    if (pending?.kind === "delete") {
      const target = useMarkdownEditor.getState().files.find((f) => f.id === pending.id);
      return `Delete "${target?.name}"? This cannot be undone.`;
    }
    return "";
  })();

  const content = (
    <>
      {!file ? (
        <div className="space-y-8 py-8">
          <div className="flex justify-center">
            <Dropzone onPick={tryIngest} variant="empty" />
          </div>
          {files.length > 0 && (
            <div className="mx-auto w-full max-w-md space-y-3">
              <div className="flex items-center justify-between px-1">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Recent
                </h2>
                <span className="text-xs tabular-nums text-muted-foreground/70">
                  {files.length}/10
                </span>
              </div>
              <ul className="space-y-1">
                {files.slice(0, 5).map((f) => (
                  <li key={f.id}>
                    <button
                      type="button"
                      onClick={() => selectFile(f.id)}
                      className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm text-muted-foreground transition-colors hover:bg-muted/80 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <FileText className="h-4 w-4 shrink-0 text-muted-foreground/70" aria-hidden />
                      <span className="min-w-0 flex-1 truncate font-medium text-foreground">
                        {f.name}
                      </span>
                      <span className="shrink-0 text-xs text-muted-foreground/70">
                        {formatDistanceToNow(f.updatedAt, { addSuffix: true })}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ) : (
        <div
          className={cn(
            "grid gap-6 sm:gap-8 h-[72vh] min-h-[480px]",
            sidebarOpen && !fullscreen ? "md:grid-cols-[240px_1fr]" : "md:grid-cols-1",
          )}
        >
          {!fullscreen && <Sidebar onSelect={onSelect} onDelete={onDelete} />}
          <div
            className={cn(
              "flex min-w-0 flex-col overflow-hidden bg-card",
              fullscreen
                ? "fixed inset-0 z-50 h-screen w-screen rounded-none border-0 shadow-none"
                : "h-full rounded-xl border shadow-sm",
            )}
          >
            <Toolbar
              onPickFile={onPickFile}
              onToggleMode={onToggleMode}
              onSave={save}
              onExportMd={onExportMd}
              onExportHtml={onExportHtml}
              onExportPdf={onExportPdf}
              fullscreen={fullscreen}
              onToggleFullscreen={() => setFullscreen((v) => !v)}
            />
            <div className="flex-1 overflow-auto" ref={previewWrapRef}>
              {mode === "view" ? (
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
      )}

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
        onCancel={cancelPending}
      />

      <ConfirmDialog
        open={!!pendingReplace}
        title="Replace file"
        description={`Replace "${pendingReplace?.file.name}"? Unsaved edits will be lost.`}
        confirmLabel="Replace"
        onConfirm={confirmReplace}
        onCancel={cancelReplace}
      />
    </>
  );

  if (variant === "panel") {
    return <div className="w-full space-y-8">{content}</div>;
  }

  return (
    <div className="container px-4 sm:px-6 max-w-5xl pt-24 pb-12 space-y-8">
      <div className="space-y-4 text-center sm:text-left">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
          Markdown
        </h1>
        <p className="text-muted-foreground text-base sm:text-lg max-w-2xl">
          Drop a markdown file to view it. Toggle to edit, then export as .md, .html, or PDF.
        </p>
        <p className="text-xs text-muted-foreground/70">
          All processing happens locally in your browser
        </p>
      </div>

      {content}
    </div>
  );
}
