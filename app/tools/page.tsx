"use client"

import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toolCategories } from "@/lib/tools"
import Link from "next/link"

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

export default function ToolsPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-12">
      <motion.div 
        className="text-center space-y-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-bold">Tools Arsenal</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Discover our collection of powerful tools designed to enhance your workflow
        </p>
      </motion.div>

      {toolCategories.map((category, categoryIndex) => (
        <motion.div 
          key={category.name}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: categoryIndex * 0.2 }}
          className="space-y-6"
        >
          <h2 className="text-2xl font-semibold">{category.name}</h2>
          
          <motion.div 
            variants={container}
            initial="hidden"
            animate="show"
            className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
          >
            {category.items.map((tool) => (
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
      ))}
    </div>
  )
}