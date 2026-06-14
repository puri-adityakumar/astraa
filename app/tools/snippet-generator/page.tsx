// app/tools/snippet-generator/page.tsx
import type { Metadata } from "next";
import { SnippetGeneratorClient } from "@/components/snippet-generator/snippet-generator-client";

export const metadata: Metadata = {
  title: "Code Snippet Generator",
  description:
    "Create beautiful, social-ready images from code snippets or screenshots. " +
    "Choose gradients, themes, fonts, and aspect ratios. " +
    "All processing happens locally in your browser.",
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
  const lastUpdated = new Date().toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <>
      <SnippetGeneratorClient />
      <p className="text-xs text-muted-foreground text-center mt-4">
        Last updated: {lastUpdated}
      </p>
    </>
  );
}
