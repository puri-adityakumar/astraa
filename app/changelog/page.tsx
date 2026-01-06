import { Metadata } from "next"
import { Changelog } from "@/components/ui/changelog"

export const metadata: Metadata = {
  title: "Changelog | astraa",
  description: "Get the latest updates and improvements to our platform.",
  openGraph: {
    title: "Changelog",
    description: "Get the latest updates and improvements to our platform.",
  },
}

export default function ChangelogPage() {
  return <Changelog />
}
