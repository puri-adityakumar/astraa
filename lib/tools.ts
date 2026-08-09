import {
  Key,
  Hash,
  Type,
  DollarSign,
  Music,
  Image as ImageIcon,
  Ruler,
  Calculator,
  Code,
  FileJson,
  Database,
  Terminal,
  Binary,
  FileText,
  type LucideIcon,
} from "lucide-react";

import { isAvailable, isComingSoon } from "@/lib/catalog";
import type { CatalogEntry } from "@/lib/catalog";

const TOOL_IDS = [
  "password",
  "hash",
  "text",
  "currency",
  "image",
  "units",
  "calculator",
  "markdown",
  "music",
  "base64",
  "snippet-generator",
  "json",
  "sql",
  "regex",
] as const;

export type ToolId = (typeof TOOL_IDS)[number];

export type ToolCategory = {
  name: string;
  items: Tool[];
};

export type Tool = CatalogEntry & {
  id: ToolId;
  icon: LucideIcon;
  relatedToolIds: readonly ToolId[];
};

export const toolCategories: ToolCategory[] = [
  {
    name: "Utilities",
    items: [
      {
        id: "password",
        name: "Password Generator",
        description: "Create customizable random or memorable passwords in your browser",
        path: "/tools/password",
        icon: Key,
        status: "available",
        processing: "local",
        relatedToolIds: ["hash", "base64"],
      },
      {
        id: "hash",
        name: "Hash Generator",
        description: "Generate MD5 and SHA hash outputs in your browser",
        path: "/tools/hash",
        icon: Hash,
        status: "available",
        processing: "local",
        relatedToolIds: ["password", "base64", "json"],
      },
      {
        id: "text",
        name: "AI Text Generator",
        description: "Generate placeholder copy through Astraa's server and an AI provider",
        path: "/tools/text",
        icon: Type,
        status: "available",
        processing: "server",
        relatedToolIds: ["markdown", "snippet-generator", "regex"],
      },
      {
        id: "currency",
        name: "Currency Converter",
        description:
          "Send a pair to Astraa's rate endpoint, then convert the amount in your browser",
        path: "/tools/currency",
        icon: DollarSign,
        status: "available",
        processing: "server",
        relatedToolIds: ["units", "calculator"],
      },
      {
        id: "image",
        name: "Image Resizer",
        description: "Resize and convert JPEG, PNG, and WebP images in your browser",
        path: "/tools/image",
        icon: ImageIcon,
        status: "available",
        processing: "local",
        relatedToolIds: ["snippet-generator", "base64"],
      },
      {
        id: "units",
        name: "Unit Converter",
        description: "Convert common metric and imperial measurements in your browser",
        path: "/tools/units",
        icon: Ruler,
        status: "available",
        processing: "local",
        relatedToolIds: ["calculator", "currency"],
      },
      {
        id: "calculator",
        name: "Scientific Calculator",
        description: "Run scientific calculations in your browser",
        path: "/tools/calculator",
        icon: Calculator,
        status: "available",
        processing: "local",
        relatedToolIds: ["units", "currency"],
      },
      {
        id: "markdown",
        name: "Markdown Editor",
        description: "Write, preview, store, and export Markdown in your browser",
        path: "/tools/markdown",
        icon: FileText,
        status: "available",
        processing: "local",
        relatedToolIds: ["json", "text", "snippet-generator"],
      },
      {
        id: "music",
        name: "Lofi Focus Studio",
        description: "Planned streaming audio and focus tools",
        path: "/tools/music",
        icon: Music,
        status: "coming-soon",
        processing: "hybrid",
        relatedToolIds: ["text", "markdown"],
      },
    ],
  },
  {
    name: "Developer Tools",
    items: [
      {
        id: "base64",
        name: "Base64 Encoder/Decoder",
        description: "Encode and decode Base64 text or files in your browser",
        path: "/tools/base64",
        icon: Binary,
        status: "available",
        processing: "local",
        relatedToolIds: ["json", "hash", "image"],
      },
      {
        id: "snippet-generator",
        name: "Code Snippet Generator",
        description: "Turn code or screenshots into shareable images in your browser",
        path: "/tools/snippet-generator",
        icon: Code,
        status: "available",
        processing: "local",
        relatedToolIds: ["image", "markdown", "json"],
      },
      {
        id: "json",
        name: "JSON Editor",
        description: "Edit, validate, convert, and generate types from JSON in your browser",
        path: "/tools/json",
        icon: FileJson,
        status: "available",
        processing: "local",
        relatedToolIds: ["base64", "markdown", "regex"],
      },
      {
        id: "sql",
        name: "SQL Formatter",
        description: "Format SQL layout and keyword casing locally in your browser",
        path: "/tools/sql",
        icon: Database,
        status: "available",
        processing: "local",
        relatedToolIds: ["json", "regex"],
      },
      {
        id: "regex",
        name: "Regex Tester",
        description: "Test JavaScript regular expressions safely in your browser",
        path: "/tools/regex",
        icon: Terminal,
        status: "available",
        processing: "local",
        relatedToolIds: ["json", "text", "snippet-generator"],
      },
    ],
  },
];

export const tools = toolCategories.flatMap((category) => category.items);

export const availableTools = tools.filter(isAvailable);
export const comingSoonTools = tools.filter(isComingSoon);
export const localTools = availableTools.filter((tool) => tool.processing === "local");

export function getToolById(id: ToolId): Tool | undefined {
  return tools.find((tool) => tool.id === id);
}

export function getToolByPath(path: string): Tool | undefined {
  return tools.find((tool) => tool.path === path);
}
