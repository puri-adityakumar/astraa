import type { Metadata } from "next";
import { ImageResizerClient } from "@/components/image/image-resizer";
import { LastUpdated } from "@/components/last-updated";
import { createToolMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = createToolMetadata({
  title: "Image Resizer",
  description:
    "Upload and resize your images with multiple format options. Support for JPEG, PNG, and WebP formats with quality control. Free browser-based image tool.",
  keywords: [
    "image resizer",
    "image converter",
    "webp converter",
    "jpeg optimizer",
    "png optimizer",
    "image compression",
    "image tools",
    "resize image online",
  ],
  path: "/tools/image",
  ogDescription:
    "Resize and convert images to JPEG, PNG, or WebP with quality control. Free and private.",
});

export default function ImageResizerPage() {
  return (
    <>
      <ImageResizerClient />
      <LastUpdated />
    </>
  );
}
