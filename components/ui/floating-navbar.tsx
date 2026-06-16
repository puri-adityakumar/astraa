"use client"

import React, { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Search, ArrowRight } from "lucide-react"
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
import { useReducedMotion } from "@/lib/animations/hooks"

export function FloatingNav({ className }: { className?: string }) {
  const [searchOpen, setSearchOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [visible, setVisible] = useState(true)
  const lastScrollY = useRef(0)
  const router = useRouter()
  const { categories } = useTools()
  const shouldReduce = useReducedMotion()

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true)
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY

      if (currentScrollY < 50) {
        setVisible(true)
      } else if (currentScrollY > lastScrollY.current) {
        setVisible(false)
      } else {
        setVisible(true)
      }

      lastScrollY.current = currentScrollY
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const runCommand = React.useCallback((command: () => unknown) => {
    setSearchOpen(false)
    command()
  }, [])

  if (!mounted) return null

  const motionProps = shouldReduce
    ? {}
    : {
        initial: { opacity: 0, y: -20 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -20 },
        transition: { duration: 0.2 },
      }

  return (
    <>
      <AnimatePresence>
        {visible && (
          <motion.div
            {...motionProps}
            className={cn(
              "flex fixed top-6 inset-x-0 mx-4 sm:mx-auto max-w-2xl",
              "rounded-[12px] z-[5000] px-4 py-2 items-center justify-between gap-4",
              className,
            )}
            style={{
              border: "1px solid var(--hairline)",
              background: "var(--nav-bg)",
              backdropFilter: "blur(14px)",
              WebkitBackdropFilter: "blur(14px)",
              boxShadow: "var(--shadow-card)",
            }}
          >
            {/* Logo — Geist sans, no font-logo */}
            <Link
              href="/"
              className="flex items-center gap-[9px] shrink-0 select-none"
              aria-label="astraa home"
            >
              <span
                className="font-sans font-bold leading-none"
                style={{
                  fontSize: 18,
                  letterSpacing: "-0.03em",
                  color: "var(--text)",
                }}
              >
                astraa
              </span>
            </Link>

            {/* Search trigger */}
            <button
              type="button"
              className="hidden sm:flex flex-1 max-w-xs items-center justify-start gap-2 h-[34px] rounded-[9px] px-3 text-[13px] transition-[border-color] duration-200"
              style={{
                background: "var(--surface-2)",
                border: "1px solid var(--hairline)",
                color: "var(--muted)",
              }}
              onClick={() => setSearchOpen(true)}
              aria-label="Open search (⌘K)"
            >
              <Search className="h-[14px] w-[14px] flex-none opacity-70" aria-hidden="true" />
              <span>Search…</span>
              <kbd
                className="ml-auto font-mono text-[10px] rounded-[4px] px-[5px] py-[1px] leading-none"
                style={{
                  color: "var(--faint)",
                  border: "1px solid var(--hairline)",
                  background: "var(--surface, hsl(var(--card)))",
                }}
              >
                ⌘K
              </kbd>
            </button>

            {/* Back button */}
            <motion.button
              type="button"
              {...(shouldReduce
                ? {}
                : { whileHover: { scale: 1.08 }, whileTap: { scale: 0.95 } })}
              className="shrink-0 inline-flex items-center justify-center rounded-[9px] transition-[background,border-color,color] duration-200 floating-nav-back"
              style={{
                width: 38,
                height: 38,
                border: "1px solid var(--hairline)",
                background: "transparent",
                color: "var(--text-2)",
              }}
              onClick={() => router.back()}
              aria-label="Go back"
            >
              <ArrowLeft className="h-[16px] w-[16px]" aria-hidden="true" />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Scoped hover styles */}
      <style>{`
        :root { --surface: hsl(var(--card)); }
        .floating-nav-back:hover {
          background: var(--surface) !important;
          border-color: var(--hairline-strong) !important;
          color: var(--text) !important;
        }
      `}</style>

      {/* Search dialog */}
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
                    <tool.icon className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                    <span>{tool.name}</span>
                    {tool.wip && (
                      <Badge variant="secondary" className="text-xs">
                        WIP
                      </Badge>
                    )}
                    {tool.comingSoon && (
                      <Badge variant="outline" className="text-xs">
                        Soon
                      </Badge>
                    )}
                  </div>
                  <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
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
                  <game.icon className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                  <span>{game.name}</span>
                  {game.comingSoon && (
                    <Badge variant="outline" className="text-xs">
                      Soon
                    </Badge>
                  )}
                </div>
                <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  )
}
