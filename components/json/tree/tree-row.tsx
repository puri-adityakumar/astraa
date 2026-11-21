"use client";

import { useState } from "react";
import { ChevronRight, Copy, Pencil, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { JsonValue, TreeRow as TreeRowType } from "@/lib/json/types";
import { MAX_TREE_DEPTH } from "@/lib/json/flatten";
import { TreeEditPopover } from "./tree-edit-popover";
import { TreeAddMenu } from "./tree-add-menu";

type Props = {
  row: TreeRowType;
  onToggle: (path: string) => void;
  onCopyPath: (path: string) => void;
  onEditSave: (path: string, value: JsonValue) => void;
  onAddChild: (path: string, key: string | null, value: string) => void;
  onRemove: (path: string) => void;
};

const TYPE_COLOR: Record<string, string> = {
  string: "text-emerald-500",
  number: "text-amber-500",
  boolean: "text-violet-500",
  null: "text-zinc-500",
  object: "text-sky-500",
  array: "text-cyan-500",
};

const ROW_ACTION_CLASS = cn(
  "h-6 w-6 inline-flex items-center justify-center rounded",
  "text-muted-foreground hover:text-foreground hover:bg-muted",
  "transition-colors duration-100 ease-out",
);

const INDENT_PX = 16;
const MAX_INDENT_DEPTH = 16;

export function TreeRow({
  row,
  onToggle,
  onCopyPath,
  onEditSave,
  onAddChild,
  onRemove,
}: Props) {
  const isContainer = row.type === "object" || row.type === "array";
  const [editOpen, setEditOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const extraDepth = row.depth - MAX_INDENT_DEPTH;

  return (
    <div
      role="treeitem"
      aria-expanded={row.hasChildren ? row.isExpanded : undefined}
      aria-selected={false}
      className={cn(
        "group flex items-center gap-1 px-2 py-1 rounded",
        "text-xs font-mono",
        "hover:bg-muted/50 transition-colors duration-100 ease-out",
      )}
      style={{ paddingLeft: 8 + Math.min(row.depth, MAX_INDENT_DEPTH) * INDENT_PX }}
    >
      <button
        type="button"
        onClick={() => row.hasChildren && onToggle(row.path)}
        aria-label={row.isExpanded ? "Collapse" : "Expand"}
        className={cn(
          "h-4 w-4 flex items-center justify-center text-muted-foreground",
          "hover:text-foreground transition-colors duration-100 ease-out",
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
      {extraDepth > 0 && (
        <span
          className="shrink-0 text-[10px] tabular-nums text-muted-foreground/70"
          title={`Depth ${row.depth}`}
        >
          +{extraDepth}
          <span className="sr-only">{` (depth ${row.depth})`}</span>
        </span>
      )}
      <span className="text-foreground">
        {typeof row.key === "number"
          ? `[${row.key}]`
          : row.key === "root" && row.depth === 0
            ? "root"
            : row.key}
      </span>
      <span className="text-muted-foreground">:</span>
      <span className={cn("ml-1 truncate", TYPE_COLOR[row.type])}>
        {row.preview}
      </span>
      {row.depthLimited && (
        <span
          className="ml-1 shrink-0 text-[10px] uppercase tracking-wide text-muted-foreground/70"
          title={`Nested deeper than ${MAX_TREE_DEPTH} levels; deeper children are not shown`}
        >
          depth limit
        </span>
      )}
      <div
        className={cn(
          "ml-auto flex items-center gap-0.5",
          "opacity-0 group-hover:opacity-100 focus-within:opacity-100",
          "transition-opacity duration-150 ease-out",
        )}
      >
        <RowAction label="Copy path" onClick={() => onCopyPath(row.path)}>
          <Copy className="h-3 w-3" />
        </RowAction>
        <TreeEditPopover
          initialValue={row.value}
          initialType={row.type}
          open={editOpen}
          onOpenChange={setEditOpen}
          onSave={(value) => onEditSave(row.path, value)}
          trigger={
            <button type="button" aria-label="Edit value" className={ROW_ACTION_CLASS}>
              <Pencil className="h-3 w-3" />
            </button>
          }
        />
        {isContainer && (
          <TreeAddMenu
            containerType={row.type as "object" | "array"}
            open={addOpen}
            onOpenChange={setAddOpen}
            onAdd={(key, value) => onAddChild(row.path, key, value)}
            trigger={
              <button type="button" aria-label="Add child" className={ROW_ACTION_CLASS}>
                <Plus className="h-3 w-3" />
              </button>
            }
          />
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
      className={ROW_ACTION_CLASS}
    >
      {children}
    </button>
  );
}
