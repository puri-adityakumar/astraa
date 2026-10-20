import type { Metadata } from "next";
import { musicMetadata } from "@/lib/site-metadata";
import { LofiStudioClient } from "@/components/music/lofi-studio-client";

export const metadata: Metadata = musicMetadata;

export default function LofiPage() {
  const lastUpdated = new Date().toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <>
      <LofiStudioClient />
      <p className="text-xs text-muted-foreground text-center mt-4">
        Last updated: {lastUpdated}
      </p>
    </>
  );
}
