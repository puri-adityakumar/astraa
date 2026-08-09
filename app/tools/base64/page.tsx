import type { Metadata } from "next";

import { Base64Client } from "@/components/base64/base64-client";
import { RelatedTools } from "@/components/related-tools";
import { ToolGuide } from "@/components/tool-guide";

export const metadata: Metadata = {
  title: "Base64 Encoder/Decoder",
  description:
    "Encode text or local files to Base64, or decode Base64 to text or bytes. Standard and URL-safe variants are processed in this browser.",
  keywords: [
    "base64 encoder",
    "base64 decoder",
    "base64 converter",
    "encode base64",
    "decode base64",
    "url-safe base64",
    "online base64 tool",
    "file to base64",
  ],
  openGraph: {
    title: "Base64 Encoder/Decoder",
    description:
      "Encode and decode Base64 text or local files in this browser with URL-safe support.",
    url: "/tools/base64",
    images: ["/assets/astraa_banner.jpg"],
  },
  twitter: {
    card: "summary",
    title: "Base64 Encoder/Decoder",
    description:
      "Encode and decode Base64 text or local files in this browser with URL-safe support.",
  },
  alternates: {
    canonical: "/tools/base64",
  },
};

export default function Base64Page() {
  return (
    <>
      <Base64Client />
      <ToolGuide toolId="base64" />
      <RelatedTools toolId="base64" />
    </>
  );
}
