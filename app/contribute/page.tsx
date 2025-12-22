"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Github, Heart, Users, Zap, Code, Bug, Lightbulb, FileText, MessageSquare, Star } from "lucide-react"

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

const contributionTypes = [
  {
    icon: Code,
    title: "Code Contributions",
    description: "Add new tools, fix bugs, or improve existing features",
    items: [
      "Create new utility tools or games",
      "Enhance existing tool functionality",
      "Improve performance and accessibility",
      "Write tests for better code coverage"
    ]
  },
  {
    icon: Bug,
    title: "Bug Reports",
    description: "Help us identify and fix issues",
    items: [
      "Report bugs with detailed reproduction steps",
      "Include screenshots or error messages",
      "Test fixes and provide feedback",
      "Verify issues on different browsers"
    ]
  },
  {
    icon: Lightbulb,
    title: "Feature Requests",
    description: "Suggest new ideas and improvements",
    items: [
      "Propose new tools or games",
      "Suggest UI/UX improvements",
      "Request accessibility enhancements",
      "Share workflow optimization ideas"
    ]
  },
  {
    icon: FileText,
    title: "Documentation",
    description: "Improve guides and documentation",
    items: [
      "Write or improve tool documentation",
      "Create tutorials and guides",
      "Fix typos and clarify instructions",
      "Translate content to other languages"
    ]
  }
]

const guidelines = [
  {
    title: "Getting Started",
    steps: [
      "Fork the repository on GitHub",
      "Clone your fork locally",
      "Create a new branch for your changes",
      "Make your changes and test thoroughly",
      "Submit a pull request with a clear description"
    ]
  },
  {
    title: "Code Standards",
    steps: [
      "Follow TypeScript best practices",
      "Maintain consistent code formatting",
      "Write clear, descriptive commit messages",
      "Include comments for complex logic",
      "Ensure accessibility compliance"
    ]
  },
  {
    title: "Pull Request Guidelines",
    steps: [
      "Provide a clear description of changes",
      "Reference related issues if applicable",
      "Include screenshots for UI changes",
      "Ensure all tests pass",
      "Be responsive to review feedback"
    ]
  }
]

export default function ContributePage() {
  return (
    <div className="max-w-6xl mx-auto space-y-8 sm:space-y-12">
      <motion.div 
        className="text-center space-y-3 sm:space-y-4 px-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-fluid-4xl font-bold">Contribute to astraa</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto text-fluid-base">
          Help us make astraa better for everyone. Whether you're a developer, designer, or user, there are many ways to contribute.
        </p>
      </motion.div>

      {/* Core Values */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-3 px-4">
        {features.map((feature, index) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="p-5 sm:p-6 glass glass-hover h-full">
              <feature.icon className="h-7 w-7 sm:h-8 sm:w-8 text-primary mb-3 sm:mb-4" />
              <h3 className="text-lg sm:text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground text-sm sm:text-base">{feature.description}</p>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Ways to Contribute */}
      <div className="space-y-4 sm:space-y-6">
        <h2 className="text-fluid-2xl font-bold text-center px-4">Ways to Contribute</h2>
        <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 px-4">
          {contributionTypes.map((type, index) => (
            <motion.div
              key={type.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
            >
              <Card className="p-5 sm:p-6 glass h-full">
                <div className="flex items-start gap-3 sm:gap-4 mb-3 sm:mb-4">
                  <type.icon className="h-6 w-6 sm:h-7 sm:w-7 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-lg sm:text-xl font-semibold mb-1">{type.title}</h3>
                    <p className="text-muted-foreground text-sm sm:text-base">{type.description}</p>
                  </div>
                </div>
                <ul className="space-y-2 ml-10 sm:ml-11">
                  {type.items.map((item, i) => (
                    <li key={i} className="text-sm sm:text-base text-muted-foreground flex items-start">
                      <span className="mr-2 text-primary">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Contribution Guidelines */}
      <div className="space-y-4 sm:space-y-6">
        <h2 className="text-fluid-2xl font-bold text-center px-4">Contribution Guidelines</h2>
        <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-3 px-4">
          {guidelines.map((guideline, index) => (
            <motion.div
              key={guideline.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 + index * 0.1 }}
            >
              <Card className="p-5 sm:p-6 glass h-full">
                <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">{guideline.title}</h3>
                <ol className="space-y-2">
                  {guideline.steps.map((step, i) => (
                    <li key={i} className="text-sm sm:text-base text-muted-foreground flex items-start">
                      <span className="mr-2 text-primary font-semibold">{i + 1}.</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Call to Action */}
      <Card className="p-6 sm:p-8 text-center mx-4 glass">
        <div className="flex justify-center gap-2 mb-4">
          <Star className="h-6 w-6 text-primary" />
          <MessageSquare className="h-6 w-6 text-primary" />
          <Github className="h-6 w-6 text-primary" />
        </div>
        <h2 className="text-fluid-2xl font-bold mb-3 sm:mb-4">Ready to Contribute?</h2>
        <p className="text-muted-foreground mb-5 sm:mb-6 text-fluid-base max-w-2xl mx-auto">
          Check out our GitHub repository to get started. Star the repo, open an issue, or submit a pull request. Every contribution counts!
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild className="min-h-touch">
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
          <Button asChild variant="outline" className="min-h-touch">
            <a 
              href="https://github.com/issues" 
              target="_blank" 
              rel="noopener noreferrer"
              className="gap-2"
            >
              <Bug className="h-4 w-4" />
              Report an Issue
            </a>
          </Button>
        </div>
      </Card>
    </div>
  )
}