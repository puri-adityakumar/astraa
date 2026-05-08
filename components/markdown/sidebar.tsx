"use client";

import { useEffect, useMemo, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useMarkdownEditor } from "@/lib/stores/markdown-editor";

type SidebarProps = {
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
};

function FileList({ onSelect, onDelete }: SidebarProps) {
  const files = useMarkdownEditor((s) => s.files);
  const currentId = useMarkdownEditor((s) => s.currentId);

  const rows = useMemo(
    () =>
      files.map((f) => ({
        id: f.id,
        name: f.name,
        updatedAt: f.updatedAt,
      })),
    [files],
  );

  if (rows.length === 0) {
    return (
      <p className="px-4 py-6 text-center text-xs text-muted-foreground">
        No files yet.
        <br />
        Drop a markdown file to get started.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-border/60">
      {rows.map((f) => (
        <li
          key={f.id}
          className={cn(
            "group relative flex items-center gap-1 px-3 py-2.5 text-sm transition-colors hover:bg-accent/50",
            f.id === currentId && "bg-accent",
          )}
        >
          {f.id === currentId && (
            <span
              className="absolute inset-y-2 left-0 w-0.5 rounded-r bg-primary"
              aria-hidden
            />
          )}
          <button
            type="button"
            className="flex-1 min-w-0 truncate rounded text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-current={f.id === currentId ? "true" : undefined}
            onClick={() => onSelect(f.id)}
            title={f.name}
          >
            <span className="block truncate font-medium">{f.name}</span>
            <span className="block text-xs text-muted-foreground">
              {formatDistanceToNow(f.updatedAt, { addSuffix: true })}
            </span>
          </button>
          <Button
            size="icon"
            variant="ghost"
            aria-label={`Delete ${f.name}`}
            className="h-7 w-7 opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
            onClick={() => onDelete(f.id)}
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </li>
      ))}
    </ul>
  );
}

function useIsMobile(breakpointPx = 768): boolean {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpointPx - 1}px)`);
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, [breakpointPx]);
  return isMobile;
}

export function Sidebar({ onSelect, onDelete }: SidebarProps) {
  const open = useMarkdownEditor((s) => s.sidebarOpen);
  const toggleSidebar = useMarkdownEditor((s) => s.toggleSidebar);
  const files = useMarkdownEditor((s) => s.files);
  const isMobile = useIsMobile();

  return (
    <>
      <aside
        className={cn(
          "absolute top-0 z-20 hidden h-full w-60 flex-col overflow-hidden rounded-xl border bg-card shadow-lg transition-all duration-200 md:flex",
          "right-[calc(100%+0.75rem)]",
          open
            ? "translate-x-0 opacity-100"
            : "pointer-events-none -translate-x-2 opacity-0",
        )}
        aria-label="Recent files"
        aria-hidden={!open}
      >
        <div className="flex items-center justify-between border-b bg-muted/20 px-3 py-2">
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Recent
          </span>
          <span className="text-xs tabular-nums text-muted-foreground/70">
            {files.length}/10
          </span>
        </div>
        <div className="flex-1 overflow-y-auto">
          <FileList onSelect={onSelect} onDelete={onDelete} />
        </div>
      </aside>

      {isMobile && (
        <Sheet
          open={open}
          onOpenChange={(o) => {
            if (!o) toggleSidebar();
          }}
        >
          <SheetContent side="left" className="w-72 p-0">
            <SheetHeader className="border-b px-3 py-2">
              <SheetTitle className="text-sm">
                Recent files ({files.length}/10)
              </SheetTitle>
            </SheetHeader>
            <FileList onSelect={onSelect} onDelete={onDelete} />
          </SheetContent>
        </Sheet>
      )}
    </>
  );
}
