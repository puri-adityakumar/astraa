"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Search, ArrowRight } from "lucide-react";
import { toolCategories } from "@/lib/tools";
import { games } from "@/lib/games";
import { Badge } from "@/components/ui/badge";
import { DialogDescription, DialogTitle } from "@/components/ui/dialog";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";

interface CommandMenuProps {
  onNavigate?: () => void;
}

export function CommandMenu({ onNavigate }: CommandMenuProps) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const wasOpenRef = React.useRef(false);

  React.useEffect(() => {
    const shouldRestoreFocus = wasOpenRef.current && !open;
    wasOpenRef.current = open;
    if (!shouldRestoreFocus) return;

    const frame = window.requestAnimationFrame(() => triggerRef.current?.focus());
    return () => window.cancelAnimationFrame(frame);
  }, [open]);

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K to open command menu
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
      // Escape to close
      if (e.key === "Escape") {
        setOpen(false);
      }
      // Cmd/Ctrl + / for quick search focus
      if (e.key === "/" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen(true);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  // Reset search when dialog closes
  React.useEffect(() => {
    let resetTimer: number | undefined;

    if (!open) {
      resetTimer = window.setTimeout(() => setSearch(""), 0);
    }

    return () => {
      if (resetTimer !== undefined) window.clearTimeout(resetTimer);
    };
  }, [open]);

  const runCommand = React.useCallback(
    (command: () => unknown) => {
      setOpen(false);
      command();
      onNavigate?.();
    },
    [onNavigate],
  );

  return (
    <>
      <Button
        ref={triggerRef}
        variant="outline"
        className="relative h-10 w-full justify-start rounded-md px-3 text-sm font-normal text-muted-foreground shadow-none sm:pr-12 md:w-52 lg:w-64"
        onClick={() => setOpen(true)}
        aria-label="Open command menu"
      >
        <Search className="mr-2 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        <span>Search tools...</span>
        <kbd className="pointer-events-none absolute right-2.5 top-1/2 hidden h-5 -translate-y-1/2 select-none items-center gap-1 rounded border bg-muted/50 px-1.5 font-mono text-[10px] text-muted-foreground sm:flex">
          <span>⌘</span>
          <span>K</span>
        </kbd>
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <VisuallyHidden.Root>
          <DialogTitle>Search tools and games</DialogTitle>
          <DialogDescription>
            Search the Astraa catalog and open an available tool or game.
          </DialogDescription>
        </VisuallyHidden.Root>
        <CommandInput
          placeholder="Type to search tools and games..."
          value={search}
          onValueChange={setSearch}
          aria-label="Search input"
        />
        <CommandList>
          <CommandEmpty>
            <div className="py-6 text-center text-sm text-muted-foreground">
              No results found for “{search}”
            </div>
          </CommandEmpty>

          {/* Synchronized with explore page - Tools categories */}
          {toolCategories.map((category) => (
            <CommandGroup key={category.name} heading={category.name}>
              {category.items.map((tool) => (
                <CommandItem
                  key={tool.path}
                  value={`${tool.name} ${tool.description}`}
                  onSelect={() => runCommand(() => router.push(tool.path))}
                  className="flex items-center justify-between gap-2 cursor-pointer group"
                  {...(tool.status === "coming-soon" && { disabled: true })}
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <tool.icon className="h-4 w-4 shrink-0 text-muted-foreground group-hover:text-primary transition-colors" />
                    <span className="truncate">{tool.name}</span>
                    {tool.status === "coming-soon" && (
                      <Badge variant="outline" className="text-xs shrink-0">
                        Coming Soon
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs text-muted-foreground hidden sm:inline truncate max-w-[200px]">
                      {tool.description}
                    </span>
                    <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          ))}

          {/* Synchronized with explore page - Games section */}
          <CommandGroup heading="Games">
            {games.map((game) => (
              <CommandItem
                key={game.path}
                value={`${game.name} ${game.description}`}
                onSelect={() => runCommand(() => router.push(game.path))}
                className="flex items-center justify-between gap-2 cursor-pointer group"
                {...(game.status === "coming-soon" && { disabled: true })}
              >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <game.icon className="h-4 w-4 shrink-0 text-muted-foreground group-hover:text-primary transition-colors" />
                  <span className="truncate">{game.name}</span>
                  {game.status === "coming-soon" && (
                    <Badge variant="outline" className="text-xs shrink-0">
                      Coming Soon
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs text-muted-foreground hidden sm:inline truncate max-w-[200px]">
                    {game.description}
                  </span>
                  <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>

        {/* Keyboard shortcuts hint */}
        <div className="border-t px-3 py-2 text-xs text-muted-foreground flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 text-[10px] font-semibold border rounded">↑↓</kbd>
              Navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 text-[10px] font-semibold border rounded">↵</kbd>
              Select
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 text-[10px] font-semibold border rounded">Esc</kbd>
              Close
            </span>
          </div>
        </div>
      </CommandDialog>
    </>
  );
}
