import type { Metadata } from "next";
import { passwordMetadata } from "@/lib/site-metadata";
import { PasswordGeneratorClient } from "@/components/password/password-generator";

export const metadata: Metadata = passwordMetadata;

export default function PasswordGeneratorPage() {
  const lastUpdated = new Date().toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <>
      <PasswordGeneratorClient />
      <p className="text-xs text-muted-foreground text-center mt-4">
        Last updated: {lastUpdated}
      </p>
    </>
  );
}
