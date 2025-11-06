"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { AlertTriangle, RefreshCw, Home, ArrowLeft, Copy, Check } from "lucide-react"
import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const [copied, setCopied] = useState(false)
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    // Log error for debugging
    console.error('Application error:', error)
  }, [error])

  const copyErrorDetails = async () => {
    const errorDetails = `Error: ${error.message}\nDigest: ${error.digest || 'N/A'}\nTimestamp: ${new Date().toISOString()}`
    try {
      await navigator.clipboard.writeText(errorDetails)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy error details:', err)
    }
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
              scale: [1, 1.1, 1],
            }}
            transition={{ 
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="relative"
          >
            <div className="absolute inset-0 bg-destructive/20 rounded-full blur-xl" />
            <div className="relative mx-auto bg-destructive/10 w-20 h-20 rounded-full flex items-center justify-center">
              <AlertTriangle className="h-10 w-10 text-destructive" aria-hidden="true" />
            </div>
          </motion.div>
          
          {/* Error Message */}
          <div className="space-y-4">
            <motion.h1 
              className="text-3xl md:text-4xl font-bold text-destructive"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              Oops!
            </motion.h1>
            <div className="space-y-2">
              <h2 className="text-2xl md:text-3xl font-semibold">Something went wrong</h2>
              <p className="text-muted-foreground text-sm md:text-base max-w-md mx-auto">
                Don't worry, it's not your fault. An unexpected error occurred.
                Try refreshing the page or go back to continue.
              </p>
            </div>
          </div>

          {/* Primary Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button 
              size="lg" 
              onClick={reset}
              className="min-w-[140px] flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
              Try Again
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

          {/* Secondary Actions */}
          <div className="pt-4 border-t border-border space-y-4">
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="flex items-center gap-2"
              >
                <Link href="/">
                  <Home className="h-4 w-4" aria-hidden="true" />
                  Return Home
                </Link>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDetails(!showDetails)}
                className="flex items-center gap-2"
              >
                {showDetails ? 'Hide' : 'Show'} Error Details
              </Button>
            </div>

            {/* Error Details */}
            {showDetails && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="text-left"
              >
                <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-muted-foreground uppercase">Error Details</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={copyErrorDetails}
                      className="h-8 px-2 flex items-center gap-1"
                    >
                      {copied ? (
                        <>
                          <Check className="h-3 w-3" aria-hidden="true" />
                          <span className="text-xs">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3" aria-hidden="true" />
                          <span className="text-xs">Copy</span>
                        </>
                      )}
                    </Button>
                  </div>
                  <div className="text-sm space-y-1">
                    <p className="font-mono text-xs break-all">
                      <span className="font-semibold">Message:</span> {error.message}
                    </p>
                    {error.digest && (
                      <p className="font-mono text-xs break-all">
                        <span className="font-semibold">Digest:</span> {error.digest}
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </Card>
      </motion.div>
    </div>
  )
}