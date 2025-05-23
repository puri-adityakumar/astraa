"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Search } from "lucide-react"
import { tools, toolCategories } from "@/lib/tools"
import { games } from "@/lib/games"
import { Badge } from "@/components/ui/badge"
import { DialogContent, DialogTitle } from "@/components/ui/dialog"

export function CommandMenu() {
  const router = useRouter()
  const [open, setOpen] = React.useState(false)
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  const runCommand = React.useCallback((command: () => unknown) => {
    setOpen(false)
    command()
  }, [])

  return (
    <>
      <Button
        variant="outline"
        className="relative h-9 w-full justify-start rounded-[0.5rem] text-sm text-muted-foreground sm:pr-12 md:w-40 lg:w-64"
        onClick={() => setOpen(true)}
      >
        <Search className="mr-2 h-4 w-4 shrink-0" />
        <span className="hidden lg:inline-flex">Search tools & games...</span>
        <span className="inline-flex lg:hidden">Search...</span>
        <kbd className="pointer-events-none absolute right-1.5 top-2 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>
      {mounted && (
        <CommandDialog open={open} onOpenChange={setOpen}>
          <DialogContent className="p-0">
            <DialogTitle className="sr-only">Search tools and games</DialogTitle>
            <CommandInput placeholder="Type to search tools and games..." />
            <CommandList>
              <CommandEmpty>No results found.</CommandEmpty>
              {toolCategories.map((category) => (
                <CommandGroup key={category.name} heading={category.name}>
                  {category.items.map((tool) => (
                    <CommandItem
                      key={tool.path}
                      onSelect={() => runCommand(() => router.push(tool.path))}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <tool.icon className="h-4 w-4" />
                        <span>{tool.name}</span>
                        {tool.wip && (
                          <Badge variant="secondary" className="ml-2">
                            WIP
                          </Badge>
                        )}
                      </div>
                      <span className="text-sm text-muted-foreground">{tool.description}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              ))}
              <CommandGroup heading="Games">
                {games.map((game) => (
                  <CommandItem
                    key={game.path}
                    onSelect={() => runCommand(() => router.push(game.path))}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <game.icon className="h-4 w-4" />
                      <span>{game.name}</span>
                      {game.comingSoon && (
                        <Badge variant="secondary" className="ml-2">
                          Coming Soon
                        </Badge>
                      )}
                    </div>
                    <span className="text-sm text-muted-foreground">{game.description}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </DialogContent>
        </CommandDialog>
      )}
    </>
  )
}