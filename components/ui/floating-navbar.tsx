"use client"

import React, { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
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
import { DialogTitle } from "@/components/ui/dialog"
import * as VisuallyHidden from "@radix-ui/react-visually-hidden"
import { ArrowRight } from "lucide-react"

export function FloatingNav({ className }: { className?: string }) {
  const [searchOpen, setSearchOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [visible, setVisible] = useState(true)
  const [scrollDelta, setScrollDelta] = useState(0)
  const lastScrollY = useRef(0)
  const router = useRouter()
  const { categories } = useTools()

  const scrollThreshold = 120

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      const current = window.scrollY
      const diff = current - lastScrollY.current

      const newDelta =
        Math.sign(scrollDelta) === Math.sign(diff) ? scrollDelta + diff : diff

      setScrollDelta(newDelta)

      if (current < 50) {
        setVisible(true)
        setScrollDelta(0)
      } else if (newDelta > scrollThreshold && current > 150) {
        setVisible(false)
      } else if (newDelta < -50 || diff < 0) {
        setVisible(true)
        setScrollDelta(0)
      }

      lastScrollY.current = current
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [scrollDelta])

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
      <AnimatePresence>
        {visible && (
          <motion.div
            initial={{ scaleX: 0, scaleY: 0, opacity: 0 }}
            animate={{ scaleX: 1, scaleY: 1, opacity: 1 }}
            exit={{ scaleX: 0, scaleY: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
            className={cn(
              "flex fixed top-6 inset-x-0 mx-4 sm:mx-auto max-w-2xl",
              "border border-neutral-200/20 dark:border-neutral-800/20 rounded-full",
              "bg-background/50 backdrop-blur-md shadow-sm",
              "z-[5000] px-6 py-2 items-center justify-between gap-4",
              "origin-top",
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
              className="flex-1 max-w-xs justify-start text-muted-foreground hover:text-foreground hover:bg-muted/50 border border-neutral-200/20 dark:border-neutral-800/20 rounded-full px-4"
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
              className="group shrink-0 h-8 w-8 flex items-center justify-center rounded-full border border-neutral-200/20 dark:border-neutral-800/20 hover:bg-muted/50"
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
        )}
      </AnimatePresence>

      {/* Search Dialog */}
      <CommandDialog open={searchOpen} onOpenChange={setSearchOpen}>
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
      </CommandDialog>
    </>
  )
}
