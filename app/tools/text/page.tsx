import type { Metadata } from "next";
import { TextGeneratorClient } from "@/components/text/text-generator-client";
import {
  buildSoftwareApplicationSchema,
  buildToolBreadcrumbSchema,
  formatLastModified,
} from "@/lib/tool-schema";

const TOOL_NAME = "AI Text Generator";
const TOOL_PATH = "/tools/text";
const LAST_MODIFIED = "2026-05-30";

export const metadata: Metadata = {
  title: TOOL_NAME,
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
    title: TOOL_NAME,
    description:
      "Generate context-aware placeholder text with AI. The modern Lorem Ipsum alternative.",
    url: TOOL_PATH,
    images: ["/assets/astraa_banner.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title: TOOL_NAME,
    description:
      "Generate context-aware placeholder text with AI. The modern Lorem Ipsum alternative.",
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
    "Generate topical placeholder text as a modern alternative to Lorem Ipsum. Uses meta-llama/llama-3.3-70b-instruct via OpenRouter.",
  applicationCategory: "DeveloperApplication",
  featureList: [
    "Topic-aware paragraph generation",
    "Modern alternative to Lorem Ipsum",
    "Configurable length",
    "Copy output to clipboard",
    "Powered by meta-llama/llama-3.3-70b-instruct",
  ],
  lastModified: LAST_MODIFIED,
});
const breadcrumbSchema = buildToolBreadcrumbSchema(TOOL_NAME, TOOL_PATH);

export default function TextGeneratorPage() {
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
      <TextGeneratorClient />
      <p className="text-xs text-muted-foreground text-center mt-4">
        Last updated: {formatLastModified(LAST_MODIFIED)}
      </p>
    </>
  );
}
