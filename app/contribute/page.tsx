import type { Metadata } from "next";
import { ContributeClient } from "@/components/contribute/contribute-client";
import { createToolMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = createToolMetadata({
  title: "Contribute",
  description:
    "Help build Astraa, an open-source utility toolkit. Contribute on GitHub, report issues, suggest features, or join our community on X and Telegram.",
  path: "/contribute",
  ogTitle: "Contribute to Astraa",
  ogDescription: "Join our open-source community and help build free utility tools.",
  twitterDescription: "Help build open-source utility tools.",
});

export default function ContributePage() {
  return <ContributeClient />;
}
