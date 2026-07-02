// app/tools/json/page.tsx
import type { Metadata } from "next";
import { JsonEditorClient } from "@/components/json/json-editor-client";
import { LastUpdated } from "@/components/last-updated";
import { createToolMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = createToolMetadata({
  title: "JSON Editor",
  description:
    "Edit, format, validate, repair and convert JSON in your browser. Tree view, YAML/CSV/Markdown converters, TypeScript and Zod generators. Handles up to 50 MB. 100% local.",
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
  path: "/tools/json",
  ogDescription: "Edit, format, convert and generate types from JSON. 100% local, up to 50 MB.",
});

export default function JsonEditorPage() {
  return (
    <>
      <JsonEditorClient />
      <LastUpdated />
    </>
  );
}
