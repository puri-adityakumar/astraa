"use client";

import { useState, useTransition } from "react";
import { Loader2, Copy, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { copyToClipboard } from "@/lib/clipboard";
import { generateText } from "@/lib/openrouter";
import { cn } from "@/lib/utils";

export default function TextGeneratorPage() {
  const [topic, setTopic] = useState("");
  const [wordCount, setWordCount] = useState(100);
  const [generatedText, setGeneratedText] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleGenerate = () => {
    if (!topic) {
      toast.error("Please enter a topic");
      return;
    }

    startTransition(async () => {
      const result = await generateText(topic, wordCount);
      if (result.success && result.text) {
        setGeneratedText(String(result.text));
        toast.success("Text generated successfully!");
      } else {
        toast.error(result.error || "Something went wrong");
      }
    });
  };

  const handleCopyToClipboard = async () => {
    if (!generatedText) return;
    const result = await copyToClipboard(generatedText);
    if (result.success) {
      toast.success("Copied to clipboard");
    } else {
      toast.error(result.error || "Failed to copy");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleGenerate();
    }
  };

  return (
    <div className="container max-w-5xl space-y-8 pb-12 pt-24">
      {/* Heading */}
      <div className="space-y-2 text-center sm:text-left">
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          AI Text Generator
        </h1>
        <p className="text-lg text-muted-foreground">
          The modern alternative to Lorem Ipsum. Generate meaningful,
          context-aware placeholder text tailored to your specific topic.
        </p>
      </div>

      {/* Input Bar */}
      <div className="flex flex-col items-center gap-4 rounded-xl border border-border/50 bg-muted/30 p-2 sm:flex-row">
        <div className="relative w-full flex-1">
          <Input
            id="topic"
            placeholder="Type a topic (e.g. 'Coffee brewing methods')"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            onKeyDown={handleKeyDown}
            className="h-12 border-0 bg-transparent text-base shadow-none placeholder:text-muted-foreground/50 focus-visible:ring-0 focus-visible:ring-offset-0"
          />
        </div>

        {/* Mobile Divider (Horizontal) */}
        <div className="h-[1px] w-full bg-border sm:hidden" />
        {/* Desktop Divider (Vertical) */}
        <div className="hidden h-8 w-[1px] bg-border sm:block" />

        {/* Controls Container */}
        <div className="flex w-full items-center justify-between gap-4 px-2 sm:w-auto">
          <div className="flex items-center gap-2">
            <span className="whitespace-nowrap text-sm text-muted-foreground">
              Words:
            </span>
            <Input
              id="words"
              type="number"
              min={10}
              max={1000}
              value={wordCount}
              onChange={(e) => setWordCount(Number(e.target.value))}
              className="h-9 w-20 border-muted-foreground/20 bg-background/50 text-center focus-visible:ring-1"
            />
          </div>

          <Button
            size="icon"
            onClick={handleGenerate}
            disabled={isPending || !topic}
            className={cn(
              "h-10 w-10 shrink-0 rounded-full transition-all duration-300",
              !isPending &&
                "bg-gradient-to-r from-emerald-500 to-cyan-500 shadow-[0_0_15px_-3px_rgba(6,182,212,0.6)] hover:scale-105 hover:opacity-90",
            )}
          >
            {isPending ? (
              <Loader2 className="animate-spin h-5 w-5" />
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
              className="min-h-[500px] w-full resize-none border-0 bg-transparent p-8 text-lg leading-relaxed focus-visible:ring-0"
              value={generatedText}
              readOnly
            />
            <Button
              size="icon"
              variant="outline"
              className="absolute right-4 top-4 h-9 w-9 bg-background/80 backdrop-blur-md transition-colors hover:bg-background"
              onClick={handleCopyToClipboard}
              title="Copy to clipboard"
            >
              <Copy className="h-4 w-4" />
              <span className="sr-only">Copy</span>
            </Button>
          </>
        ) : (
          <div className="pointer-events-none absolute inset-0 flex select-none flex-col items-center justify-center p-8 text-center text-muted-foreground/30">
            <Sparkles className="mb-4 h-16 w-16 opacity-20" />
            <p className="text-xl font-medium">Ready to generate</p>
            <p className="mt-2 max-w-sm text-sm">
              Enter a topic above and hit the magic button to create unique,
              context-aware placeholder text.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
