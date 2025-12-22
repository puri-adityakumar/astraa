"use client"

import { createContext, useContext, useState } from 'react'
import { tools, toolCategories, type Tool, type ToolCategory } from './tools'

interface ToolsContextType {
  tools: Tool[]
  categories: ToolCategory[]
  updateTools: (newTools: Tool[]) => void
  updateCategories: (newCategories: ToolCategory[]) => void
}

const ToolsContext = createContext<ToolsContextType>({
  tools: [],
  categories: [],
  updateTools: () => {},
  updateCategories: () => {}
})

export function ToolsProvider({ children }: { children: React.ReactNode }) {
  const [currentTools, setCurrentTools] = useState(tools)
  const [currentCategories, setCurrentCategories] = useState(toolCategories)

  const updateTools = (newTools: Tool[]) => {
    setCurrentTools(newTools)
  }

  const updateCategories = (newCategories: ToolCategory[]) => {
    setCurrentCategories(newCategories)
  }

  return (
    <ToolsContext.Provider value={{
      tools: currentTools,
      categories: currentCategories,
      updateTools,
      updateCategories
    }}>
      {children}
    </ToolsContext.Provider>
  )
}

export function useTools() {
  const context = useContext(ToolsContext)
  if (!context) {
    throw new Error('useTools must be used within a ToolsProvider')
  }
  return context
}