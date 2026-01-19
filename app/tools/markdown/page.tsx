import { Metadata } from "next"
import { MarkdownViewerClient } from "@/components/markdown/markdown-viewer"

export const metadata: Metadata = {
  title: "Markdown Viewer | astraa",
  description: "Live markdown preview with GitHub Flavored Markdown support",
  openGraph: {
    title: "Markdown Viewer",
    description: "Live markdown preview with GitHub Flavored Markdown support",
  },
}

export default function MarkdownViewerPage() {
  return <MarkdownViewerClient />
}
