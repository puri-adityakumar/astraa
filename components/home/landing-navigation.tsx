"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Github, Menu, X, Home, Compass } from "lucide-react";
import Link from "next/link";
import { CommandMenu } from "@/components/command-menu";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Mobile navigation - simplified list
const mobileNavigationLinks = [
  { href: "/", label: "Home", icon: Home },
  { href: "/explore", label: "Explore", icon: Compass },
  { href: "/contribute", label: "Contribute", icon: Github },
];

export function LandingNavigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close menu when clicking outside or pressing Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsMenuOpen(false);
    };

    if (isMenuOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  return (
    <nav
      className={cn(
        "sticky top-0 z-50 transition-all duration-300",
        isScrolled
          ? "border-b border-border bg-background/90 shadow-sm backdrop-blur-md"
          : "border-b border-transparent bg-transparent",
      )}
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="container mx-auto max-w-7xl px-4 md:px-6">
        <div className="flex h-14 items-center justify-between gap-2 sm:h-16 sm:gap-4 lg:grid lg:grid-cols-3">
          {/* Left Section: Logo */}
          <div className="flex items-center justify-start gap-4">
            <div className="flex-shrink-0">
              <Logo />
            </div>
          </div>

          {/* Center Section: Command Menu (Search) */}
          <div className="hidden justify-center md:flex">
            <CommandMenu />
          </div>

          {/* Right Section: Actions */}
          <div className="flex items-center justify-end gap-2 sm:gap-3">
            <ThemeToggle />

            {/* GitHub Link - Desktop */}
            <Button
              variant="ghost"
              size="icon"
              asChild
              className="hidden min-h-touch min-w-touch transition-colors duration-200 hover:bg-primary/10 hover:text-primary sm:inline-flex"
            >
              <Link href="/contribute" aria-label="Contribute on GitHub">
                <Github className="h-5 w-5" aria-hidden="true" />
              </Link>
            </Button>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="min-h-touch min-w-touch transition-colors duration-200 hover:bg-primary/10 lg:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={isMenuOpen}
              aria-controls="mobile-menu"
            >
              <AnimatePresence mode="wait" initial={false}>
                {isMenuOpen ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <X className="h-5 w-5" aria-hidden="true" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Menu className="h-5 w-5" aria-hidden="true" />
                  </motion.div>
                )}
              </AnimatePresence>
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm lg:hidden"
              style={{ top: "var(--nav-height, 64px)" }}
              onClick={() => setIsMenuOpen(false)}
              aria-hidden="true"
            />

            {/* Menu Panel */}
            <motion.div
              id="mobile-menu"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              className="fixed left-0 right-0 border-b border-border bg-background shadow-lg lg:hidden"
              style={{ top: "var(--nav-height, 64px)" }}
              role="menu"
              aria-orientation="vertical"
            >
              <div className="container mx-auto max-h-[calc(100vh-var(--nav-height,64px))] space-y-2 overflow-y-auto px-4 py-4">
                {/* Command Menu - Mobile */}
                <div className="mb-4 md:hidden">
                  <CommandMenu />
                </div>

                {/* Navigation Links - Using mobile-specific list */}
                <nav className="space-y-1" aria-label="Mobile navigation">
                  {mobileNavigationLinks.map((link, index) => (
                    <motion.div
                      key={link.href}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05, duration: 0.2 }}
                    >
                      <Link
                        href={link.href}
                        className={cn(
                          "flex items-center gap-3 rounded-lg px-4 py-3 text-base font-medium",
                          "transition-all duration-200 hover:bg-primary/10 hover:text-primary",
                          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                          "group min-h-touch",
                        )}
                        onClick={() => setIsMenuOpen(false)}
                        role="menuitem"
                      >
                        <link.icon
                          className="h-5 w-5 transition-transform duration-200 group-hover:scale-110"
                          aria-hidden="true"
                        />
                        <span>{link.label}</span>
                      </Link>
                    </motion.div>
                  ))}
                </nav>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
}
