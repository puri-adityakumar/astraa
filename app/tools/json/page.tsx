import { Metadata } from "next"
import { JsonEditorClient } from "@/components/json/json-editor"

export const metadata: Metadata = {
  title: "JSON Editor | astraa",
  description: "Validate, format, and edit JSON with syntax highlighting",
  openGraph: {
    title: "JSON Editor",
    description: "Validate, format, and edit JSON with syntax highlighting",
  },
}

export default function JsonEditorPage() {
  return <JsonEditorClient />
}
