import type { Metadata } from "next";
import { hashMetadata } from "@/lib/site-metadata";
import { HashGeneratorClient } from "@/components/hash/hash-generator";

export const metadata: Metadata = hashMetadata;

export default function HashGeneratorPage() {
  const lastUpdated = new Date().toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <>
      <HashGeneratorClient />
      <p className="text-xs text-muted-foreground text-center mt-4">
        Last updated: {lastUpdated}
      </p>
    </>
  );
}
