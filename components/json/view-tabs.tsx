"use client";

import { FileCode, Trees, ArrowLeftRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useJsonEditor } from "@/lib/stores/json-editor";
import type { View } from "@/lib/json/types";

const VIEWS: { id: View; label: string; Icon: typeof FileCode }[] = [
  { id: "text", label: "Text", Icon: FileCode },
  { id: "tree", label: "Tree", Icon: Trees },
  { id: "convert", label: "Convert", Icon: ArrowLeftRight },
  { id: "generate", label: "Generate", Icon: Sparkles },
];

export function ViewTabs() {
  const view = useJsonEditor((s) => s.view);
  const setView = useJsonEditor((s) => s.setView);
  return (
    <div
      role="tablist"
      aria-label="JSON Editor view"
      className="inline-flex rounded-md border bg-muted p-0.5"
    >
      {VIEWS.map(({ id, label, Icon }) => (
        <button
          key={id}
          role="tab"
          aria-selected={view === id}
          onClick={() => setView(id)}
          className={cn(
            "inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-sm",
            "min-h-touch transition-colors duration-100 ease-out",
            view === id
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          <Icon className="h-3.5 w-3.5" aria-hidden />
          <span className="hidden sm:inline">{label}</span>
        </button>
      ))}
    </div>
  );
}
