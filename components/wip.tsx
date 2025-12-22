"use client"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Construction } from "lucide-react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"

export function WorkInProgress() {
  const router = useRouter()
  const env = process.env.NEXT_PUBLIC_ENV

  if (env === 'prod') {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="w-[320px] md:w-[420px] glass overflow-hidden">
            <CardHeader className="text-center pb-2">
              <motion.div
                className="mx-auto mb-6 bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center"
                animate={{
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <Construction className="h-8 w-8 text-primary" />
              </motion.div>
              <CardTitle className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Coming Soon
              </CardTitle>
              <CardDescription className="text-base md:text-lg mt-2">
                This feature will be available soon
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4 px-4 md:px-6">
              <p className="text-muted-foreground text-sm md:text-base">
                We're working hard to bring you something amazing.
                Stay tuned for updates!
              </p>
            </CardContent>
            <CardFooter className="flex justify-center pb-6">
              <Button
                size="lg"
                onClick={() => router.back()}
                className="px-6 md:px-8"
              >
                Go Back
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    )
  }

  return null
}