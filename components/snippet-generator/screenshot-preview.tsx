"use client";

import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import {
  validateImageFile,
  readFileAsDataUrl,
  MAX_IMAGE_BYTES,
} from "@/lib/snippet-generator/validators";
import { logError } from "@/lib/error-handler";

type Props = {
  dataUrl: string | null;
  onChange: (dataUrl: string | null) => void;
  padding: number;
};

export function ScreenshotPreview({ dataUrl, onChange, padding }: Props) {
  const fileInput = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const onSelectFile = async (file: File) => {
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
      onChange(url);
    } catch (e) {
      logError(e, { context: "snippet-generator/screenshot-upload" });
      toast({
        title: "Upload failed",
        description: "Please try a different file.",
        variant: "destructive",
      });
    }
  };

  if (dataUrl) {
    return (
      <div style={{ padding }} className="flex flex-col items-center gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={dataUrl} alt="Uploaded screenshot" className="max-w-full h-auto" />
        <Button variant="secondary" size="sm" onClick={() => onChange(null)}>
          Replace image
        </Button>
      </div>
    );
  }

  return (
    <div style={{ padding }}>
      <button
        type="button"
        onClick={() => fileInput.current?.click()}
        className={
          "w-full min-h-touch border-2 border-dashed border-white/20 rounded-lg p-8 " +
          "text-zinc-400 hover:border-white/40 hover:text-zinc-200 focus:outline-none " +
          "focus:ring-2 focus:ring-white/40"
        }
      >
        Click to upload screenshot (PNG / JPG / WebP, max 5 MB)
      </button>
      <input
        ref={fileInput}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void onSelectFile(f);
          e.target.value = "";
        }}
      />
    </div>
  );
}
