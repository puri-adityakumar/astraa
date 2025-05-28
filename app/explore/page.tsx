"use client"

import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Gamepad2, Wrench } from "lucide-react"
import { useTools } from "@/lib/tools-context"
import { games } from "@/lib/games"

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
}

export default function ExplorePage() {
  const { categories } = useTools()

  return (
    <div className="max-w-6xl mx-auto space-y-12">
      <motion.div 
        className="text-center space-y-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-bold">Explore</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Discover our collection of tools and games
        </p>
      </motion.div>

      {/* Tools Section */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-6"
      >
        <div className="flex items-center gap-2">
          <Wrench className="h-6 w-6" />
          <h2 className="text-2xl font-semibold">Tools</h2>
        </div>
        
        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
        >
          {categories[0].items.map((tool) => (
            <motion.div key={tool.path} variants={item}>
              <Link href={tool.path}>
                <Card className="p-6 glass glass-hover group space-y-4">
                  <div className="flex items-center justify-between">
                    <tool.icon className="h-8 w-8 text-primary group-hover:text-accent transition-colors" />
                    {tool.wip && (
                      <Badge variant="secondary">Work in Progress</Badge>
                    )}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">{tool.name}</h3>
                    <p className="text-muted-foreground">{tool.description}</p>
                  </div>
                </Card>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      {/* Games Section */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-6"
      >
        <div className="flex items-center gap-2">
          <Gamepad2 className="h-6 w-6" />
          <h2 className="text-2xl font-semibold">Games</h2>
        </div>
        
        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
        >
          {games.map((game) => (
            <motion.div key={game.path} variants={item}>
              <Link href={game.path}>
                <Card className="p-6 glass glass-hover group space-y-4">
                  <div className="flex items-center justify-between">
                    <game.icon className="h-8 w-8 text-primary group-hover:text-accent transition-colors" />
                    {game.comingSoon && (
                      <Badge variant="secondary">Coming Soon</Badge>
                    )}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">{game.name}</h3>
                    <p className="text-muted-foreground">{game.description}</p>
                  </div>
                </Card>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </div>
  )
}