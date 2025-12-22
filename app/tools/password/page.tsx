import { Metadata } from "next"
import { PasswordGeneratorClient } from "@/components/password/password-generator"

export const metadata: Metadata = {
  title: "Password Generator | astraa",
  description: "Create strong, secure passwords with customizable options for length and character types",
  openGraph: {
    title: "Password Generator",
    description: "Create strong, secure passwords with customizable options for length and character types",
  },
}

export default function PasswordGeneratorPage() {
  return <PasswordGeneratorClient />
}