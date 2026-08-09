import type { Metadata } from "next";

import { MarkdownEditorClient } from "@/components/markdown/markdown-editor-client";
import { RelatedTools } from "@/components/related-tools";
import { ToolGuide } from "@/components/tool-guide";
import "./print.css";

export const metadata: Metadata = {
  title: "Markdown Editor",
  description:
    "Write and preview Markdown with math, diagrams, dropped images, and HTML or PDF export. Documents stay in local browser storage.",
  keywords: [
    "markdown editor",
    "markdown preview",
    "markdown to pdf",
    "markdown to html",
    "live preview",
    "developer tools",
  ],
  openGraph: {
    title: "Markdown Editor",
    description: "Write and preview Markdown with math, diagrams, and export in this browser.",
    url: "/tools/markdown",
    images: ["/assets/astraa_banner.jpg"],
  },
  twitter: {
    card: "summary",
    title: "Markdown Editor",
    description: "Write and preview Markdown with local browser storage and export.",
  },
  alternates: {
    canonical: "/tools/markdown",
  },
};

export default function MarkdownEditorPage() {
  return (
    <>
      <MarkdownEditorClient />
      <ToolGuide toolId="markdown" />
      <RelatedTools toolId="markdown" />
    </>
  );
}
