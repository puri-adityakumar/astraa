"use client";

import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Copy, RefreshCw } from "lucide-react";
import { copyToClipboard } from "@/lib/clipboard";
import { LOREM_LIMITS, generateLorem, type LoremUnit } from "@/lib/text/lorem";
import { cn } from "@/lib/utils";

const UNIT_OPTIONS: { value: LoremUnit; label: string }[] = [
  { value: "words", label: "Words" },
  { value: "sentences", label: "Sentences" },
  { value: "paragraphs", label: "Paragraphs" },
];

interface TextGeneratorClientProps {
  /** "panel" drops the page container and heading; default rendering unchanged. */
  variant?: "page" | "panel";
}

/** Clamp a count into the unit's allowed range (NaN/Infinity → minimum). */
function clampCount(value: number, unit: LoremUnit): number {
  const limits = LOREM_LIMITS[unit];
  if (!Number.isFinite(value)) return limits.min;
  return Math.min(Math.max(Math.round(value), limits.min), limits.max);
}

export function TextGeneratorClient({ variant = "page" }: TextGeneratorClientProps) {
  const { toast } = useToast();
  const [unit, setUnit] = useState<LoremUnit>("words");
  const [count, setCount] = useState(50);
  const [startWithLorem, setStartWithLorem] = useState(true);
  const [output, setOutput] = useState("");

  const handleUnitChange = useCallback(
    (next: LoremUnit) => {
      setUnit(next);
      setCount((previous) => clampCount(previous, next));
    },
    [],
  );

  const handleGenerate = useCallback(() => {
    const limits = LOREM_LIMITS[unit];
    const safeCount = clampCount(count, unit);
    setOutput(
      generateLorem({ count: safeCount, unit, startWithLorem, random: Math.random }),
    );
    if (safeCount !== count) setCount(safeCount);
    if (!Number.isFinite(count) || count < limits.min || count > limits.max) {
      toast({
        title: "Count adjusted",
        description: `${unit === "words" ? "Words" : unit === "sentences" ? "Sentences" : "Paragraphs"} must be between ${limits.min} and ${limits.max}.`,
      });
    }
  }, [count, unit, startWithLorem, toast]);

  const handleCopyToClipboard = async () => {
    if (!output) return;
    const result = await copyToClipboard(output);
    if (result.success) {
      toast({ title: "Copied!", description: "Lorem ipsum copied to clipboard" });
    } else {
      toast({
        title: "Copy failed",
        description: result.error,
        variant: "destructive",
      });
    }
  };

  // Panel variant drops the page container and the big page heading; the
  // card below is identical in both variants.
  const outerClass = variant === "panel"
    ? "w-full"
    : "container px-4 sm:px-6 max-w-2xl pt-24 pb-12 space-y-8";

  return (
    <div className={outerClass}>
      {/* Header */}
      {variant === "page" && (
        <div className="space-y-4 text-center sm:text-left">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Lorem Ipsum Generator
          </h1>
          <p className="text-muted-foreground text-base sm:text-lg text-pretty">
            Generate classic lorem ipsum placeholder text in words, sentences,
            or paragraphs.
          </p>
          <p className="text-xs text-muted-foreground/70">
            All processing happens locally in your browser
          </p>
        </div>
      )}

      <div className="bg-card border border-border/50 rounded-xl shadow-sm p-4 sm:p-6 md:p-8 space-y-6 sm:space-y-8">
        {/* 1. Controls */}
        <div className="space-y-6">
          <Label className="text-base font-semibold">Generate placeholder text</Label>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-4 sm:gap-6">
            <div className="space-y-2">
              <Label htmlFor="lorem-unit" className="font-normal text-muted-foreground text-sm">
                Unit
              </Label>
              <Select value={unit} onValueChange={(value) => handleUnitChange(value as LoremUnit)}>
                <SelectTrigger id="lorem-unit" className="w-full sm:w-40 min-h-touch">
                  <SelectValue placeholder="Select a unit" />
                </SelectTrigger>
                <SelectContent>
                  {UNIT_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 flex-1 sm:max-w-40">
              <Label htmlFor="lorem-count" className="font-normal text-muted-foreground text-sm">
                Count
              </Label>
              <Input
                id="lorem-count"
                type="number"
                min={LOREM_LIMITS[unit].min}
                max={LOREM_LIMITS[unit].max}
                value={Number.isFinite(count) ? count : ""}
                onChange={(event) => setCount(Number(event.target.value))}
                className="h-11 text-center"
              />
              <p className="text-xs text-muted-foreground/70">
                {LOREM_LIMITS[unit].min}–{LOREM_LIMITS[unit].max} {unit}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Label htmlFor="lorem-start" className="font-normal text-muted-foreground cursor-pointer text-sm sm:text-base">
              Start with &ldquo;Lorem ipsum dolor sit amet&rdquo;
            </Label>
            <Switch
              id="lorem-start"
              checked={startWithLorem}
              onCheckedChange={setStartWithLorem}
            />
          </div>
        </div>

        {/* 2. Output */}
        <div className="space-y-6 pt-2">
          <Label className="text-base font-semibold">Generated text</Label>

          <Textarea
            aria-label="Generated lorem ipsum text"
            placeholder="Press Generate to create lorem ipsum placeholder text."
            className="min-h-[300px] w-full p-4 text-base leading-relaxed resize-y bg-background/50"
            value={output}
            readOnly
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Button
              size="lg"
              variant="default"
              className="w-full font-semibold text-base h-12"
              onClick={handleGenerate}
            >
              <RefreshCw className="w-4 h-4" />
              Generate
            </Button>
            <Button
              size="lg"
              variant="outline"
              className={cn(
                "w-full font-semibold text-base h-12 hover:bg-muted/50 hover:text-foreground",
                !output && "opacity-50 cursor-not-allowed",
              )}
              onClick={handleCopyToClipboard}
              disabled={!output}
            >
              <Copy className="w-4 h-4" />
              Copy
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
