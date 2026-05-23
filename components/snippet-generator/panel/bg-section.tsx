"use client";

import dynamic from "next/dynamic";
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

export function BgSection() {
  const bg = useSnippetGenerator((s) => s.background);
  const setBg = useSnippetGenerator((s) => s.setBackground);
  const { toast } = useToast();

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

  const activeTab: BackgroundState["kind"] = bg.kind;

  return (
    <Tabs
      value={activeTab}
      onValueChange={(v) => {
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
                "h-16 w-full rounded-md border-2 transition",
                active ? "border-primary ring-2 ring-primary/40" : "border-transparent",
              )}
              style={{ background: p.css }}
            />
          );
        })}
      </TabsContent>

      <TabsContent value="solid" className="space-y-3 pt-3">
        {bg.kind === "solid" && (
          <>
            <HexColorPicker
              color={bg.color}
              onChange={(c) => setBg({ kind: "solid", color: c })}
            />
            <div className="flex gap-2">
              <Label className="sr-only" htmlFor="bg-solid-hex">Hex</Label>
              <Input
                id="bg-solid-hex"
                value={bg.color}
                onChange={(e) => setBg({ kind: "solid", color: e.target.value })}
                maxLength={9}
              />
            </div>
            <div className="grid grid-cols-8 gap-1">
              {SOLID_QUICK.map((c) => (
                <button
                  key={c}
                  onClick={() => setBg({ kind: "solid", color: c })}
                  aria-label={`Solid ${c}`}
                  className="h-7 w-7 rounded border"
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
                />
              </div>
              <div>
                <Label htmlFor="gr-to">To</Label>
                <Input
                  id="gr-to"
                  value={bg.to}
                  onChange={(e) => setBg({ ...bg, to: e.target.value })}
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
              className="h-16 rounded-md"
              style={{
                background: `linear-gradient(${bg.angle}deg, ${bg.from}, ${bg.to})`,
              }}
            />
          </>
        )}
      </TabsContent>

      <TabsContent value="image" className="space-y-3 pt-3">
        <input
          id="bg-image-input"
          type="file"
          accept="image/png,image/jpeg,image/webp"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void onImageFile(f);
            e.target.value = "";
          }}
        />
        {bg.kind === "image" && (
          <>
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
              variant="secondary"
              size="sm"
              onClick={() => setBg({ kind: "preset", id: "violet" })}
            >
              Clear image
            </Button>
          </>
        )}
      </TabsContent>
    </Tabs>
  );
}
