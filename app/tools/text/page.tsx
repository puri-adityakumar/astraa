import type { Metadata } from "next";
import { TextGeneratorClient } from "@/components/text/text-generator-client";
import { LastUpdated } from "@/components/last-updated";
import { createToolMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = createToolMetadata({
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
  path: "/tools/text",
  ogDescription:
    "Generate context-aware placeholder text with AI. The modern Lorem Ipsum alternative.",
});

export default function TextGeneratorPage() {
  return (
    <>
      <TextGeneratorClient />
      <LastUpdated />
    </>
  );
}
