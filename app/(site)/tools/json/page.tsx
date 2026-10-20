// app/(site)/tools/json/page.tsx
import type { Metadata } from "next";
import { jsonMetadata } from "@/lib/site-metadata";
import { JsonEditorClient } from "@/components/json/json-editor-client";

export const metadata: Metadata = jsonMetadata;

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
