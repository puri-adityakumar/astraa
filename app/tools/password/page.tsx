import type { Metadata } from "next";
import { PasswordGeneratorClient } from "@/components/password/password-generator";

export const metadata: Metadata = {
  title: "Password Generator",
  description:
    "Create strong, secure passwords with customizable length and character options. Generate random passwords with uppercase, lowercase, numbers, and symbols instantly.",
  keywords: [
    "password generator",
    "strong password",
    "random password",
    "secure password",
    "password creator",
    "online password generator",
    "custom password",
    "password tool",
  ],
  openGraph: {
    title: "Password Generator",
    description:
      "Generate strong, secure passwords with customizable options. Free and private.",
    url: "/tools/password",
    images: ["/assets/astraa_banner.png"],
  },
  twitter: {
    card: "summary",
    title: "Password Generator",
    description:
      "Generate strong, secure passwords with customizable options. Free and private.",
  },
  alternates: {
    canonical: "/tools/password",
  },
};

export default function PasswordGeneratorPage() {
  return <PasswordGeneratorClient />;
}
