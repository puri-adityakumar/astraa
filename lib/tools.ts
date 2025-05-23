import { Key, Hash, Type, DollarSign, Music, Image as ImageIcon, Ruler, Calculator, Gamepad2, Brain, DivideIcon as LucideIcon } from "lucide-react"

export type ToolCategory = {
  name: string
  items: Tool[]
}

export type Tool = {
  name: string
  description: string
  path: string
  icon: LucideIcon
  wip?: boolean
}

export const toolCategories: ToolCategory[] = [
  {
    name: "Utilities",
    items: [
      {
        name: 'Password Generator',
        description: 'Create strong, secure passwords',
        path: '/tools/password',
        icon: Key
      },
      {
        name: 'Hash Generator',
        description: 'Generate various hash outputs',
        path: '/tools/hash',
        icon: Hash
      },
      {
        name: 'Text Generator',
        description: 'AI-powered text snippet generator',
        path: '/tools/text',
        icon: Type
      },
      {
        name: 'Currency Converter',
        description: 'Real-time currency conversion',
        path: '/tools/currency',
        icon: DollarSign
      },
      {
        name: 'Image Resizer',
        description: 'Resize images easily',
        path: '/tools/image',
        icon: ImageIcon
      },
      {
        name: 'Unit Converter',
        description: 'Convert between various units',
        path: '/tools/units',
        icon: Ruler
      },
      {
        name: 'Calculator',
        description: 'Scientific calculator with advanced functions',
        path: '/tools/calculator',
        icon: Calculator
      },
      {
        name: 'Lofi Focus Studio',
        description: 'Stream lofi music with productivity tools',
        path: '/tools/music',
        icon: Music
      }
    ]
  }
]

// Flatten all tools for search
export const tools = toolCategories.flatMap(category => category.items)