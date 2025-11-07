"use client"

import { CommandMenu } from './command-menu'
import { Logo } from './logo'
import { EnhancedThemeToggle } from './theme/enhanced-theme-toggle'
import { AccessibilityPanel } from './accessibility/accessibility-panel'
import Link from 'next/link'
import { Github, Menu, X, Home, Compass, Gamepad2, Wrench, Heart } from 'lucide-react'
import { Button } from './ui/button'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

const navigationLinks = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/explore', label: 'Explore', icon: Compass },
  { href: '/games', label: 'Games', icon: Gamepad2 },
  { href: '/tools', label: 'Tools', icon: Wrench },
  { href: '/contribute', label: 'Contribute', icon: Heart },
]

export function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close menu when clicking outside or pressing Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsMenuOpen(false)
    }

    if (isMenuOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
    }
  }, [isMenuOpen])

  return (
    <nav 
      className={cn(
        "border-b backdrop-blur-md sticky top-0 z-50 transition-all duration-300",
        isScrolled 
          ? "bg-background/95 border-border shadow-md" 
          : "bg-background/80 border-border/50"
      )}
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 sm:h-16 items-center justify-between gap-2 sm:gap-4">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Logo />
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center gap-1">
            {navigationLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "px-3 py-2 rounded-md text-sm font-medium transition-all duration-200",
                  "hover:bg-primary/10 hover:text-primary",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                  "min-h-touch flex items-center gap-2"
                )}
                aria-label={link.label}
              >
                <link.icon className="h-4 w-4" aria-hidden="true" />
                <span>{link.label}</span>
              </Link>
            ))}
          </div>

          {/* Command Menu - Desktop */}
          <div className="flex-1 hidden md:flex justify-center px-4 max-w-2xl mx-auto lg:max-w-md">
            <CommandMenu />
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            <AccessibilityPanel />
            <EnhancedThemeToggle />
            
            {/* GitHub Link - Desktop */}
            <Button 
              variant="ghost" 
              size="icon" 
              asChild 
              className="hidden sm:inline-flex min-h-touch min-w-touch hover:bg-primary/10 hover:text-primary transition-colors duration-200"
            >
              <Link href="/contribute" aria-label="Contribute on GitHub">
                <Github className="h-5 w-5" aria-hidden="true" />
              </Link>
            </Button>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden min-h-touch min-w-touch hover:bg-primary/10 transition-colors duration-200"
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
              style={{ top: 'var(--nav-height, 64px)' }}
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
              className="fixed left-0 right-0 lg:hidden bg-background border-b border-border shadow-lg"
              style={{ top: 'var(--nav-height, 64px)' }}
              role="menu"
              aria-orientation="vertical"
            >
              <div className="container mx-auto px-4 py-4 space-y-2 max-h-[calc(100vh-var(--nav-height,64px))] overflow-y-auto">
                {/* Command Menu - Mobile */}
                <div className="md:hidden mb-4">
                  <CommandMenu />
                </div>

                {/* Navigation Links */}
                <nav className="space-y-1" aria-label="Mobile navigation">
                  {navigationLinks.map((link, index) => (
                    <motion.div
                      key={link.href}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05, duration: 0.2 }}
                    >
                      <Link
                        href={link.href}
                        className={cn(
                          "flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium",
                          "hover:bg-primary/10 hover:text-primary transition-all duration-200",
                          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                          "min-h-touch group"
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

                {/* GitHub Link - Mobile */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: navigationLinks.length * 0.05, duration: 0.2 }}
                  className="pt-4 border-t border-border sm:hidden"
                >
                  <Link
                    href="/contribute"
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium",
                      "hover:bg-primary/10 hover:text-primary transition-all duration-200",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      "min-h-touch group"
                    )}
                    onClick={() => setIsMenuOpen(false)}
                    role="menuitem"
                  >
                    <Github 
                      className="h-5 w-5 transition-transform duration-200 group-hover:scale-110" 
                      aria-hidden="true" 
                    />
                    <span>GitHub</span>
                  </Link>
                </motion.div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  )
}