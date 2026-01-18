"use client"

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, Copy, Sparkles } from "lucide-react"
import { generateText } from "@/lib/openrouter"
import { copyToClipboard } from "@/lib/clipboard"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

export default function TextGeneratorPage() {
  const [topic, setTopic] = useState("")
  const [wordCount, setWordCount] = useState(100)
  const [generatedText, setGeneratedText] = useState("")
  const [isPending, startTransition] = useTransition()

  const handleGenerate = () => {
    if (!topic) {
      toast.error("Please enter a topic")
      return
    }

    startTransition(async () => {
      const result = await generateText(topic, wordCount)
      if (result.success && result.text) {
        setGeneratedText(String(result.text))
        toast.success("Text generated successfully!")
      } else {
        toast.error(result.error || "Something went wrong")
      }
    })
  }

  const handleCopyToClipboard = async () => {
    if (!generatedText) return
    const result = await copyToClipboard(generatedText)
    if (result.success) {
      toast.success("Copied to clipboard")
    } else {
      toast.error(result.error || "Failed to copy")
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleGenerate()
    }
  }

  return (
    <div className="container max-w-5xl pt-24 pb-12 space-y-8">
      {/* Heading */}
      <div className="space-y-2 text-center sm:text-left">
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          AI Text Generator
        </h1>
        <p className="text-muted-foreground text-lg">
          The modern alternative to Lorem Ipsum. Generate meaningful, context-aware placeholder text tailored to your specific topic.
        </p>
      </div>

      {/* Input Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center p-2 rounded-xl bg-muted/30 border border-border/50">
        <div className="flex-1 w-full relative">
          <Input
            id="topic"
            placeholder="Type a topic (e.g. 'Coffee brewing methods')"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            onKeyDown={handleKeyDown}
            className="h-12 border-0 bg-transparent shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 text-base placeholder:text-muted-foreground/50"
          />
        </div>

        {/* Mobile Divider (Horizontal) */}
        <div className="w-full h-[1px] bg-border sm:hidden" />
        {/* Desktop Divider (Vertical) */}
        <div className="h-8 w-[1px] bg-border hidden sm:block" />

        {/* Controls Container */}
        <div className="flex items-center justify-between w-full sm:w-auto gap-4 px-2">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground whitespace-nowrap">Words:</span>
            <Input
              id="words"
              type="number"
              min={10}
              max={1000}
              value={wordCount}
              onChange={(e) => setWordCount(Number(e.target.value))}
              className="h-9 w-20 text-center border-muted-foreground/20 bg-background/50 focus-visible:ring-1"
            />
          </div>

          <Button
            size="icon"
            onClick={handleGenerate}
            disabled={isPending || !topic}
            className={cn(
              "h-10 w-10 shrink-0 rounded-full transition-all duration-300",
              !isPending && "bg-gradient-to-r from-emerald-500 to-cyan-500 hover:opacity-90 hover:scale-105 shadow-[0_0_15px_-3px_rgba(6,182,212,0.6)]"
            )}
          >
            {isPending ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Sparkles className="h-5 w-5 text-white" />
            )}
            <span className="sr-only">Generate</span>
          </Button>
        </div>
      </div>

      {/* Output Area */}
      <div className="relative min-h-[500px] rounded-xl border border-border bg-card/50 shadow-sm backdrop-blur-sm transition-all">
        {generatedText ? (
          <>
            <Textarea
              className="min-h-[500px] w-full p-8 text-lg leading-relaxed resize-none bg-transparent border-0 focus-visible:ring-0"
              value={generatedText}
              readOnly
            />
            <Button
              size="icon"
              variant="outline"
              className="absolute top-4 right-4 h-9 w-9 bg-background/80 backdrop-blur-md hover:bg-background transition-colors"
              onClick={handleCopyToClipboard}
              title="Copy to clipboard"
            >
              <Copy className="h-4 w-4" />
              <span className="sr-only">Copy</span>
            </Button>
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground/30 p-8 text-center select-none pointer-events-none">
            <Sparkles className="h-16 w-16 mb-4 opacity-20" />
            <p className="text-xl font-medium">Ready to generate</p>
            <p className="text-sm mt-2 max-w-sm">
              Enter a topic above and hit the magic button to create unique, context-aware placeholder text.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}