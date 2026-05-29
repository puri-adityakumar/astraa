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
  string: "text-emerald-400",
  number: "text-amber-400",
  boolean: "text-violet-400",
  null: "text-zinc-500",
  object: "text-sky-400",
  array: "text-cyan-400",
};

const TYPE_GLYPH: Record<string, string> = {
  string: "str",
  number: "num",
  boolean: "bool",
  null: "null",
  object: "obj",
  array: "arr",
};

export function TreeRow({
  row,
  onToggle,
  onCopyPath,
  onEdit,
  onAdd,
  onRemove,
}: Props) {
  const isContainer = row.type === "object" || row.type === "array";
  return (
    <div
      role="treeitem"
      aria-expanded={row.hasChildren ? row.isExpanded : undefined}
      aria-selected={false}
      className={cn(
        "group relative flex items-center gap-1 px-2 py-1",
        "text-xs font-mono",
        "transition-colors duration-100 ease-out",
        "hover:bg-muted/40 rounded",
      )}
      style={{ paddingLeft: 8 + row.depth * 16 }}
    >
      {row.depth > 0 && (
        <span
          className="absolute top-0 bottom-0 w-px bg-border/40"
          style={{ left: 8 + (row.depth - 1) * 16 + 6 }}
          aria-hidden
        />
      )}
      <button
        type="button"
        onClick={() => row.hasChildren && onToggle(row.path)}
        aria-label={row.isExpanded ? "Collapse" : "Expand"}
        className={cn(
          "relative z-10 h-4 w-4 flex items-center justify-center rounded-sm",
          "text-muted-foreground/70 hover:text-foreground",
          "transition-colors duration-100 ease-out",
          row.hasChildren ? "visible" : "invisible",
        )}
      >
        <ChevronRight
          className={cn(
            "h-3 w-3 transition-transform duration-100 ease-out",
            row.isExpanded && "rotate-90",
          )}
          aria-hidden
        />
      </button>
      <span
        className={cn(
          "inline-flex h-4 items-center px-1 mr-1 rounded-sm",
          "text-[9px] font-medium uppercase tracking-wider opacity-60",
          "border border-border/50 bg-background/60",
          TYPE_COLOR[row.type],
        )}
        aria-hidden
      >
        {TYPE_GLYPH[row.type] ?? row.type}
      </span>
      <span className="text-foreground/90">
        {typeof row.key === "number"
          ? `[${row.key}]`
          : row.key === "root" && row.depth === 0
            ? "root"
            : row.key}
      </span>
      <span className="text-muted-foreground/60">:</span>
      <span className={cn("ml-1 truncate", TYPE_COLOR[row.type])}>
        {row.preview}
      </span>
      <div
        className={cn(
          "ml-auto flex items-center gap-0.5",
          "opacity-0 translate-x-1 group-hover:opacity-100 group-hover:translate-x-0",
          "transition-all duration-150 ease-out",
          "pointer-events-none group-hover:pointer-events-auto",
        )}
      >
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
        "h-6 w-6 inline-flex items-center justify-center rounded",
        "text-muted-foreground/80 hover:text-foreground hover:bg-muted/70",
        "transition-colors duration-100 ease-out",
      )}
    >
      {children}
    </button>
  );
}
