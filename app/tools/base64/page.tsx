import type { Metadata } from "next";
import { Base64Client } from "@/components/base64/base64-client";

export const metadata: Metadata = {
  title: "Base64 Encoder & Decoder",
  description:
    "Encode text or files to Base64 and decode Base64 back. URL-safe variant support, drag-and-drop, image preview — all in your browser.",
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
    title: "Base64 Encoder & Decoder",
    description:
      "Encode and decode Base64 text or files instantly in your browser with URL-safe support.",
    url: "/tools/base64",
    images: ["/assets/astraa_banner.jpg"],
  },
  twitter: {
    card: "summary",
    title: "Base64 Encoder & Decoder",
    description:
      "Encode and decode Base64 text or files instantly in your browser with URL-safe support.",
  },
  alternates: {
    canonical: "/tools/base64",
  },
};

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
