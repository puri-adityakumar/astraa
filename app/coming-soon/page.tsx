"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Rocket, Clock, Bell, Home, Mail } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import { useState } from "react"

export default function ComingSoon() {
  const [email, setEmail] = useState("")
  const [subscribed, setSubscribed] = useState(false)

  const handleNotifyMe = (e: React.FormEvent) => {
    e.preventDefault()
    // In a real app, this would send to a backend
    setSubscribed(true)
    setTimeout(() => {
      setEmail("")
      setSubscribed(false)
    }, 3000)
  }

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
              y: [0, -10, 0],
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="relative"
          >
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl" />
            <div className="relative mx-auto bg-gradient-to-br from-primary/20 to-secondary/20 w-24 h-24 rounded-full flex items-center justify-center">
              <Rocket className="h-12 w-12 text-primary" aria-hidden="true" />
            </div>
          </motion.div>
          
          {/* Message */}
          <div className="space-y-4">
            <motion.h1 
              className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              Coming Soon
            </motion.h1>
            <div className="space-y-2">
              <h2 className="text-xl md:text-2xl font-semibold">We're Working on Something Awesome</h2>
              <p className="text-muted-foreground text-sm md:text-base max-w-md mx-auto">
                This feature is currently under development. We're crafting something special
                and can't wait to share it with you!
              </p>
            </div>
          </div>

          {/* Progress Indicator */}
          <div className="space-y-3">
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" aria-hidden="true" />
              <span>Development in Progress</span>
            </div>
            <div className="max-w-md mx-auto">
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-primary to-secondary"
                  initial={{ width: "0%" }}
                  animate={{ width: "65%" }}
                  transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2">65% Complete</p>
            </div>
          </div>

          {/* Notify Me Form */}
          {!subscribed ? (
            <form onSubmit={handleNotifyMe} className="max-w-md mx-auto space-y-3">
              <p className="text-sm font-medium">Get notified when we launch</p>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full h-10 pl-10 pr-4 rounded-md border border-input bg-background text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    required
                    aria-label="Email address"
                  />
                </div>
                <Button type="submit" className="flex items-center gap-2">
                  <Bell className="h-4 w-4" aria-hidden="true" />
                  Notify Me
                </Button>
              </div>
            </form>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-md mx-auto p-4 bg-primary/10 rounded-lg border border-primary/20"
            >
              <p className="text-sm font-medium text-primary">
                ✓ Thanks! We'll notify you when this feature launches.
              </p>
            </motion.div>
          )}

          {/* Actions */}
          <div className="pt-4 border-t border-border">
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild variant="outline" size="lg" className="min-w-[140px]">
                <Link href="/" className="flex items-center gap-2">
                  <Home className="h-4 w-4" aria-hidden="true" />
                  Return Home
                </Link>
              </Button>
              <Button asChild variant="ghost" size="lg" className="min-w-[140px]">
                <Link href="/explore">
                  Explore Available Tools
                </Link>
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  )
}
