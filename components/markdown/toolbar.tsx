"use client";

import { useRef, useState } from "react";
import type { RefObject } from "react";
import {
  Bold,
  Italic,
  Link2,
  List,
  Code,
  Heading1,
  Quote,
  Search,
  Download,
  PanelLeft,
  Columns2,
  Edit,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { useMarkdownEditor } from "@/lib/stores/markdown-editor";
import type { EditorHandle } from "./editor";

type ToolbarProps = {
  editorRef: RefObject<EditorHandle | null>;
};

const downloadBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || "untitled";

export function Toolbar({ editorRef }: ToolbarProps) {
  const file = useMarkdownEditor((s) => s.files.find((f) => f.id === s.currentFileId));
  const viewMode = useMarkdownEditor((s) => s.viewMode);
  const setViewMode = useMarkdownEditor((s) => s.setViewMode);
  const toggleSidebar = useMarkdownEditor((s) => s.toggleSidebar);
  const renameFile = useMarkdownEditor((s) => s.renameFile);

  const exportMd = () => {
    if (!file) return;
    downloadBlob(
      new Blob([file.content], { type: "text/markdown" }),
      `${slugify(file.title)}.md`,
    );
  };

  const exportHtml = () => {
    if (!file) return;
    const previewEl = document.querySelector(".markdown-preview");
    const body = previewEl?.innerHTML ?? "";
    const html = `<!doctype html>
<html><head>
<meta charset="utf-8" />
<title>${file.title}</title>
<style>body{font-family:system-ui,sans-serif;max-width:760px;margin:2rem auto;padding:0 1rem;line-height:1.6;}pre{background:#f5f5f5;padding:1rem;border-radius:6px;overflow:auto;}code{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;}img{max-width:100%;}</style>
</head><body>${body}</body></html>`;
    downloadBlob(new Blob([html], { type: "text/html" }), `${slugify(file.title)}.html`);
  };

  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState(file?.title ?? "");
  const cancelledRef = useRef(false);

  const commitTitle = () => {
    if (cancelledRef.current) {
      cancelledRef.current = false;
      setEditingTitle(false);
      return;
    }
    if (file?.pinned) renameFile(file.id, titleDraft);
    setEditingTitle(false);
  };

  return (
    <div className="flex flex-wrap items-center gap-2 border-b py-2">
      <Button
        variant="ghost"
        size="icon"
        aria-label="Toggle file sidebar"
        onClick={toggleSidebar}
        className="min-h-touch min-w-touch"
      >
        <PanelLeft className="h-4 w-4" />
      </Button>

      {editingTitle && file?.pinned ? (
        <Input
          autoFocus
          value={titleDraft}
          onChange={(e) => setTitleDraft(e.target.value)}
          onBlur={commitTitle}
          onKeyDown={(e) => {
            if (e.key === "Enter") commitTitle();
            if (e.key === "Escape") {
              cancelledRef.current = true;
              setEditingTitle(false);
            }
          }}
          className="h-8 w-48"
        />
      ) : (
        <button
          type="button"
          className="text-sm font-medium hover:underline disabled:opacity-60"
          disabled={!file?.pinned}
          onClick={() => {
            setTitleDraft(file?.title ?? "");
            setEditingTitle(true);
          }}
          title={file?.pinned ? "Click to rename" : "Pin this draft to rename"}
        >
          {file?.title ?? "(no file)"}
        </button>
      )}

      <div className="ml-auto flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          aria-label="Bold"
          className="min-h-touch min-w-touch"
          onClick={() => editorRef.current?.wrapSelection("**")}
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Italic"
          className="min-h-touch min-w-touch"
          onClick={() => editorRef.current?.wrapSelection("*")}
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Heading"
          className="min-h-touch min-w-touch"
          onClick={() => editorRef.current?.insertAtCursor("\n## ")}
        >
          <Heading1 className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          aria-label="List"
          className="min-h-touch min-w-touch"
          onClick={() => editorRef.current?.insertAtCursor("\n- ")}
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Link"
          className="min-h-touch min-w-touch"
          onClick={() => {
            const url = window.prompt("URL:");
            if (url) editorRef.current?.wrapSelection("[", `](${url})`);
          }}
        >
          <Link2 className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Code"
          className="min-h-touch min-w-touch"
          onClick={() => editorRef.current?.wrapSelection("`")}
        >
          <Code className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Quote"
          className="min-h-touch min-w-touch"
          onClick={() => editorRef.current?.insertAtCursor("\n> ")}
        >
          <Quote className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Find"
          className="min-h-touch min-w-touch"
          onClick={() => editorRef.current?.openSearch()}
        >
          <Search className="h-4 w-4" />
        </Button>

        <Button
          variant={viewMode === "editor" ? "default" : "ghost"}
          size="icon"
          aria-label="Editor only"
          aria-pressed={viewMode === "editor"}
          onClick={() => setViewMode("editor")}
          className="min-h-touch min-w-touch"
        >
          <Edit className="h-4 w-4" />
        </Button>
        <Button
          variant={viewMode === "split" ? "default" : "ghost"}
          size="icon"
          aria-label="Split view"
          aria-pressed={viewMode === "split"}
          onClick={() => setViewMode("split")}
          className="min-h-touch min-w-touch"
        >
          <Columns2 className="h-4 w-4" />
        </Button>
        <Button
          variant={viewMode === "preview" ? "default" : "ghost"}
          size="icon"
          aria-label="Preview only"
          aria-pressed={viewMode === "preview"}
          onClick={() => setViewMode("preview")}
          className="min-h-touch min-w-touch"
        >
          <Eye className="h-4 w-4" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Export"
              className="min-h-touch min-w-touch"
            >
              <Download className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={exportMd}>Export as .md</DropdownMenuItem>
            <DropdownMenuItem onClick={exportHtml}>Export as .html</DropdownMenuItem>
            <DropdownMenuItem onClick={() => window.print()}>Print → PDF</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
