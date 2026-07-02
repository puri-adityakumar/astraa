import type { Metadata } from "next";
import { PasswordGeneratorClient } from "@/components/password/password-generator";
import { LastUpdated } from "@/components/last-updated";
import { createToolMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = createToolMetadata({
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
  path: "/tools/password",
  ogDescription: "Generate strong, secure passwords with customizable options. Free and private.",
});

export default function PasswordGeneratorPage() {
  return (
    <>
      <PasswordGeneratorClient />
      <LastUpdated />
    </>
  );
}
