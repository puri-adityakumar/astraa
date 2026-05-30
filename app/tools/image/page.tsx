import type { Metadata } from "next";
import { ImageResizerClient } from "@/components/image/image-resizer";
import {
  buildSoftwareApplicationSchema,
  buildToolBreadcrumbSchema,
  formatLastModified,
} from "@/lib/tool-schema";

const TOOL_NAME = "Image Resizer";
const TOOL_PATH = "/tools/image";
const LAST_MODIFIED = "2026-05-30";

export const metadata: Metadata = {
  title: TOOL_NAME,
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
    title: TOOL_NAME,
    description:
      "Resize and convert images to JPEG, PNG, or WebP with quality control. Free and private.",
    url: TOOL_PATH,
    images: ["/assets/astraa_banner.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title: TOOL_NAME,
    description:
      "Resize and convert images to JPEG, PNG, or WebP with quality control. Free and private.",
    images: ["/assets/astraa_banner.jpg"],
  },
  alternates: {
    canonical: `https://www.astraa.tech${TOOL_PATH}`,
  },
};

const softwareSchema = buildSoftwareApplicationSchema({
  name: TOOL_NAME,
  path: TOOL_PATH,
  description:
    "Resize images and convert between JPEG, PNG, and WebP with a quality slider, processed in-browser. Images never leave your device.",
  applicationCategory: "DesignApplication",
  featureList: [
    "Resize to any dimensions",
    "JPEG, PNG, WebP output",
    "Quality slider",
    "Preserves aspect ratio",
    "Client-side processing via Canvas API",
    "No upload, no server",
  ],
  lastModified: LAST_MODIFIED,
});
const breadcrumbSchema = buildToolBreadcrumbSchema(TOOL_NAME, TOOL_PATH);

export default function ImageResizerPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <ImageResizerClient />
      <p className="text-xs text-muted-foreground text-center mt-4">
        Last updated: {formatLastModified(LAST_MODIFIED)}
      </p>
    </>
  );
}
