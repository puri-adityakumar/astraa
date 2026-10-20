import type { Metadata } from "next";
import { base64Metadata } from "@/lib/site-metadata";
import { Base64Client } from "@/components/base64/base64-client";

export const metadata: Metadata = base64Metadata;

export default function Base64Page() {
  const lastUpdated = new Date().toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <>
      <Base64Client />
      <p className="text-xs text-muted-foreground text-center mt-4">
        Last updated: {lastUpdated}
      </p>
    </>
  );
}
