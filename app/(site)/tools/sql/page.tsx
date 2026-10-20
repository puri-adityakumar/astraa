import type { Metadata } from "next";
import { sqlMetadata } from "@/lib/site-metadata";
import { SqlFormatterClient } from "@/components/sql/sql-formatter-client";

export const metadata: Metadata = sqlMetadata;

export default function SqlFormatterPage() {
  const lastUpdated = new Date().toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <>
      <SqlFormatterClient />
      <p className="text-xs text-muted-foreground text-center mt-4">
        Last updated: {lastUpdated}
      </p>
    </>
  );
}
