import type { Metadata } from "next";
import { ImageResizerClient } from "@/components/image/image-resizer";

export const metadata: Metadata = {
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
  openGraph: {
    title: "Image Resizer",
    description:
      "Resize and convert images to JPEG, PNG, or WebP with quality control. Free and private.",
    url: "/tools/image",
    images: ["/assets/astraa_banner.png"],
  },
  twitter: {
    card: "summary",
    title: "Image Resizer",
    description:
      "Resize and convert images to JPEG, PNG, or WebP with quality control. Free and private.",
  },
  alternates: {
    canonical: "/tools/image",
  },
};

export default function ImageResizerPage() {
  return <ImageResizerClient />;
}
