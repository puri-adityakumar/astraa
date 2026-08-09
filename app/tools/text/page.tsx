import type { Metadata } from "next";

import { RelatedTools } from "@/components/related-tools";
import { TextGeneratorClient } from "@/components/text/text-generator-client";
import { ToolGuide } from "@/components/tool-guide";

export const metadata: Metadata = {
  title: "AI Text Generator",
  description:
    "Generate topic-based placeholder prose through Astraa's server and configured AI provider. Topics may be up to 500 characters with a 10 to 1,000 word request.",
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
    description: "Generate topic-based placeholder prose through a configured AI provider.",
    url: "/tools/text",
    images: ["/assets/astraa_banner.jpg"],
  },
  twitter: {
    card: "summary",
    title: "AI Text Generator",
    description: "Generate topic-based placeholder prose through a configured AI provider.",
  },
  alternates: {
    canonical: "/tools/text",
  },
};

export default function TextGeneratorPage() {
  return (
    <>
      <TextGeneratorClient />
      <ToolGuide toolId="text" />
      <RelatedTools toolId="text" />
    </>
  );
}
