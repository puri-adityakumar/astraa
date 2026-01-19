import { Metadata } from "next"
import { RegexTesterClient } from "@/components/regex/regex-tester"

export const metadata: Metadata = {
  title: "Regex Tester | astraa",
  description: "Test and validate regular expressions with real-time matching and explanations",
  openGraph: {
    title: "Regex Tester",
    description: "Test and validate regular expressions with real-time matching and explanations",
  },
}

export default function RegexTesterPage() {
  return <RegexTesterClient />
}
