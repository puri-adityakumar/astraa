import type { Metadata } from "next";
import { MarkdownEditorClient } from "@/components/markdown/markdown-editor-client";
import "./print.css";

export const metadata: Metadata = {
  title: "Markdown Editor | astraa",
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
    title: "Markdown Editor | astraa",
    description:
      "Write Markdown with live preview, math, diagrams, and PDF export. All local in your browser.",
    url: "/tools/markdown",
    images: ["/assets/astraa_banner.jpg"],
  },
  twitter: {
    card: "summary",
    title: "Markdown Editor | astraa",
    description: "Write Markdown with live preview. Free, local, browser-based.",
  },
  alternates: {
    canonical: "/tools/markdown",
  },
};

export default function MarkdownEditorPage() {
  return <MarkdownEditorClient />;
}
