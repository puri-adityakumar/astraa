import type { Metadata } from "next";
import Link from "next/link";
import { homeMetadata } from "@/lib/site-metadata";
import { TERMINAL_TOOL_SLUGS } from "@/lib/terminal/slugs";

export const metadata: Metadata = homeMetadata;

export default function TerminalPage() {
  return (
    <main>
      <h1>Astraa</h1>
      <ul>
        {TERMINAL_TOOL_SLUGS.map((slug) => (
          <li key={slug}>
            <Link href={`/tools/${slug}`}>{`/${slug}`}</Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
