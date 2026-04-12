import type { Metadata } from "next";
import { ContributeClient } from "@/components/contribute/contribute-client";

export const metadata: Metadata = {
  title: "Contribute",
  description:
    "Help build Astraa, an open-source utility toolkit. Contribute on GitHub, report issues, suggest features, or join our community on X and Telegram.",
  openGraph: {
    title: "Contribute to Astraa",
    description:
      "Join our open-source community and help build free utility tools.",
    url: "/contribute",
    images: ["/assets/astraa_banner.png"],
  },
  twitter: {
    card: "summary",
    title: "Contribute to Astraa",
    description: "Help build open-source utility tools.",
  },
  alternates: { canonical: "/contribute" },
};

export default function ContributePage() {
  return <ContributeClient />;
}
