"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Wrench, Clock, RefreshCw, Home, AlertCircle } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import { useEffect, useState } from "react"

export default function Maintenance() {
  const [timeRemaining, setTimeRemaining] = useState({
    hours: 2,
    minutes: 30,
    seconds: 0
  })

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 }
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 }
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 }
        }
        return prev
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

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
              rotate: [0, 10, -10, 0],
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="relative"
          >
            <div className="absolute inset-0 bg-orange-500/20 rounded-full blur-xl" />
            <div className="relative mx-auto bg-orange-500/10 w-24 h-24 rounded-full flex items-center justify-center">
              <Wrench className="h-12 w-12 text-orange-500" aria-hidden="true" />
            </div>
          </motion.div>
          
          {/* Message */}
          <div className="space-y-4">
            <motion.h1 
              className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              Under Maintenance
            </motion.h1>
            <div className="space-y-2">
              <h2 className="text-xl md:text-2xl font-semibold">We'll Be Back Soon</h2>
              <p className="text-muted-foreground text-sm md:text-base max-w-md mx-auto">
                We're currently performing scheduled maintenance to improve your experience.
                Thanks for your patience!
              </p>
            </div>
          </div>

          {/* Countdown Timer */}
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" aria-hidden="true" />
              <span>Estimated Return Time</span>
            </div>
            <div className="flex justify-center gap-4">
              {[
                { label: 'Hours', value: timeRemaining.hours },
                { label: 'Minutes', value: timeRemaining.minutes },
                { label: 'Seconds', value: timeRemaining.seconds }
              ].map((item, index) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="flex flex-col items-center"
                >
                  <div className="bg-muted/50 rounded-lg p-3 md:p-4 min-w-[60px] md:min-w-[80px]">
                    <span className="text-2xl md:text-3xl font-bold tabular-nums">
                      {String(item.value).padStart(2, '0')}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground mt-2">{item.label}</span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Status Updates */}
          <div className="bg-muted/30 rounded-lg p-4 space-y-2">
            <div className="flex items-center justify-center gap-2 text-sm font-medium">
              <AlertCircle className="h-4 w-4 text-orange-500" aria-hidden="true" />
              <span>What's Happening</span>
            </div>
            <ul className="text-sm text-muted-foreground space-y-1 text-left max-w-md mx-auto">
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span>Database optimization complete</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-500 mt-0.5">⟳</span>
                <span>Deploying new features and improvements</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-muted-foreground/50 mt-0.5">○</span>
                <span>Running final tests and checks</span>
              </li>
            </ul>
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-border">
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button 
                onClick={() => window.location.reload()}
                size="lg" 
                className="min-w-[140px] flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" aria-hidden="true" />
                Refresh Page
              </Button>
              <Button asChild variant="outline" size="lg" className="min-w-[140px]">
                <Link href="/" className="flex items-center gap-2">
                  <Home className="h-4 w-4" aria-hidden="true" />
                  Return Home
                </Link>
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-4">
              Need immediate assistance? Contact us at support@astrah.tools
            </p>
          </div>
        </Card>
      </motion.div>
    </div>
  )
}
