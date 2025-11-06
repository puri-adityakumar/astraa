"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { FileQuestion, Home, Search, Compass, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"

const quickLinks = [
  { href: "/", label: "Home", icon: Home },
  { href: "/explore", label: "Explore Tools", icon: Compass },
  { href: "/games", label: "Games", icon: Search },
]

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl"
      >
        <Card className="glass p-6 md:p-10 text-center space-y-8">
          {/* Animated Icon */}
          <motion.div 
            animate={{ 
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ 
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="relative"
          >
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl" />
            <div className="relative mx-auto bg-primary/10 w-20 h-20 rounded-full flex items-center justify-center">
              <FileQuestion className="h-10 w-10 text-primary" aria-hidden="true" />
            </div>
          </motion.div>
          
          {/* Error Message */}
          <div className="space-y-4">
            <motion.h1 
              className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              404
            </motion.h1>
            <div className="space-y-2">
              <h2 className="text-2xl md:text-3xl font-semibold">Page Not Found</h2>
              <p className="text-muted-foreground text-sm md:text-base max-w-md mx-auto">
                Oops! The page you're looking for seems to have wandered off into the digital void.
                Let's get you back on track.
              </p>
            </div>
          </div>

          {/* Primary Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild size="lg" className="min-w-[140px]">
              <Link href="/" className="flex items-center gap-2">
                <Home className="h-4 w-4" aria-hidden="true" />
                Return Home
              </Link>
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => window.history.back()}
              className="min-w-[140px] flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Go Back
            </Button>
          </div>

          {/* Quick Links */}
          <div className="pt-4 border-t border-border">
            <p className="text-sm text-muted-foreground mb-4">Or explore these popular sections:</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {quickLinks.map((link, index) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                >
                  <Button
                    asChild
                    variant="ghost"
                    className="w-full h-auto py-4 flex flex-col gap-2 hover:bg-primary/10 hover:text-primary transition-all duration-200"
                  >
                    <Link href={link.href}>
                      <link.icon className="h-5 w-5" aria-hidden="true" />
                      <span className="text-sm font-medium">{link.label}</span>
                    </Link>
                  </Button>
                </motion.div>
              ))}
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  )
}