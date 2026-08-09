"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Github, Menu, X } from "lucide-react";

import { CommandMenu } from "@/components/command-menu";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const ThemeToggle = dynamic(
  () => import("@/components/theme-toggle").then((module) => module.ThemeToggle),
  {
    loading: () => (
      <div
        className="h-[50px] w-[138px] rounded-full border bg-background shadow-geist"
        aria-hidden="true"
        data-theme-toggle-placeholder
      />
    ),
    ssr: false,
  },
);

const NAVIGATION_LINKS = [
  { href: "/tools", label: "Tools" },
  { href: "/games", label: "Games" },
  { href: "/docs", label: "Docs" },
  { href: "/contribute", label: "Contribute" },
];

function isLinkActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function LandingNavigation() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape" || !isMenuOpen) return;

      event.preventDefault();
      setIsMenuOpen(false);
      window.requestAnimationFrame(() => menuButtonRef.current?.focus());
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isMenuOpen]);

  return (
    <header className="sticky top-0 z-50 border-b bg-background/85 backdrop-blur-xl">
      <nav
        className="mx-auto flex h-16 w-full max-w-[1200px] items-center gap-4 border-x border-border/70 px-4 sm:px-6 lg:px-8"
        aria-label="Main navigation"
      >
        <div className="flex shrink-0 items-center">
          <Logo />
        </div>

        <div className="hidden items-center gap-1 lg:flex" data-main-navigation-links="desktop">
          {NAVIGATION_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "inline-flex min-h-touch items-center rounded-md px-3 text-sm " +
                  "text-muted-foreground transition-colors duration-150 hover:bg-muted/60 " +
                  "hover:text-foreground",
                isLinkActive(pathname, link.href) && "bg-muted text-foreground",
              )}
              aria-current={isLinkActive(pathname, link.href) ? "page" : undefined}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="ml-auto hidden min-w-0 flex-1 justify-end md:flex">
          <CommandMenu />
        </div>

        <div className="hidden shrink-0 items-center gap-2 sm:flex">
          <ThemeToggle />
          <Button variant="outline" size="icon" asChild>
            <Link href="/contribute" aria-label="Contribute to Astraa">
              <Github className="h-4 w-4" aria-hidden="true" />
            </Link>
          </Button>
        </div>

        <Button
          ref={menuButtonRef}
          variant="outline"
          size="icon"
          className="ml-auto shrink-0 lg:hidden"
          onClick={() => setIsMenuOpen((open) => !open)}
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={isMenuOpen}
          aria-controls="mobile-navigation"
        >
          {isMenuOpen ? (
            <X className="h-4 w-4" aria-hidden="true" />
          ) : (
            <Menu className="h-4 w-4" aria-hidden="true" />
          )}
        </Button>
      </nav>

      {isMenuOpen && (
        <div id="mobile-navigation" className="border-t bg-background lg:hidden">
          <div className="mx-auto w-full max-w-[1200px] border-x border-border/70 p-4 sm:px-6">
            <div className="mb-4 md:hidden">
              <CommandMenu onNavigate={() => setIsMenuOpen(false)} />
            </div>
            <div className="grid gap-1" data-main-navigation-links="mobile">
              {NAVIGATION_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "flex min-h-touch items-center justify-between rounded-md px-3 text-sm " +
                      "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                    isLinkActive(pathname, link.href) && "bg-muted text-foreground",
                  )}
                  aria-current={isLinkActive(pathname, link.href) ? "page" : undefined}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.label}
                  <ChevronRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              ))}
            </div>
            <div className="mt-4 flex items-center justify-between border-t pt-4 sm:hidden">
              <span className="text-sm text-muted-foreground">Appearance</span>
              <ThemeToggle />
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
