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
      <p className="px-4 py-3 text-xs text-muted-foreground">
        No files yet. Drop a markdown file to get started.
      </p>
    );
  }

  return (
    <nav className="space-y-1" aria-label="Recent files">
      {rows.map((f) => {
        const active = f.id === currentId;
        return (
          <div key={f.id} className="group relative">
            <button
              type="button"
              aria-current={active ? "true" : undefined}
              onClick={() => onSelect(f.id)}
              title={f.name}
              className={cn(
                "w-full rounded-md px-4 py-2.5 pr-9 text-left text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                active
                  ? "bg-primary/10 text-primary shadow-sm hover:bg-primary/15"
                  : "text-muted-foreground hover:bg-muted/80 hover:text-foreground",
              )}
            >
              <span className="block truncate">{f.name}</span>
              <span
                className={cn(
                  "block text-xs font-normal",
                  active ? "text-primary/70" : "text-muted-foreground/70",
                )}
              >
                {formatDistanceToNow(f.updatedAt, { addSuffix: true })}
              </span>
            </button>
            <Button
              size="icon"
              variant="ghost"
              aria-label={`Delete ${f.name}`}
              className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
              onClick={() => onDelete(f.id)}
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        );
      })}
    </nav>
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
      {open && !isMobile && (
        <div className="hidden md:block">
          <div className="mb-3 flex items-center justify-between px-2">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Recent
            </h2>
            <span className="text-xs tabular-nums text-muted-foreground/70">
              {files.length}/10
            </span>
          </div>
          <FileList onSelect={onSelect} onDelete={onDelete} />
        </div>
      )}

      {isMobile && (
        <Sheet
          open={open}
          onOpenChange={(o) => {
            if (!o) toggleSidebar();
          }}
        >
          <SheetContent side="left" className="w-72 p-0">
            <SheetHeader className="border-b px-4 py-3">
              <SheetTitle className="text-sm">
                Recent files ({files.length}/10)
              </SheetTitle>
            </SheetHeader>
            <div className="p-2">
              <FileList onSelect={onSelect} onDelete={onDelete} />
            </div>
          </SheetContent>
        </Sheet>
      )}
    </>
  );
}
