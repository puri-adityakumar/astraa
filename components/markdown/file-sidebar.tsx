"use client";

import { useRef, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Pin, PinOff, Plus, Trash2, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useMarkdownEditor } from "@/lib/stores/markdown-editor";

export function FileSidebar() {
  const open = useMarkdownEditor((s) => s.sidebarOpen);
  const files = useMarkdownEditor((s) => s.files);
  const currentId = useMarkdownEditor((s) => s.currentFileId);
  const createFile = useMarkdownEditor((s) => s.createFile);
  const selectFile = useMarkdownEditor((s) => s.selectFile);
  const deleteFile = useMarkdownEditor((s) => s.deleteFile);
  const renameFile = useMarkdownEditor((s) => s.renameFile);

  const pinnedCount = files.filter((f) => f.pinned).length;
  const atCap = pinnedCount >= 10;

  if (!open) return null;

  return (
    <aside
      className="w-64 shrink-0 border-r bg-background p-3 overflow-y-auto"
      aria-label="Files"
    >
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs text-muted-foreground">{pinnedCount} / 10 pinned</span>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span>
                <Button
                  size="icon"
                  variant="outline"
                  aria-label="New file"
                  className="min-h-touch min-w-touch"
                  disabled={atCap}
                  onClick={createFile}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </span>
            </TooltipTrigger>
            {atCap && (
              <TooltipContent>Delete a file to create a new one</TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
      </div>

      <ul className="space-y-1">
        {files.map((file) => (
          <FileRow
            key={file.id}
            id={file.id}
            title={file.title}
            pinned={file.pinned}
            lastEditedAt={file.lastEditedAt}
            isCurrent={file.id === currentId}
            onSelect={() => selectFile(file.id)}
            onDelete={() => deleteFile(file.id)}
            onRename={(title) => renameFile(file.id, title)}
          />
        ))}
      </ul>
    </aside>
  );
}

type FileRowProps = {
  id: string;
  title: string;
  pinned: boolean;
  lastEditedAt: number;
  isCurrent: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onRename: (title: string) => void;
};

function FileRow({ title, pinned, lastEditedAt, isCurrent, onSelect, onDelete, onRename }: FileRowProps) {
  const [renaming, setRenaming] = useState(false);
  const [draft, setDraft] = useState(title);
  const cancelledRef = useRef(false);

  const commit = () => {
    if (cancelledRef.current) {
      cancelledRef.current = false;
      setRenaming(false);
      return;
    }
    onRename(draft);
    setRenaming(false);
  };

  if (renaming) {
    return (
      <li>
        <Input
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === "Enter") commit();
            if (e.key === "Escape") {
              cancelledRef.current = true;
              setRenaming(false);
            }
          }}
          className="h-8"
        />
      </li>
    );
  }

  return (
    <li
      className={cn(
        "group flex items-center gap-1 rounded-md px-2 py-1 text-sm hover:bg-accent",
        isCurrent && "bg-accent",
      )}
    >
      <button
        type="button"
        className="flex-1 truncate text-left"
        onClick={onSelect}
        title={title}
      >
        <span className="block truncate">{title}</span>
        <span className="block text-xs text-muted-foreground">
          {formatDistanceToNow(lastEditedAt, { addSuffix: true })}
        </span>
      </button>
      {pinned ? (
        <Pin className="h-3 w-3 text-muted-foreground" aria-label="Pinned" />
      ) : (
        <PinOff className="h-3 w-3 text-muted-foreground" aria-label="Draft (unpinned)" />
      )}
      {pinned && (
        <>
          <Button
            size="icon"
            variant="ghost"
            aria-label="Rename"
            className="h-6 w-6 opacity-0 group-hover:opacity-100"
            onClick={() => {
              setDraft(title);
              setRenaming(true);
            }}
          >
            <Pencil className="h-3 w-3" />
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                size="icon"
                variant="ghost"
                aria-label="Delete"
                className="h-6 w-6 opacity-0 group-hover:opacity-100"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete this file?</AlertDialogTitle>
                <AlertDialogDescription>
                  This permanently removes &quot;{title}&quot; from your local storage.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={onDelete}>Delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      )}
    </li>
  );
}
