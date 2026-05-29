"use client";

import { useRef, useState } from "react";
import dynamic from "next/dynamic";
import { Upload, Trash2, Check, AlertCircle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { BG_PRESETS } from "@/lib/snippet-generator/defaults";
import {
  validateImageFile,
  readFileAsDataUrl,
  MAX_IMAGE_BYTES,
} from "@/lib/snippet-generator/validators";
import { useToast } from "@/components/ui/use-toast";
import { logError } from "@/lib/error-handler";
import { useSnippetGenerator } from "@/lib/stores/snippet-generator";
import type { BackgroundState } from "@/lib/snippet-generator/types";

const HexColorPicker = dynamic(
  () => import("react-colorful").then((m) => m.HexColorPicker),
  { ssr: false },
);

const SOLID_QUICK = [
  "#ffffff", "#000000", "#18181b", "#fafaf9",
  "#1e293b", "#0f172a", "#7c3aed", "#0ea5e9",
];

const HEX_RE = /^#?[0-9a-f]{3,8}$/i;

function normalizeHex(value: string): string {
  const trimmed = value.trim();
  return trimmed.startsWith("#") ? trimmed : `#${trimmed}`;
}

export function BgSection() {
  const bg = useSnippetGenerator((s) => s.background);
  const setBg = useSnippetGenerator((s) => s.setBackground);
  const { toast } = useToast();
  const fileInput = useRef<HTMLInputElement>(null);
  const [hexDraft, setHexDraft] = useState<string | null>(null);

  const onImageFile = async (file: File) => {
    const check = validateImageFile(file);
    if (!check.ok) {
      const description =
        check.reason === "size"
          ? `Image must be under ${Math.round(MAX_IMAGE_BYTES / 1024 / 1024)} MB.`
          : "Only PNG, JPEG, and WebP supported.";
      toast({ title: "Image rejected", description, variant: "destructive" });
      return;
    }
    try {
      const url = await readFileAsDataUrl(file);
      setBg({ kind: "image", dataUrl: url, opacity: 1 });
    } catch (e) {
      logError(e, { context: "snippet-generator/bg-image-upload" });
      toast({
        title: "Upload failed",
        description: "Please try a different file.",
        variant: "destructive",
      });
    }
  };

  const hexValue = hexDraft ?? (bg.kind === "solid" ? bg.color : "");
  const hexValid = HEX_RE.test(hexValue);
  const activeTab: BackgroundState["kind"] = bg.kind;

  return (
    <Tabs
      value={activeTab}
      onValueChange={(v) => {
        setHexDraft(null);
        if (v === "preset") setBg({ kind: "preset", id: "violet" });
        else if (v === "solid") setBg({ kind: "solid", color: "#18181b" });
        else if (v === "gradient") {
          setBg({ kind: "gradient", from: "#667eea", to: "#764ba2", angle: 135 });
        }
      }}
    >
      <TabsList className="grid grid-cols-4 w-full">
        <TabsTrigger value="preset">Presets</TabsTrigger>
        <TabsTrigger value="solid">Solid</TabsTrigger>
        <TabsTrigger value="gradient">Gradient</TabsTrigger>
        <TabsTrigger value="image">Image</TabsTrigger>
      </TabsList>

      <TabsContent value="preset" className="grid grid-cols-3 gap-2 pt-3">
        {BG_PRESETS.map((p) => {
          const active = bg.kind === "preset" && bg.id === p.id;
          return (
            <button
              key={p.id}
              onClick={() => setBg({ kind: "preset", id: p.id })}
              aria-label={p.name}
              aria-pressed={active}
              className={cn(
                "group relative h-14 w-full rounded-md border-2 overflow-hidden",
                "transition-[border-color,box-shadow] duration-150 ease-out",
                active
                  ? "border-primary ring-2 ring-primary/40"
                  : "border-transparent hover:border-border",
              )}
              style={{ background: p.css }}
            >
              <span
                className={cn(
                  "absolute inset-x-0 bottom-0 px-1.5 py-0.5 text-[10px] font-medium text-white",
                  "bg-gradient-to-t from-black/60 to-transparent",
                  "opacity-0 transition-opacity duration-150 ease-out",
                  active ? "opacity-100" : "group-hover:opacity-100",
                )}
              >
                {p.name}
              </span>
            </button>
          );
        })}
      </TabsContent>

      <TabsContent value="solid" className="space-y-3 pt-3">
        {bg.kind === "solid" && (
          <>
            <HexColorPicker
              color={bg.color}
              onChange={(c) => {
                setHexDraft(null);
                setBg({ kind: "solid", color: c });
              }}
            />
            <div>
              <Label className="sr-only" htmlFor="bg-solid-hex">Hex</Label>
              <div
                className={cn(
                  "flex items-center gap-2 rounded-md border bg-background px-2 py-1.5",
                  "transition-colors duration-100 ease-out",
                  hexValid ? "border-input" : "border-destructive/60",
                )}
              >
                <span
                  className="h-5 w-5 rounded border border-border/50"
                  style={{ background: hexValid ? normalizeHex(hexValue) : bg.color }}
                  aria-hidden
                />
                <input
                  id="bg-solid-hex"
                  value={hexValue}
                  onChange={(e) => setHexDraft(e.target.value)}
                  onBlur={() => {
                    if (hexValid) {
                      setBg({ kind: "solid", color: normalizeHex(hexValue) });
                    }
                    setHexDraft(null);
                  }}
                  maxLength={9}
                  spellCheck={false}
                  className="flex-1 bg-transparent text-sm tabular-nums outline-none placeholder:text-muted-foreground"
                  placeholder="#000000"
                />
                <span
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                    hexValid
                      ? "bg-success/15 text-success"
                      : "bg-destructive/15 text-destructive",
                  )}
                >
                  {hexValid ? (
                    <>
                      <Check className="h-3 w-3" aria-hidden />
                      Valid
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-3 w-3" aria-hidden />
                      Invalid
                    </>
                  )}
                </span>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {SOLID_QUICK.map((c) => (
                <button
                  key={c}
                  onClick={() => {
                    setHexDraft(null);
                    setBg({ kind: "solid", color: c });
                  }}
                  aria-label={`Solid ${c}`}
                  className="h-11 w-full rounded border border-border/50 transition-transform duration-100 ease-out hover:scale-[1.05]"
                  style={{ background: c }}
                />
              ))}
            </div>
          </>
        )}
      </TabsContent>

      <TabsContent value="gradient" className="space-y-3 pt-3">
        {bg.kind === "gradient" && (
          <>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="gr-from">From</Label>
                <Input
                  id="gr-from"
                  value={bg.from}
                  onChange={(e) => setBg({ ...bg, from: e.target.value })}
                  spellCheck={false}
                  className="tabular-nums"
                />
              </div>
              <div>
                <Label htmlFor="gr-to">To</Label>
                <Input
                  id="gr-to"
                  value={bg.to}
                  onChange={(e) => setBg({ ...bg, to: e.target.value })}
                  spellCheck={false}
                  className="tabular-nums"
                />
              </div>
            </div>
            <div>
              <Label>Angle ({bg.angle}°)</Label>
              <Slider
                value={[bg.angle]}
                min={0}
                max={360}
                step={1}
                onValueChange={([v]) => setBg({ ...bg, angle: v ?? 0 })}
              />
            </div>
            <div
              className="h-16 rounded-md border border-border/50"
              style={{
                background: `linear-gradient(${bg.angle}deg, ${bg.from}, ${bg.to})`,
              }}
            />
          </>
        )}
      </TabsContent>

      <TabsContent value="image" className="space-y-3 pt-3">
        <input
          ref={fileInput}
          id="bg-image-input"
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void onImageFile(f);
            e.target.value = "";
          }}
        />
        {bg.kind === "image" ? (
          <>
            <button
              type="button"
              onClick={() => fileInput.current?.click()}
              className="relative w-full h-24 rounded-md border border-border/60 overflow-hidden transition-colors duration-150 ease-out hover:border-primary"
              aria-label="Replace background image"
            >
              <span
                className="absolute inset-0"
                style={{
                  backgroundImage: `url(${bg.dataUrl})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  opacity: bg.opacity,
                }}
              />
              <span className="absolute inset-x-0 bottom-0 bg-black/55 px-2 py-1 text-xs text-white">
                Replace image
              </span>
            </button>
            <div>
              <Label>Opacity ({Math.round(bg.opacity * 100)}%)</Label>
              <Slider
                value={[bg.opacity * 100]}
                min={10}
                max={100}
                step={1}
                onValueChange={([v]) => setBg({ ...bg, opacity: (v ?? 100) / 100 })}
              />
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setBg({ kind: "preset", id: "violet" })}
              className="w-full justify-center text-muted-foreground"
            >
              <Trash2 className="h-3.5 w-3.5 mr-1.5" aria-hidden />
              Clear image
            </Button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => fileInput.current?.click()}
            className={cn(
              "flex w-full flex-col items-center justify-center gap-1.5 rounded-md border-2 border-dashed border-border/60 bg-background px-3 py-5",
              "min-h-touch text-xs text-muted-foreground",
              "transition-colors duration-150 ease-out",
              "hover:border-primary hover:bg-primary/5 hover:text-foreground",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            )}
          >
            <Upload className="h-4 w-4" aria-hidden />
            <span>
              <strong className="font-medium text-foreground">Upload image</strong>{" "}
              · PNG / JPG / WebP, max 5 MB
            </span>
          </button>
        )}
      </TabsContent>
    </Tabs>
  );
}
