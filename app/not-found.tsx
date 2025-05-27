import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { FileQuestion } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="w-[320px] md:w-[420px] glass p-6 md:p-8 text-center space-y-8">
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
            <div className="relative mx-auto bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center">
              <FileQuestion className="h-8 w-8 text-primary" />
            </div>
          </motion.div>
          
          <div className="space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              404
            </h2>
            <div className="space-y-2">
              <h3 className="text-xl md:text-2xl font-semibold">Page Not Found</h3>
              <p className="text-muted-foreground text-sm md:text-base">
                Oops! The page you're looking for seems to have wandered off.
                Let's get you back on track.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Button asChild size="lg" className="w-full">
              <Link href="/">Return Home</Link>
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