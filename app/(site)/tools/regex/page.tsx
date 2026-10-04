import type { Metadata } from "next";
import { regexMetadata } from "@/lib/site-metadata";
import { RegexTesterClient } from "@/components/regex-tester/regex-tester-client";

export const metadata: Metadata = regexMetadata;

export default function RegexTesterPage() {
  const lastUpdated = new Date().toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <>
      <RegexTesterClient />
      <p className="text-xs text-muted-foreground text-center mt-4">
        Last updated: {lastUpdated}
      </p>
    </>
  );
}
