import type { Metadata } from "next";
import { TerminalShell } from "@/components/terminal/terminal-shell";
import { homeMetadata } from "@/lib/site-metadata";

export const metadata: Metadata = homeMetadata;

export default function TerminalPage() {
  return <TerminalShell />;
}
