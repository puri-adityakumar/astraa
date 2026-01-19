"use client"

import { useState } from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Copy, Check, FileText, Eye } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"

const SAMPLE_MARKDOWN = `# Welcome to Markdown Viewer

This viewer supports **GitHub Flavored Markdown** (GFM).

## Features

- [x] Task lists
- [x] Tables
- [x] Strikethrough
- [ ] More to come!

## Code Example

\`\`\`javascript
const greeting = "Hello, World!";
console.log(greeting);
\`\`\`

## Table Example

| Feature | Status |
|---------|--------|
| Tables | Supported |
| Links | Supported |
| Images | Supported |

## Links

Visit [GitHub](https://github.com) for more info.

---

> This is a blockquote with ~~strikethrough~~ text.
`

type ViewMode = "split" | "edit" | "preview"

export function MarkdownViewerClient() {
  const { toast } = useToast()
  const [markdown, setMarkdown] = useState(SAMPLE_MARKDOWN)
  const [viewMode, setViewMode] = useState<ViewMode>("split")
  const [copied, setCopied] = useState(false)

  const copyMarkdown = async () => {
    await navigator.clipboard.writeText(markdown)
    setCopied(true)
    toast({ title: "Copied!", description: "Markdown copied to clipboard" })
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="container px-4 sm:px-6 max-w-6xl pt-24 pb-12 space-y-8">
      <div className="space-y-4 text-center sm:text-left">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
          Markdown Viewer
        </h1>
        <p className="text-muted-foreground text-base sm:text-lg">
          Live preview with GitHub Flavored Markdown support
        </p>
      </div>

      <Card className="p-4 sm:p-6">
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <div className="flex p-1 bg-muted/50 rounded-lg">
            <button
              onClick={() => setViewMode("edit")}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-all",
                viewMode === "edit"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <FileText className="h-4 w-4" />
              Edit
            </button>
            <button
              onClick={() => setViewMode("split")}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-all",
                viewMode === "split"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Split
            </button>
            <button
              onClick={() => setViewMode("preview")}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-all",
                viewMode === "preview"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Eye className="h-4 w-4" />
              Preview
            </button>
          </div>
          <Button variant="outline" size="sm" onClick={copyMarkdown} className="ml-auto">
            {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
            Copy
          </Button>
        </div>

        <div className={cn(
          "grid gap-6",
          viewMode === "split" && "lg:grid-cols-2",
          viewMode !== "split" && "grid-cols-1"
        )}>
          {(viewMode === "edit" || viewMode === "split") && (
            <div className="space-y-2">
              <Label>Markdown</Label>
              <Textarea
                value={markdown}
                onChange={(e) => setMarkdown(e.target.value)}
                placeholder="Write your markdown here..."
                className="font-mono text-sm min-h-[500px] resize-none"
                spellCheck={false}
              />
            </div>
          )}

          {(viewMode === "preview" || viewMode === "split") && (
            <div className="space-y-2">
              <Label>Preview</Label>
              <div className="min-h-[500px] p-4 bg-muted/30 rounded-md border overflow-auto">
                <article className="prose prose-sm dark:prose-invert max-w-none prose-headings:font-bold prose-a:text-primary prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-pre:bg-muted prose-pre:border">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {markdown || "*Start typing to see preview...*"}
                  </ReactMarkdown>
                </article>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
