import type { Metadata } from "next";
import { Base64Client } from "@/components/base64/base64-client";
import { LastUpdated } from "@/components/last-updated";
import { createToolMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = createToolMetadata({
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
  path: "/tools/base64",
  ogDescription:
    "Encode and decode Base64 text or files instantly in your browser with URL-safe support.",
});

export default function Base64Page() {
  return (
    <>
      <Base64Client />
      <LastUpdated />
    </>
  );
}
