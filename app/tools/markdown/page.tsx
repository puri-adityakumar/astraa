import type { Metadata } from "next";
import { MarkdownEditorClient } from "@/components/markdown/markdown-editor-client";
import {
  buildSoftwareApplicationSchema,
  buildToolBreadcrumbSchema,
  formatLastModified,
} from "@/lib/tool-schema";
import "./print.css";

const TOOL_NAME = "Markdown Editor";
const TOOL_PATH = "/tools/markdown";
const LAST_MODIFIED = "2026-05-30";

export const metadata: Metadata = {
  title: TOOL_NAME,
  description:
    "Write Markdown with live preview. Local-only file storage, math and diagram rendering, drag-drop images, and PDF export. Free browser-based tool.",
  keywords: [
    "markdown editor",
    "markdown preview",
    "markdown to pdf",
    "markdown to html",
    "live preview",
    "developer tools",
  ],
  openGraph: {
    title: TOOL_NAME,
    description:
      "Write Markdown with live preview, math, diagrams, and PDF export. All local in your browser.",
    url: TOOL_PATH,
    images: ["/assets/astraa_banner.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title: TOOL_NAME,
    description: "Write Markdown with live preview. Free, local, browser-based.",
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
    "Live-preview Markdown editor with KaTeX math, Mermaid diagrams, drag-and-drop images, and PDF export. Local-only file storage.",
  applicationCategory: "DeveloperApplication",
  featureList: [
    "Live two-pane preview",
    "KaTeX math rendering",
    "Mermaid diagram rendering",
    "Drag-and-drop image insertion",
    "PDF export",
    "Local-only file storage (no upload)",
    "Syntax highlighting",
  ],
  lastModified: LAST_MODIFIED,
});
const breadcrumbSchema = buildToolBreadcrumbSchema(TOOL_NAME, TOOL_PATH);

export default function MarkdownEditorPage() {
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
      <MarkdownEditorClient />
      <p className="text-xs text-muted-foreground text-center mt-4">
        Last updated: {formatLastModified(LAST_MODIFIED)}
      </p>
    </>
  );
}
