import { Key, Hash, Type, DollarSign, Music, Image as ImageIcon, Ruler, Calculator, Code, FileJson, Database, Terminal, Palette, type LucideIcon } from "lucide-react"

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
  comingSoon?: boolean
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
        icon: Type,
        comingSoon: true
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
        icon: Music,
        comingSoon: true
      },
      {
        name: 'Color Palette Generator',
        description: 'Generate beautiful color schemes',
        path: '/tools/colors',
        icon: Palette
      }
    ]
  },
  {
    name: "Developer Tools",
    items: [
      {
        name: 'Code Formatter',
        description: 'Format and beautify code snippets',
        path: '/tools/code-formatter',
        icon: Code,
        comingSoon: true
      },
      {
        name: 'JSON Validator',
        description: 'Validate and format JSON data',
        path: '/tools/json',
        icon: FileJson,
        comingSoon: true
      },
      {
        name: 'SQL Formatter',
        description: 'Format and validate SQL queries',
        path: '/tools/sql',
        icon: Database,
        comingSoon: true
      },
      {
        name: 'Regex Tester',
        description: 'Test and validate regular expressions',
        path: '/tools/regex',
        icon: Terminal,
        comingSoon: true
      }
    ]
  }
]

// Flatten all tools for search
export const tools = toolCategories.flatMap(category => category.items)