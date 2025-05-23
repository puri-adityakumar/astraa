"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Github, Heart, Users, Zap } from "lucide-react"

const features = [
  {
    icon: Users,
    title: "Community Driven",
    description: "Built by developers for everyone. Your contributions help shape the future of astraa"
  },
  {
    icon: Zap,
    title: "Open Source",
    description: "Fully open source and free to use. Inspect the code, suggest improvements, or add new features."
  },
  {
    icon: Heart,
    title: "Made with Love",
    description: "Every feature is crafted with attention to detail and a focus on user experience."
  }
]

export default function ContributePage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <motion.div 
        className="text-center space-y-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-bold">Contribute to astraa</h1>
        <p className="text-muted-foreground">
          Help us make astraa better for everyone
        </p>
      </motion.div>

      <div className="grid gap-6 md:grid-cols-3">
        {features.map((feature) => (
          <Card key={feature.title} className="p-6 glass glass-hover">
            <feature.icon className="h-8 w-8 text-primary mb-4" />
            <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
            <p className="text-muted-foreground">{feature.description}</p>
          </Card>
        ))}
      </div>

      <Card className="p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Ready to Contribute?</h2>
        <p className="text-muted-foreground mb-6">
          Check out our GitHub repository to get started. Every contribution counts!
        </p>
        <Button asChild>
          <a 
            href="https://github.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="gap-2"
          >
            <Github className="h-4 w-4" />
            View on GitHub
          </a>
        </Button>
      </Card>
    </div>
  )
}