import type { Metadata } from "next";
import { textMetadata } from "@/lib/site-metadata";
import { TextGeneratorClient } from "@/components/text/text-generator-client";

export const metadata: Metadata = textMetadata;

export default function TextGeneratorPage() {
  const lastUpdated = new Date().toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <>
      <TextGeneratorClient />
      <p className="text-xs text-muted-foreground text-center mt-4">
        Last updated: {lastUpdated}
      </p>
    </>
  );
}
