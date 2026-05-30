import { Key, Hash, Type, DollarSign, Music, Image as ImageIcon, Ruler, Calculator, Code, FileJson, Database, Terminal, Binary, FileText, type LucideIcon } from "lucide-react"

export type ToolCategory = {
  name: string
  items: Tool[]
}

export type Tool = {
  name: string
  description: string
  path: string
  icon: LucideIcon
  lastModified?: string
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
        icon: Key,
        lastModified: '2026-05-30',
      },
      {
        name: 'Hash Generator',
        description: 'Generate various hash outputs',
        path: '/tools/hash',
        icon: Hash,
        lastModified: '2026-05-30',
      },
      {
        name: 'Text Generator',
        description: 'Smart, context-aware Lorem Ipsum alternative',
        path: '/tools/text',
        icon: Type,
        lastModified: '2026-05-30',
      },
      {
        name: 'Currency Converter',
        description: 'Real-time currency conversion',
        path: '/tools/currency',
        icon: DollarSign,
        lastModified: '2026-05-30',
      },
      {
        name: 'Image Resizer',
        description: 'Resize images easily',
        path: '/tools/image',
        icon: ImageIcon,
        lastModified: '2026-05-30',
      },
      {
        name: 'Unit Converter',
        description: 'Convert between various units',
        path: '/tools/units',
        icon: Ruler,
        lastModified: '2026-05-30',
      },
      {
        name: 'Calculator',
        description: 'Scientific calculator with advanced functions',
        path: '/tools/calculator',
        icon: Calculator,
        lastModified: '2026-05-30',
      },
      {
        name: 'Markdown Viewer',
        description: 'Drop a markdown file to view, edit, and export',
        path: '/tools/markdown',
        icon: FileText,
        lastModified: '2026-05-30',
      },
      {
        name: 'Lofi Focus Studio',
        description: 'Stream lofi music with productivity tools',
        path: '/tools/music',
        icon: Music,
        comingSoon: true
      },

    ]
  },
  {
    name: "Developer Tools",
    items: [
      {
        name: 'Base64 Encoder/Decoder',
        description: 'Encode and decode Base64 strings',
        path: '/tools/base64',
        icon: Binary,
        comingSoon: true
      },
      {
        name: 'Code Snippet Generator',
        description: 'Generate beautiful code snippets',
        path: '/tools/snippet-generator',
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