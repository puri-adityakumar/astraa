import type { Metadata } from "next";
import { SnippetGeneratorClient } from "@/components/snippet-generator/snippet-generator-client";
import { LastUpdated } from "@/components/last-updated";
import { createToolMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = createToolMetadata({
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
  path: "/tools/snippet-generator",
  ogDescription: "Generate shareable code and screenshot images with gradient backgrounds.",
});

export default function SnippetGeneratorPage() {
  return (
    <>
      <SnippetGeneratorClient />
      <LastUpdated />
    </>
  );
}
