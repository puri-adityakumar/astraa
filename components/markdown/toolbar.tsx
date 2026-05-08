"use client";

import {
  Download,
  PanelLeft,
  Edit,
  Eye,
  Save,
  Upload,
  FileText,
  Maximize2,
  Minimize2,
} from "lucide-react";
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
  fullscreen: boolean;
  onToggleFullscreen: () => void;
};

export function Toolbar({
  onPickFile,
  onToggleMode,
  onSave,
  onExportMd,
  onExportHtml,
  onExportPdf,
  fullscreen,
  onToggleFullscreen,
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
    <div className="flex items-center gap-2 border-b bg-muted/20 px-3 py-2 print:hidden">
      <Button
        variant="ghost"
        size="icon"
        aria-label="Toggle recent files"
        onClick={toggleSidebar}
        className="h-9 w-9 shrink-0"
      >
        <PanelLeft className="h-4 w-4" />
      </Button>

      <div className="flex min-w-0 flex-1 items-center gap-2">
        <FileText className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
        <span
          className={cn(
            "truncate text-sm",
            hasFile ? "font-medium" : "text-muted-foreground italic",
          )}
          title={file?.name}
        >
          {file?.name ?? "No file loaded"}
        </span>
        {dirty && (
          <span
            className="h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500"
            aria-label="Unsaved changes"
            title="Unsaved changes"
          />
        )}
      </div>

      <div className="flex items-center gap-1">
        {mode === "edit" && (
          <Button
            variant="default"
            size="sm"
            onClick={onSave}
            disabled={!dirty}
            className="h-9 gap-1.5"
          >
            <Save className="h-3.5 w-3.5" />
            Save
          </Button>
        )}

        <Button
          variant={mode === "edit" ? "secondary" : "ghost"}
          size="icon"
          aria-label={mode === "edit" ? "Switch to view" : "Switch to edit"}
          aria-pressed={mode === "edit"}
          onClick={onToggleMode}
          disabled={!hasFile}
          className="h-9 w-9"
        >
          {mode === "edit" ? <Eye className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
        </Button>

        <Button
          variant={fullscreen ? "secondary" : "ghost"}
          size="icon"
          aria-label={fullscreen ? "Exit full screen" : "Enter full screen"}
          aria-pressed={fullscreen}
          onClick={onToggleFullscreen}
          disabled={!hasFile}
          className="h-9 w-9"
          title={fullscreen ? "Exit full screen (Esc)" : "Full screen"}
        >
          {fullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
        </Button>

        <div className="mx-1 h-5 w-px bg-border" aria-hidden />

        <Button
          variant="ghost"
          size="icon"
          aria-label="Upload markdown file"
          onClick={onPickFile}
          className="h-9 w-9"
        >
          <Upload className="h-4 w-4" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Export"
              disabled={!hasFile}
              className="h-9 w-9"
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
