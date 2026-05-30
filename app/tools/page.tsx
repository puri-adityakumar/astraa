import type { Metadata } from "next";
import { ToolsClient } from "@/components/tools/tools-client";
import { toolCategories } from "@/lib/tools";

const LIVE_TOOLS = toolCategories.flatMap((c) => c.items).filter((t) => !t.comingSoon);
const LIVE_COUNT = LIVE_TOOLS.length;

export const metadata: Metadata = {
  title: "All Tools",
  description: `Browse Astraa's complete catalog of ${LIVE_COUNT} free browser-based utility tools: scientific calculator, currency converter, password generator, hash generator, unit converter, markdown editor, image resizer, and AI text generator. All tools run locally with no signup.`,
  keywords: [
    "utility tools",
    "developer tools",
    "online tools",
    "free tools",
    "browser tools",
  ],
  openGraph: {
    title: `All Tools — ${LIVE_COUNT} Free Browser Utilities`,
    description: `${LIVE_COUNT} free browser-based utility tools for developers and creators.`,
    url: "/tools",
    images: [
      {
        url: "/assets/astraa_banner.jpg",
        width: 1200,
        height: 630,
        alt: "Astraa — full tool catalog",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `All Tools — ${LIVE_COUNT} Free Browser Utilities`,
    description: `${LIVE_COUNT} free browser-based utility tools for developers and creators.`,
    images: ["/assets/astraa_banner.jpg"],
  },
  alternates: { canonical: "https://www.astraa.tech/tools" },
};

const itemListSchema = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  "@id": "https://www.astraa.tech/tools#itemlist",
  "name": "Astraa Free Browser Tools",
  "numberOfItems": LIVE_COUNT,
  "itemListOrder": "https://schema.org/ItemListOrderAscending",
  "itemListElement": LIVE_TOOLS.map((tool, index) => ({
    "@type": "ListItem",
    "position": index + 1,
    "url": `https://www.astraa.tech${tool.path}`,
    "name": tool.name,
  })),
};

export default function ToolsPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />
      <ToolsClient />
    </>
  );
}
