import type { Metadata } from "next";
import { HashGeneratorClient } from "@/components/hash/hash-generator";

export const metadata: Metadata = {
  title: "Hash Generator",
  description:
    "Generate secure hash outputs including MD5, SHA-1, SHA-256, and SHA-512. Free online hashing tool for developers with instant client-side processing.",
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
    description:
      "Generate MD5, SHA-1, SHA-256, and SHA-512 hashes instantly in your browser.",
    url: "/tools/hash",
    images: ["/assets/astraa_banner.png"],
  },
  twitter: {
    card: "summary",
    title: "Hash Generator",
    description:
      "Generate MD5, SHA-1, SHA-256, and SHA-512 hashes instantly in your browser.",
  },
  alternates: {
    canonical: "/tools/hash",
  },
};

export default function HashGeneratorPage() {
  return <HashGeneratorClient />;
}
