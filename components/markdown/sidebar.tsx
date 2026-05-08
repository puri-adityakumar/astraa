"use client";

import { useMemo } from "react";
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
      <p className="px-3 py-2 text-xs text-muted-foreground">
        No files yet. Drop a markdown file to get started.
      </p>
    );
  }

  return (
    <ul className="space-y-1 px-2 py-2">
      {rows.map((f) => (
        <li
          key={f.id}
          className={cn(
            "group flex items-center gap-1 rounded-md px-2 py-1 text-sm hover:bg-accent",
            f.id === currentId && "bg-accent",
          )}
        >
          <button
            type="button"
            className="flex-1 truncate text-left"
            aria-current={f.id === currentId ? "true" : undefined}
            onClick={() => onSelect(f.id)}
            title={f.name}
          >
            <span className="block truncate">{f.name}</span>
            <span className="block text-xs text-muted-foreground">
              {formatDistanceToNow(f.updatedAt, { addSuffix: true })}
            </span>
          </button>
          <Button
            size="icon"
            variant="ghost"
            aria-label={`Delete ${f.name}`}
            className="h-7 w-7 opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
            onClick={() => onDelete(f.id)}
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </li>
      ))}
    </ul>
  );
}

export function Sidebar({ onSelect, onDelete }: SidebarProps) {
  const open = useMarkdownEditor((s) => s.sidebarOpen);
  const toggleSidebar = useMarkdownEditor((s) => s.toggleSidebar);
  const files = useMarkdownEditor((s) => s.files);

  return (
    <>
      <aside
        className={cn(
          "hidden md:flex flex-col border-r bg-background overflow-hidden transition-[width] duration-200",
          open ? "w-72" : "w-0",
        )}
        aria-label="Recent files"
      >
        {open && (
          <>
            <div className="border-b px-3 py-2 text-xs text-muted-foreground">
              Recent files ({files.length}/10)
            </div>
            <div className="flex-1 overflow-y-auto">
              <FileList onSelect={onSelect} onDelete={onDelete} />
            </div>
          </>
        )}
      </aside>

      <Sheet
        open={open}
        onOpenChange={(o) => {
          if (!o) toggleSidebar();
        }}
      >
        <SheetContent side="left" className="md:hidden w-72 p-0">
          <SheetHeader className="border-b px-3 py-2">
            <SheetTitle className="text-sm">
              Recent files ({files.length}/10)
            </SheetTitle>
          </SheetHeader>
          <FileList onSelect={onSelect} onDelete={onDelete} />
        </SheetContent>
      </Sheet>
    </>
  );
}
