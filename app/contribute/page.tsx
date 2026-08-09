import type { Metadata } from "next";
import { ContributeClient } from "@/components/contribute/contribute-client";
import { getContributors } from "@/lib/github/contributors";

export const metadata: Metadata = {
  title: "Contribute",
  description:
    "Browse open or assigned GitHub issues and read Astraa's contribution guide before proposing a focused change.",
  openGraph: {
    title: "Contribute to Astraa",
    description: "Browse GitHub issues and follow Astraa's contribution guide.",
    url: "/contribute",
    images: ["/assets/astraa_banner.jpg"],
  },
  twitter: {
    card: "summary",
    title: "Contribute to Astraa",
    description: "Browse GitHub issues and follow Astraa's contribution guide.",
  },
  alternates: { canonical: "/contribute" },
};

export default async function ContributePage() {
  const contributors = await getContributors();
  return <ContributeClient contributors={contributors} />;
}
