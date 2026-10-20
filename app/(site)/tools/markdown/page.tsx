import type { Metadata } from "next";
import { markdownMetadata } from "@/lib/site-metadata";
import { MarkdownEditorClient } from "@/components/markdown/markdown-editor-client";
import "./print.css";

export const metadata: Metadata = markdownMetadata;

export default function MarkdownEditorPage() {
  return <MarkdownEditorClient />;
}
