"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Search, ArrowRight } from "lucide-react"
import { useTools } from "@/lib/tools-context"
import { games } from "@/lib/games"
import { Badge } from "@/components/ui/badge"
import { DialogContent, DialogTitle } from "@/components/ui/dialog"
import * as VisuallyHidden from "@radix-ui/react-visually-hidden"

export function CommandMenu() {
  const router = useRouter()
  const [open, setOpen] = React.useState(false)
  const [mounted, setMounted] = React.useState(false)
  const [search, setSearch] = React.useState("")
  const { categories } = useTools()

  React.useEffect(() => {
    setMounted(true)
    const down = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K to open command menu
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
      // Escape to close
      if (e.key === "Escape" && open) {
        e.preventDefault()
        setOpen(false)
      }
      // Cmd/Ctrl + / for quick search focus
      if (e.key === "/" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen(true)
      }
    }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [open])

  // Reset search when dialog closes
  React.useEffect(() => {
    if (!open) {
      setSearch("")
    }
  }, [open])

  const runCommand = React.useCallback((command: () => unknown) => {
    setOpen(false)
    command()
  }, [])

  return (
    <>
      <Button
        variant="ghost"
        className="relative h-9 w-full justify-start rounded-full text-xs text-muted-foreground sm:pr-12 md:w-40 lg:w-56 xl:w-64 transition-all duration-200 hover:bg-transparent hover:text-foreground border-2 border-neutral-400/50 dark:border-neutral-600/50 px-4"
        onClick={() => setOpen(true)}
        aria-label="Open command menu"
      >
        <Search className="mr-2 h-3.5 w-3.5 shrink-0" />
        <span className="text-xs">Search...</span>
        <kbd className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 hidden h-5 select-none items-center gap-1 rounded border bg-muted/50 px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          <span>⌘</span><span>K</span>
        </kbd>
      </Button>
      <AnimatePresence>
        {mounted && open && (
          <CommandDialog open={open} onOpenChange={setOpen}>
            <DialogContent className="p-0 overflow-hidden">
              <VisuallyHidden.Root>
                <DialogTitle>Search tools and games</DialogTitle>
              </VisuallyHidden.Root>
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
              >
                <CommandInput 
                  placeholder="Type to search tools and games..." 
                  value={search}
                  onValueChange={setSearch}
                  aria-label="Search input"
                />
                <CommandList className="max-h-[400px] overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
                  <CommandEmpty>
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="py-6 text-center text-sm text-muted-foreground"
                    >
                      No results found for "{search}"
                    </motion.div>
                  </CommandEmpty>
                  
                  {/* Synchronized with explore page - Tools categories */}
                  {categories.map((category) => (
                    <CommandGroup key={category.name} heading={category.name}>
                      {category.items.map((tool) => (
                        <CommandItem
                          key={tool.path}
                          value={`${tool.name} ${tool.description}`}
                          onSelect={() => runCommand(() => router.push(tool.path))}
                          className="flex items-center justify-between gap-2 cursor-pointer group"
                          {...(tool.comingSoon && { disabled: true })}
                        >
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <tool.icon className="h-4 w-4 shrink-0 text-muted-foreground group-hover:text-primary transition-colors" />
                            <span className="truncate">{tool.name}</span>
                            {tool.wip && (
                              <Badge variant="secondary" className="text-xs shrink-0">
                                WIP
                              </Badge>
                            )}
                            {tool.comingSoon && (
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
                        {...(game.comingSoon && { disabled: true })}
                      >
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <game.icon className="h-4 w-4 shrink-0 text-muted-foreground group-hover:text-primary transition-colors" />
                          <span className="truncate">{game.name}</span>
                          {game.comingSoon && (
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
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="border-t px-3 py-2 text-xs text-muted-foreground flex items-center justify-between"
                >
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
                </motion.div>
              </motion.div>
            </DialogContent>
          </CommandDialog>
        )}
      </AnimatePresence>
    </>
  )
}