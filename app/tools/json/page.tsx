// app/tools/json/page.tsx
import type { Metadata } from "next";

import { JsonEditorClient } from "@/components/json/json-editor-client";
import { RelatedTools } from "@/components/related-tools";
import { ToolGuide } from "@/components/tool-guide";

export const metadata: Metadata = {
  title: "JSON Editor",
  description:
    "Open JSON files up to 50 MB. Editing, formatting, validation, best-effort syntax repair, converters, and type generators run in this browser.",
  keywords: [
    "json editor",
    "json formatter",
    "json validator",
    "json to yaml",
    "json to csv",
    "json to typescript",
    "json to zod",
    "json schema",
    "developer tools",
  ],
  openGraph: {
    title: "JSON Editor",
    description: "Edit, format, convert, and generate types from JSON in this browser.",
    url: "/tools/json",
    images: ["/assets/astraa_banner.jpg"],
  },
  twitter: {
    card: "summary",
    title: "JSON Editor",
    description: "Edit, format, convert, and generate types from JSON in this browser.",
  },
  alternates: {
    canonical: "/tools/json",
  },
};

export default function JsonEditorPage() {
  return (
    <>
      <JsonEditorClient />
      <ToolGuide toolId="json" />
      <RelatedTools toolId="json" />
    </>
  );
}
