"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Copy, Sparkles } from "lucide-react";
import { generateText } from "@/lib/openrouter";
import { copyToClipboard } from "@/lib/clipboard";
import { useToast } from "@/components/ui/use-toast";

export function TextGeneratorClient() {
  const { toast } = useToast();
  const [topic, setTopic] = useState("");
  const [wordCount, setWordCount] = useState(100);
  const [generatedText, setGeneratedText] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleGenerate = () => {
    if (!topic) {
      toast({ title: "Enter a topic", variant: "destructive" });
      return;
    }

    startTransition(async () => {
      const result = await generateText(topic, wordCount);
      if (result.success) {
        setGeneratedText(result.text);
        toast({ title: "Text generated" });
      } else {
        toast({
          title: "Text generation failed",
          description: result.error,
          variant: "destructive",
        });
      }
    });
  };

  const handleCopyToClipboard = async () => {
    if (!generatedText) return;
    const result = await copyToClipboard(generatedText);
    if (result.success) {
      toast({ title: "Text copied" });
    } else {
      toast({
        title: "Copy failed",
        description: result.error || "Failed to copy",
        variant: "destructive",
      });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleGenerate();
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-8 pb-8">
      {/* Heading */}
      <div className="space-y-3 border-b pb-8 text-left">
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          AI Text Generator
        </h1>
        <p className="text-muted-foreground text-lg">
          Generate topic-based placeholder prose with a configured AI provider.
        </p>
        <p className="text-xs text-muted-foreground">
          Your topic and requested word count go through Astraa&apos;s server to the configured
          OpenRouter provider. Do not enter sensitive information.
        </p>
      </div>

      {/* Input Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center p-2 rounded-xl bg-muted/30 border border-border/50">
        <div className="flex-1 w-full relative">
          <Input
            id="topic"
            placeholder="Enter a topic, such as coffee brewing methods"
            value={topic}
            aria-label="Topic"
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
            <span className="text-sm text-muted-foreground whitespace-nowrap">Word count</span>
            <Input
              id="words"
              type="number"
              min={10}
              max={1000}
              value={wordCount}
              aria-label="Word count"
              onChange={(e) => setWordCount(Number(e.target.value))}
              className="h-9 w-20 text-center border-muted-foreground/20 bg-background/50 focus-visible:ring-1"
            />
          </div>

          <Button
            size="icon"
            onClick={handleGenerate}
            disabled={isPending || !topic}
            className="h-10 w-10 shrink-0 rounded-full"
          >
            {isPending ? (
              <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
            ) : (
              <Sparkles className="h-5 w-5" aria-hidden="true" />
            )}
            <span className="sr-only">{isPending ? "Generating text" : "Generate text"}</span>
          </Button>
        </div>
      </div>

      {/* Output Area */}
      <div
        className="relative min-h-[500px] rounded-xl border bg-card shadow-geist"
        aria-live="polite"
        aria-busy={isPending}
      >
        {generatedText ? (
          <>
            <Textarea
              className="min-h-[500px] w-full p-8 text-lg leading-relaxed resize-none bg-transparent border-0 focus-visible:ring-0"
              value={generatedText}
              aria-label="Generated text"
              readOnly
            />
            <Button
              size="icon"
              variant="outline"
              className="absolute top-4 right-4 h-9 w-9 bg-background/80 backdrop-blur-md hover:bg-background transition-colors"
              onClick={handleCopyToClipboard}
              title="Copy to clipboard"
            >
              <Copy className="h-4 w-4" aria-hidden="true" />
              <span className="sr-only">Copy generated text</span>
            </Button>
          </>
        ) : (
          <div className="pointer-events-none absolute inset-0 flex select-none flex-col items-center justify-center p-8 text-center text-muted-foreground">
            <Sparkles className="h-16 w-16 mb-4 opacity-20" aria-hidden="true" />
            <p className="text-xl font-medium">
              {isPending ? "Generating placeholder text…" : "No generated text yet"}
            </p>
            <p className="text-sm mt-2 max-w-sm">
              {isPending
                ? "Astraa is sending the topic and word count to the configured provider."
                : "Enter a topic and choose Generate text to request placeholder prose."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
