"use client"

import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { useTools } from "@/lib/tools-context"
import { games } from "@/lib/games"
import { Badge } from "@/components/ui/badge"
import { DialogContent, DialogTitle } from "@/components/ui/dialog"
import * as VisuallyHidden from "@radix-ui/react-visually-hidden"
import { ArrowRight } from "lucide-react"

export function FloatingNav({ className }: { className?: string }) {
  const [searchOpen, setSearchOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const router = useRouter()
  const { categories } = useTools()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setSearchOpen((open) => !open)
      }
    }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  const runCommand = React.useCallback((command: () => unknown) => {
    setSearchOpen(false)
    command()
  }, [])

  if (!mounted) return null

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={cn(
          "flex fixed top-6 inset-x-0 mx-4 sm:mx-auto max-w-2xl",
          "border-2 border-neutral-400/50 dark:border-neutral-600/50 rounded-full",
          "bg-transparent backdrop-blur-sm",
          "z-[5000] px-6 py-2 items-center justify-between gap-4",
          className
        )}
      >
        {/* Left: Logo */}
        <Link href="/" className="flex items-center gap-1 shrink-0">
          <span className="font-logo text-lg text-foreground">astraa</span>
          <span className="font-mono text-xs text-muted-foreground">अस्त्र</span>
        </Link>

        {/* Center: Search */}
        <Button
          variant="ghost"
          size="sm"
          className="flex-1 max-w-xs justify-start text-muted-foreground hover:text-foreground hover:bg-transparent border-2 border-neutral-400/50 dark:border-neutral-600/50 rounded-full px-4"
          onClick={() => setSearchOpen(true)}
        >
          <Search className="h-4 w-4 mr-2" />
          <span className="text-sm">Search...</span>
          <kbd className="ml-auto hidden sm:inline-flex h-5 items-center gap-1 rounded border bg-muted/50 px-1.5 font-mono text-[10px]">
            <span>⌘</span><span>K</span>
          </kbd>
        </Button>

        {/* Right: Back */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="group shrink-0 h-8 w-8 flex items-center justify-center rounded-full border-2 border-neutral-400/50 dark:border-neutral-600/50"
          onClick={() => router.back()}
          aria-label="Go back"
        >
          <motion.div
            initial={{ x: 0 }}
            whileHover={{ x: -2 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <ArrowLeft className="h-4 w-4" />
          </motion.div>
        </motion.button>
      </motion.div>

      {/* Search Dialog */}
      <CommandDialog open={searchOpen} onOpenChange={setSearchOpen}>
        <DialogContent className="p-0 overflow-hidden">
          <VisuallyHidden.Root>
            <DialogTitle>Search tools and games</DialogTitle>
          </VisuallyHidden.Root>
          <CommandInput placeholder="Search tools and games..." />
          <CommandList className="max-h-[400px]">
            <CommandEmpty>No results found.</CommandEmpty>
            
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
                    <div className="flex items-center gap-2">
                      <tool.icon className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
                      <span>{tool.name}</span>
                      {tool.wip && <Badge variant="secondary" className="text-xs">WIP</Badge>}
                      {tool.comingSoon && <Badge variant="outline" className="text-xs">Soon</Badge>}
                    </div>
                    <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100" />
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
            
            <CommandGroup heading="Games">
              {games.map((game) => (
                <CommandItem
                  key={game.path}
                  value={`${game.name} ${game.description}`}
                  onSelect={() => runCommand(() => router.push(game.path))}
                  className="flex items-center justify-between gap-2 cursor-pointer group"
                  {...(game.comingSoon && { disabled: true })}
                >
                  <div className="flex items-center gap-2">
                    <game.icon className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
                    <span>{game.name}</span>
                    {game.comingSoon && <Badge variant="outline" className="text-xs">Soon</Badge>}
                  </div>
                  <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100" />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </DialogContent>
      </CommandDialog>
    </>
  )
}
