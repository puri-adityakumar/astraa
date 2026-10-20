import type { Metadata } from "next";
import { imageMetadata } from "@/lib/site-metadata";
import { ImageResizerClient } from "@/components/image/image-resizer";

export const metadata: Metadata = imageMetadata;

export default function ImageResizerPage() {
  const lastUpdated = new Date().toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <>
      <ImageResizerClient />
      <p className="text-xs text-muted-foreground text-center mt-4">
        Last updated: {lastUpdated}
      </p>
    </>
  );
}
