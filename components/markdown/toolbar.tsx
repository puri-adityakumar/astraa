"use client";

import { Download, PanelLeft, Edit, Eye, Save, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { useMarkdownEditor } from "@/lib/stores/markdown-editor";
import { cn } from "@/lib/utils";

type ToolbarProps = {
  onPickFile: () => void;
  onToggleMode: () => void;
  onSave: () => void;
  onExportMd: () => void;
  onExportHtml: () => void;
  onExportPdf: () => void;
};

export function Toolbar({
  onPickFile,
  onToggleMode,
  onSave,
  onExportMd,
  onExportHtml,
  onExportPdf,
}: ToolbarProps) {
  const file = useMarkdownEditor((s) =>
    s.files.find((f) => f.id === s.currentId),
  );
  const mode = useMarkdownEditor((s) => s.mode);
  const draft = useMarkdownEditor((s) => s.draft);
  const toggleSidebar = useMarkdownEditor((s) => s.toggleSidebar);

  const dirty = draft !== null && file !== undefined && draft !== file.content;
  const hasFile = !!file;

  return (
    <div className="flex flex-wrap items-center gap-2 border-b py-2 px-2 print:hidden">
      <Button
        variant="ghost"
        size="icon"
        aria-label="Toggle recent files"
        onClick={toggleSidebar}
        className="min-h-touch min-w-touch"
      >
        <PanelLeft className="h-4 w-4" />
      </Button>

      <div className="flex min-w-0 items-center gap-2">
        <span className="truncate text-sm font-medium" title={file?.name}>
          {file?.name ?? "No file"}
        </span>
        {dirty && (
          <span
            className="h-2 w-2 rounded-full bg-amber-500"
            aria-label="Unsaved changes"
            title="Unsaved changes"
          />
        )}
      </div>

      <div className="ml-auto flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          aria-label="Upload markdown file"
          onClick={onPickFile}
          className="min-h-touch min-w-touch"
        >
          <Upload className="h-4 w-4" />
        </Button>

        <Button
          variant={mode === "edit" ? "default" : "ghost"}
          size="icon"
          aria-label={mode === "edit" ? "Switch to view" : "Switch to edit"}
          aria-pressed={mode === "edit"}
          onClick={onToggleMode}
          disabled={!hasFile}
          className="min-h-touch min-w-touch"
        >
          {mode === "edit" ? <Eye className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
        </Button>

        {mode === "edit" && (
          <Button
            variant="default"
            size="sm"
            onClick={onSave}
            disabled={!dirty}
            className={cn("min-h-touch")}
          >
            <Save className="mr-1 h-4 w-4" />
            Save
          </Button>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Export"
              disabled={!hasFile}
              className="min-h-touch min-w-touch"
            >
              <Download className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onExportMd}>Export as .md</DropdownMenuItem>
            <DropdownMenuItem onClick={onExportHtml}>Export as .html</DropdownMenuItem>
            <DropdownMenuItem onClick={onExportPdf}>Print → PDF</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
