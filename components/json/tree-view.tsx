"use client";

import { useMemo, useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { TreeRow as TreeRowComponent } from "./tree/tree-row";
import { useJsonEditor } from "@/lib/stores/json-editor";
import { flatten } from "@/lib/json/flatten";
import { joinPath } from "@/lib/json/paths";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";

export function TreeView() {
  const parsedValue = useJsonEditor((s) => s.parsedValue);
  const expanded = useJsonEditor((s) => s.expanded);
  const togglePath = useJsonEditor((s) => s.togglePath);
  const applyPatchAt = useJsonEditor((s) => s.applyPatchAt);
  const copy = useCopyToClipboard();

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
                  await copy(p, "Path copied");
                }}
                onEditSave={(p, value) => applyPatchAt(p, "set", value)}
                onAddChild={(p, key, value) => {
                  if (key === null) {
                    applyPatchAt(p, "add", value);
                  } else {
                    applyPatchAt(joinPath(p, key), "add", value);
                  }
                }}
                onRemove={(p) => applyPatchAt(p, "remove")}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
