import type { Metadata } from "next";
import { TextGeneratorClient } from "@/components/text/text-generator-client";

export const metadata: Metadata = {
  title: "AI Text Generator",
  description:
    "Generate meaningful, context-aware placeholder text tailored to your topic. The modern alternative to Lorem Ipsum powered by AI. Free online text generator.",
  keywords: [
    "AI text generator",
    "placeholder text",
    "Lorem Ipsum alternative",
    "content generator",
    "text generator",
    "AI writing tool",
    "dummy text generator",
    "sample text",
  ],
  openGraph: {
    title: "AI Text Generator",
    description:
      "Generate context-aware placeholder text with AI. The modern Lorem Ipsum alternative.",
    url: "/tools/text",
    images: ["/assets/astraa_banner.jpg"],
  },
  twitter: {
    card: "summary",
    title: "AI Text Generator",
    description:
      "Generate context-aware placeholder text with AI. The modern Lorem Ipsum alternative.",
  },
  alternates: {
    canonical: "/tools/text",
  },
};

export default function TextGeneratorPage() {
  const lastUpdated = new Date().toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <>
      <TextGeneratorClient />
      <p className="text-xs text-muted-foreground text-center mt-4">
        Last updated: {lastUpdated}
      </p>
    </>
  );
}
