import type { Metadata } from "next";

import { ImageResizerClient } from "@/components/image/image-resizer";
import { RelatedTools } from "@/components/related-tools";
import { ToolGuide } from "@/components/tool-guide";

export const metadata: Metadata = {
  title: "Image Resizer",
  description:
    "Choose an image, resize it, and export JPEG, PNG, or WebP in your browser. JPEG and WebP exports include quality control.",
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
  openGraph: {
    title: "Image Resizer",
    description: "Resize and convert JPEG, PNG, or WebP images directly in your browser.",
    url: "/tools/image",
    images: ["/assets/astraa_banner.jpg"],
  },
  twitter: {
    card: "summary",
    title: "Image Resizer",
    description: "Resize and convert JPEG, PNG, or WebP images directly in your browser.",
  },
  alternates: {
    canonical: "/tools/image",
  },
};

export default function ImageResizerPage() {
  return (
    <>
      <ImageResizerClient />
      <ToolGuide toolId="image" />
      <RelatedTools toolId="image" />
    </>
  );
}
