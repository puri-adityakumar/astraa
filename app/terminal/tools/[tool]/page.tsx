import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TerminalShell } from "@/components/terminal/terminal-shell";
import { isTerminalToolSlug, TERMINAL_TOOL_SLUGS } from "@/lib/terminal/slugs";
import { toolMetadataBySlug } from "@/lib/site-metadata";

interface TerminalToolPageProps {
  params: Promise<{ tool: string }>;
}

export function generateStaticParams(): Array<{ tool: string }> {
  return TERMINAL_TOOL_SLUGS.map((tool) => ({ tool }));
}

export async function generateMetadata({
  params,
}: TerminalToolPageProps): Promise<Metadata> {
  const { tool } = await params;
  if (!isTerminalToolSlug(tool)) {
    return {};
  }
  return toolMetadataBySlug[tool] ?? {};
}

export default async function TerminalToolPage({ params }: TerminalToolPageProps) {
  const { tool } = await params;
  if (!isTerminalToolSlug(tool)) {
    notFound();
  }

  return <TerminalShell initialTool={tool} />;
}
