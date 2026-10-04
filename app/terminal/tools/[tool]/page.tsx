import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TERMINAL_TOOL_SLUGS, isTerminalToolSlug } from "@/lib/terminal/slugs";
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

  return (
    <main>
      <h1>Astraa</h1>
      <p data-term-panel-placeholder={tool}>{`Terminal panel: ${tool}`}</p>
    </main>
  );
}
