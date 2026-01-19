"use client";

import React, { useState, useEffect, useRef } from "react";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Search } from "lucide-react";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
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
import { cn } from "@/lib/utils";

export function FloatingNav({ className }: { className?: string }) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(true);
  const lastScrollY = useRef(0);
  const router = useRouter();
  const { categories } = useTools();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY < 50) {
        // Always show at top of page
        setVisible(true);
      } else if (currentScrollY > lastScrollY.current) {
        // Scrolling down - hide
        setVisible(false);
      } else {
        // Scrolling up - show
        setVisible(true);
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setSearchOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const runCommand = React.useCallback((command: () => unknown) => {
    setSearchOpen(false);
    command();
  }, []);

  if (!mounted) return null;

  return (
    <>
      <AnimatePresence>
        {visible && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className={cn(
              "fixed inset-x-0 top-6 mx-4 flex max-w-2xl sm:mx-auto",
              "rounded-full border border-neutral-200/20 dark:border-neutral-800/20",
              "bg-background/50 shadow-sm backdrop-blur-md",
              "z-[5000] items-center justify-between gap-4 px-6 py-2",
              className,
            )}
          >
            {/* Left: Logo */}
            <Link href="/" className="flex shrink-0 items-center gap-1">
              <span className="font-logo text-lg text-foreground">astraa</span>
              <span className="font-mono text-xs text-muted-foreground">
                अस्त्र
              </span>
            </Link>

            {/* Center: Search */}
            <Button
              variant="ghost"
              size="sm"
              className="hidden max-w-xs flex-1 justify-start rounded-full border border-neutral-200/20 px-4 text-muted-foreground hover:bg-muted/50 hover:text-foreground dark:border-neutral-800/20 sm:flex"
              onClick={() => setSearchOpen(true)}
            >
              <Search className="mr-2 h-4 w-4" />
              <span className="text-sm">Search...</span>
              <kbd className="ml-auto hidden h-5 items-center gap-1 rounded border bg-muted/50 px-1.5 font-mono text-[10px] sm:inline-flex">
                <span>⌘</span>
                <span>K</span>
              </kbd>
            </Button>

            {/* Right: Back */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="group flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-neutral-200/20 hover:bg-muted/50 dark:border-neutral-800/20"
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
                  className="group flex cursor-pointer items-center justify-between gap-2"
                  {...(tool.comingSoon && { disabled: true })}
                >
                  <div className="flex items-center gap-2">
                    <tool.icon className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
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
                className="group flex cursor-pointer items-center justify-between gap-2"
                {...(game.comingSoon && { disabled: true })}
              >
                <div className="flex items-center gap-2">
                  <game.icon className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
                  <span>{game.name}</span>
                  {game.comingSoon && (
                    <Badge variant="outline" className="text-xs">
                      Soon
                    </Badge>
                  )}
                </div>
                <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100" />
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
