import type { Metadata } from "next";

import { ToolsClient } from "@/components/tools/tools-client";
import { availableTools } from "@/lib/tools";

export const metadata: Metadata = {
  title: "Tools",
  description:
    `Browse ${availableTools.length} available calculators, converters, editors, and ` +
    "developer utilities. Each tool states whether processing is local or provider-backed.",
  keywords: ["utility tools", "developer tools", "online tools", "browser tools"],
  openGraph: {
    title: "Tools",
    description: `${availableTools.length} available utility tools for developers and creators.`,
    url: "/tools",
    images: ["/assets/astraa_banner.jpg"],
  },
  twitter: {
    card: "summary",
    title: "Tools",
    description: `${availableTools.length} available utility tools for developers.`,
  },
  alternates: { canonical: "/tools" },
};

export default function ToolsPage() {
  return <ToolsClient />;
}
