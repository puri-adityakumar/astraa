"use client";

import { ChevronRight, Copy, Pencil, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TreeRow as TreeRowType } from "@/lib/json/types";

type Props = {
  row: TreeRowType;
  onToggle: (path: string) => void;
  onCopyPath: (path: string) => void;
  onEdit: (path: string) => void;
  onAdd: (path: string) => void;
  onRemove: (path: string) => void;
};

const TYPE_COLOR: Record<string, string> = {
  string: "text-emerald-500",
  number: "text-amber-500",
  boolean: "text-violet-500",
  null: "text-zinc-500",
  object: "text-blue-500",
  array: "text-cyan-500",
};

export function TreeRow({ row, onToggle, onCopyPath, onEdit, onAdd, onRemove }: Props) {
  const isContainer = row.type === "object" || row.type === "array";
  return (
    <div
      role="treeitem"
      aria-expanded={row.hasChildren ? row.isExpanded : undefined}
      className={cn(
        "group flex items-center gap-1 px-2 py-1 text-xs font-mono",
        "hover:bg-muted/50 rounded",
      )}
      style={{ paddingLeft: 8 + row.depth * 16 }}
    >
      <button
        type="button"
        onClick={() => row.hasChildren && onToggle(row.path)}
        aria-label={row.isExpanded ? "Collapse" : "Expand"}
        className={cn(
          "h-4 w-4 flex items-center justify-center text-muted-foreground",
          row.hasChildren ? "visible" : "invisible",
        )}
      >
        <ChevronRight
          className={cn("h-3 w-3 transition-transform", row.isExpanded && "rotate-90")}
          aria-hidden
        />
      </button>
      <span className="text-foreground">
        {typeof row.key === "number"
          ? `[${row.key}]`
          : row.key === "root" && row.depth === 0
          ? "root"
          : row.key}
      </span>
      <span className="text-muted-foreground">:</span>
      <span className={cn("ml-1", TYPE_COLOR[row.type])}>{row.preview}</span>
      <div className="ml-auto flex items-center gap-0.5 opacity-0 group-hover:opacity-100">
        <RowAction label="Copy path" onClick={() => onCopyPath(row.path)}>
          <Copy className="h-3 w-3" />
        </RowAction>
        <RowAction label="Edit value" onClick={() => onEdit(row.path)}>
          <Pencil className="h-3 w-3" />
        </RowAction>
        {isContainer && (
          <RowAction label="Add child" onClick={() => onAdd(row.path)}>
            <Plus className="h-3 w-3" />
          </RowAction>
        )}
        {row.depth > 0 && (
          <RowAction label="Remove" onClick={() => onRemove(row.path)}>
            <Trash2 className="h-3 w-3 text-destructive" />
          </RowAction>
        )}
      </div>
    </div>
  );
}

function RowAction({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={cn(
        "h-6 w-6 inline-flex items-center justify-center rounded hover:bg-muted",
        "text-muted-foreground hover:text-foreground transition-colors duration-100 ease-out",
      )}
    >
      {children}
    </button>
  );
}
