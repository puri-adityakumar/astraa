// app/tools/json/page.tsx
import type { Metadata } from "next";
import { JsonEditorClient } from "@/components/json/json-editor-client";

export const metadata: Metadata = {
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
  openGraph: {
    title: "JSON Editor",
    description: "Edit, format, convert and generate types from JSON. 100% local, up to 50 MB.",
    url: "/tools/json",
    images: ["/assets/astraa_banner.jpg"],
  },
  twitter: {
    card: "summary",
    title: "JSON Editor",
    description: "Edit, format, convert and generate types from JSON. 100% local, up to 50 MB.",
  },
  alternates: {
    canonical: "/tools/json",
  },
};

export default function JsonEditorPage() {
  const lastUpdated = new Date().toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <>
      <JsonEditorClient />
      <p className="text-xs text-muted-foreground text-center mt-4">
        Last updated: {lastUpdated}
      </p>
    </>
  );
}
