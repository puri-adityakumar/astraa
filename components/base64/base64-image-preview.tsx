"use client";

import { useEffect, useState } from "react";
import { ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ImageMime } from "@/lib/base64";

export interface Base64ImagePreviewProps {
  bytes: Uint8Array;
  mime: ImageMime;
}

export function Base64ImagePreview({ bytes, mime }: Base64ImagePreviewProps) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    const blob = new Blob([bytes as BlobPart], { type: mime });
    const objectUrl = URL.createObjectURL(blob);
    const id = window.setTimeout(() => setUrl(objectUrl), 0);
    return () => {
      window.clearTimeout(id);
      URL.revokeObjectURL(objectUrl);
    };
  }, [bytes, mime]);

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-foreground inline-flex items-center gap-1">
        <ImageIcon className="h-3 w-3" aria-hidden="true" />
        Image preview ({mime})
      </p>
      <div
        className={cn(
          "rounded-md border border-border bg-muted/20",
          "flex items-center justify-center p-4",
        )}
      >
        {url && (
          // next/image cannot load blob:// object URLs; <img> is intentional.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={url}
            alt={`Decoded ${mime}`}
            className="max-h-64 max-w-full object-contain"
          />
        )}
      </div>
    </div>
  );
}
