import { Metadata } from "next"
import { HashGeneratorClient } from "@/components/hash/hash-generator"

export const metadata: Metadata = {
  title: "Hash Generator | astraa",
  description: "Generate various hash outputs including MD5, SHA-1, SHA-256, and SHA-512",
  openGraph: {
    title: "Hash Generator",
    description: "Generate various hash outputs including MD5, SHA-1, SHA-256, and SHA-512",
  },
}

export default function HashGeneratorPage() {
  return <HashGeneratorClient />
}