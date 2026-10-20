// app/(site)/tools/snippet-generator/page.tsx
import type { Metadata } from "next";
import { snippetGeneratorMetadata } from "@/lib/site-metadata";
import { SnippetGeneratorClient } from "@/components/snippet-generator/snippet-generator-client";

export const metadata: Metadata = snippetGeneratorMetadata;

export default function SnippetGeneratorPage() {
  const lastUpdated = new Date().toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <>
      <SnippetGeneratorClient />
      <p className="text-xs text-muted-foreground text-center mt-4">
        Last updated: {lastUpdated}
      </p>
    </>
  );
}
