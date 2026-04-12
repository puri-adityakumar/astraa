import type { Metadata } from "next";
import { ToolsClient } from "@/components/tools/tools-client";

export const metadata: Metadata = {
  title: "Tools",
  description:
    "Explore Astraa's complete collection of free utility tools: scientific calculator, currency converter, password generator, hash generator, unit converter, image resizer, and more. All tools run locally in your browser.",
  keywords: ["utility tools", "developer tools", "online tools", "free tools"],
  openGraph: {
    title: "Tools",
    description: "Free utility tools for developers and creators.",
    url: "/tools",
    images: ["/assets/astraa_banner.jpg"],
  },
  twitter: {
    card: "summary",
    title: "Tools",
    description: "Free utility tools for developers.",
  },
  alternates: { canonical: "/tools" },
};

export default function ToolsPage() {
  return <ToolsClient />;
}
