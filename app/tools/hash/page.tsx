import type { Metadata } from "next";

import { HashGeneratorClient } from "@/components/hash/hash-generator";
import { RelatedTools } from "@/components/related-tools";
import { ToolGuide } from "@/components/tool-guide";

export const metadata: Metadata = {
  title: "Hash Generator",
  description:
    "Generate MD5, SHA-1, SHA-2, and SHA-3 digests from text in your browser. Compare checksums and review warnings for legacy algorithms.",
  keywords: [
    "hash generator",
    "MD5 hash",
    "SHA-256 hash",
    "SHA-512 hash",
    "SHA-1 hash",
    "online hash tool",
    "checksum generator",
    "hash calculator",
  ],
  openGraph: {
    title: "Hash Generator",
    description: "Generate MD5, SHA-1, SHA-2, and SHA-3 digests from text in your browser.",
    url: "/tools/hash",
    images: ["/assets/astraa_banner.jpg"],
  },
  twitter: {
    card: "summary",
    title: "Hash Generator",
    description: "Generate MD5, SHA-1, SHA-2, and SHA-3 digests from text in your browser.",
  },
  alternates: {
    canonical: "/tools/hash",
  },
};

export default function HashGeneratorPage() {
  return (
    <>
      <HashGeneratorClient />
      <ToolGuide toolId="hash" />
      <RelatedTools toolId="hash" />
    </>
  );
}
