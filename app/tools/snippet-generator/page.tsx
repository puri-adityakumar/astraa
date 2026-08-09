// app/tools/snippet-generator/page.tsx
import type { Metadata } from "next";

import { RelatedTools } from "@/components/related-tools";
import { SnippetGeneratorClient } from "@/components/snippet-generator/snippet-generator-client";
import { ToolGuide } from "@/components/tool-guide";

export const metadata: Metadata = {
  title: "Code Snippet Generator",
  description:
    "Turn code or screenshots into styled PNG images. Choose gradients, themes, fonts, and " +
    "aspect ratios; source content is processed in your browser.",
  keywords: [
    "code snippet generator",
    "code to image",
    "screenshot beautifier",
    "social share code",
    "carbon alternative",
    "ray.so alternative",
  ],
  openGraph: {
    title: "Code Snippet Generator",
    description: "Generate shareable code and screenshot images with gradient backgrounds.",
    url: "/tools/snippet-generator",
    images: ["/assets/astraa_banner.jpg"],
  },
  twitter: {
    card: "summary",
    title: "Code Snippet Generator",
    description: "Generate shareable code and screenshot images with gradient backgrounds.",
  },
  alternates: {
    canonical: "/tools/snippet-generator",
  },
};

export default function SnippetGeneratorPage() {
  return (
    <>
      <SnippetGeneratorClient />
      <ToolGuide toolId="snippet-generator" />
      <RelatedTools toolId="snippet-generator" />
    </>
  );
}
