"use client";

import { useMemo, useRef, useState } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useToast } from "@/components/ui/use-toast";
import { TreeRow as TreeRowComponent } from "./tree/tree-row";
import { useJsonEditor } from "@/lib/stores/json-editor";
import { flatten } from "@/lib/json/flatten";
import { parsePath } from "@/lib/json/paths";

export function TreeView() {
  const parsedValue = useJsonEditor((s) => s.parsedValue);
  const expanded = useJsonEditor((s) => s.expanded);
  const togglePath = useJsonEditor((s) => s.togglePath);
  const applyPatchAt = useJsonEditor((s) => s.applyPatchAt);
  const { toast } = useToast();

  const expandedSet = useMemo(() => new Set(expanded), [expanded]);
  const rows = useMemo(
    () => (parsedValue === null ? [] : flatten(parsedValue, expandedSet)),
    [parsedValue, expandedSet],
  );

  const parentRef = useRef<HTMLDivElement>(null);
  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 28,
    overscan: 16,
  });

  const [editPath, setEditPath] = useState<string | null>(null);

  if (parsedValue === null) {
    return (
      <div className="p-8 text-sm text-muted-foreground">
        JSON is invalid. Switch to the Text tab to fix it, then come back.
      </div>
    );
  }

  return (
    <div
      ref={parentRef}
      role="tree"
      className="h-[60vh] overflow-auto border rounded-md bg-background"
    >
      <div style={{ height: virtualizer.getTotalSize(), position: "relative" }}>
        {virtualizer.getVirtualItems().map((vi) => {
          const row = rows[vi.index];
          if (!row) return null;
          return (
            <div
              key={vi.key}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                transform: `translateY(${vi.start}px)`,
              }}
            >
              <TreeRowComponent
                row={row}
                onToggle={togglePath}
                onCopyPath={async (p) => {
                  await navigator.clipboard.writeText(p);
                  toast({ title: "Path copied", description: p || "root" });
                }}
                onEdit={(p) => setEditPath(p)}
                onAdd={(p) => {
                  const segs = parsePath(p);
                  applyPatchAt(p, "add", segs.length === 0 ? null : "");
                }}
                onRemove={(p) => applyPatchAt(p, "remove")}
              />
            </div>
          );
        })}
      </div>
      {editPath !== null && (
        <EditDialog path={editPath} onClose={() => setEditPath(null)} />
      )}
    </div>
  );
}

function EditDialog({ path, onClose }: { path: string; onClose: () => void }) {
  const applyPatchAt = useJsonEditor((s) => s.applyPatchAt);
  return (
    <div
      className="fixed inset-0 z-40 bg-black/40 flex items-center justify-center"
      onClick={onClose}
    >
      <div
        className="bg-background rounded-md border p-4 max-w-sm w-full space-y-3"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-xs text-muted-foreground font-mono">{path || "root"}</p>
        <p className="text-sm">
          Edit-popover UI is wired in TreeRow actions; this dialog is a placeholder
          for accessibility focus capture.
        </p>
        <div className="flex justify-end gap-2">
          <button className="text-xs text-muted-foreground" onClick={onClose}>
            Close
          </button>
          <button
            className="text-xs"
            onClick={() => {
              applyPatchAt(path, "set", null);
              onClose();
            }}
          >
            Set to null
          </button>
        </div>
      </div>
    </div>
  );
}
