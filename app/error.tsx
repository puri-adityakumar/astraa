"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { AlertTriangle } from "lucide-react"
import { useEffect } from "react"
import { motion } from "framer-motion"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="w-[420px] glass p-8 text-center space-y-8">
          <motion.div 
            animate={{ 
              scale: [1, 1.1, 1],
            }}
            transition={{ 
              duration: 1,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="relative"
          >
            <div className="absolute inset-0 bg-destructive/20 rounded-full blur-xl" />
            <div className="relative mx-auto bg-destructive/10 w-20 h-20 rounded-full flex items-center justify-center">
              <AlertTriangle className="h-10 w-10 text-destructive" />
            </div>
          </motion.div>
          
          <div className="space-y-4">
            <h2 className="text-3xl font-bold text-destructive">
              Oops!
            </h2>
            <div className="space-y-2">
              <h3 className="text-2xl font-semibold">Something went wrong</h3>
              <p className="text-muted-foreground">
                Don't worry, it's not your fault. We're working on fixing this issue.
                Please try again or contact support if the problem persists.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Button 
              size="lg" 
              onClick={reset}
              className="w-full"
            >
              Try Again
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => window.history.back()}
              className="w-full"
            >
              Go Back
            </Button>
          </div>
        </Card>
      </motion.div>
    </div>
  )
}