"use client";

import * as React from "react";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import { AnimatePresence } from "framer-motion";
import { Search, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { DialogTitle } from "@/components/ui/dialog";
import { games } from "@/lib/games";
import { useTools } from "@/lib/tools-context";

export function CommandMenu() {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const { categories } = useTools();

  React.useEffect(() => {
    setMounted(true);
    const down = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K to open command menu
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
      // Escape to close
      if (e.key === "Escape" && open) {
        e.preventDefault();
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
  }, [open]);

  // Reset search when dialog closes
  React.useEffect(() => {
    if (!open) {
      setSearch("");
    }
  }, [open]);

  const runCommand = React.useCallback((command: () => unknown) => {
    setOpen(false);
    command();
  }, []);

  return (
    <>
      <Button
        variant="ghost"
        className="relative h-9 w-full justify-start rounded-full border-2 border-neutral-400/50 px-4 text-xs text-muted-foreground transition-all duration-200 hover:bg-transparent hover:text-foreground dark:border-neutral-600/50 sm:pr-12 md:w-40 lg:w-56 xl:w-64"
        onClick={() => setOpen(true)}
        aria-label="Open command menu"
      >
        <Search className="mr-2 h-3.5 w-3.5 shrink-0" />
        <span className="text-xs">Search...</span>
        <kbd className="pointer-events-none absolute right-3 top-1/2 hidden h-5 -translate-y-1/2 select-none items-center gap-1 rounded border bg-muted/50 px-1.5 font-mono text-[10px] opacity-100 sm:flex">
          <span>⌘</span>
          <span>K</span>
        </kbd>
      </Button>
      <AnimatePresence>
        {mounted && open && (
          <CommandDialog open={open} onOpenChange={setOpen}>
            <VisuallyHidden.Root>
              <DialogTitle>Search tools and games</DialogTitle>
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
                  No results found for "{search}"
                </div>
              </CommandEmpty>

              {/* Synchronized with explore page - Tools categories */}
              {categories.map((category) => (
                <CommandGroup key={category.name} heading={category.name}>
                  {category.items.map((tool) => (
                    <CommandItem
                      key={tool.path}
                      value={`${tool.name} ${tool.description}`}
                      onSelect={() => runCommand(() => router.push(tool.path))}
                      className="group flex cursor-pointer items-center justify-between gap-2"
                      {...(tool.comingSoon && { disabled: true })}
                    >
                      <div className="flex min-w-0 flex-1 items-center gap-2">
                        <tool.icon className="h-4 w-4 shrink-0 text-muted-foreground transition-colors group-hover:text-primary" />
                        <span className="truncate">{tool.name}</span>
                        {tool.wip && (
                          <Badge
                            variant="secondary"
                            className="shrink-0 text-xs"
                          >
                            WIP
                          </Badge>
                        )}
                        {tool.comingSoon && (
                          <Badge variant="outline" className="shrink-0 text-xs">
                            Coming Soon
                          </Badge>
                        )}
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <span className="hidden max-w-[200px] truncate text-xs text-muted-foreground sm:inline">
                          {tool.description}
                        </span>
                        <ArrowRight className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" />
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
                    className="group flex cursor-pointer items-center justify-between gap-2"
                    {...(game.comingSoon && { disabled: true })}
                  >
                    <div className="flex min-w-0 flex-1 items-center gap-2">
                      <game.icon className="h-4 w-4 shrink-0 text-muted-foreground transition-colors group-hover:text-primary" />
                      <span className="truncate">{game.name}</span>
                      {game.comingSoon && (
                        <Badge variant="outline" className="shrink-0 text-xs">
                          Coming Soon
                        </Badge>
                      )}
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <span className="hidden max-w-[200px] truncate text-xs text-muted-foreground sm:inline">
                        {game.description}
                      </span>
                      <ArrowRight className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" />
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>

            {/* Keyboard shortcuts hint */}
            <div className="flex items-center justify-between border-t px-3 py-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <kbd className="rounded border px-1.5 py-0.5 text-[10px] font-semibold">
                    ↑↓
                  </kbd>
                  Navigate
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="rounded border px-1.5 py-0.5 text-[10px] font-semibold">
                    ↵
                  </kbd>
                  Select
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="rounded border px-1.5 py-0.5 text-[10px] font-semibold">
                    Esc
                  </kbd>
                  Close
                </span>
              </div>
            </div>
          </CommandDialog>
        )}
      </AnimatePresence>
    </>
  );
}
