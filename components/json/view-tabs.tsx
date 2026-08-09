"use client";

import { FileCode, Network, ArrowLeftRight, Wand2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useJsonEditor } from "@/lib/stores/json-editor";
import type { View } from "@/lib/json/types";

const VIEWS: {
  id: View;
  label: string;
  short: string;
  Icon: typeof FileCode;
}[] = [
  { id: "text", label: "Text", short: "Txt", Icon: FileCode },
  { id: "tree", label: "Tree", short: "Tree", Icon: Network },
  { id: "convert", label: "Convert", short: "Conv", Icon: ArrowLeftRight },
  { id: "generate", label: "Generate", short: "Gen", Icon: Wand2 },
];

export function ViewTabs() {
  const view = useJsonEditor((s) => s.view);
  const setView = useJsonEditor((s) => s.setView);
  return (
    <div
      role="group"
      aria-label="JSON Editor view"
      className="grid w-full grid-cols-4 rounded-md border bg-muted p-0.5 sm:inline-flex sm:w-auto"
    >
      {VIEWS.map(({ id, label, short, Icon }) => {
        const active = view === id;
        return (
          <button
            key={id}
            type="button"
            aria-pressed={active}
            aria-label={label}
            onClick={() => setView(id)}
            className={cn(
              "inline-flex min-h-touch min-w-0 items-center justify-center gap-1 rounded-sm px-1.5 py-1.5 text-sm sm:gap-1.5 sm:px-3",
              "transition-colors duration-100 ease-out",
              active
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Icon className="h-3.5 w-3.5" aria-hidden />
            <span className="hidden sm:inline">{label}</span>
            <span className="sm:hidden">{short}</span>
          </button>
        );
      })}
    </div>
  );
}
