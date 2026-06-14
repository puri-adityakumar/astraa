import type { JsonValue } from "../types";
import { isCsvCompatible } from "./csv";

function escapeCell(v: JsonValue): string {
  const s = v === null ? "" : String(v);
  return s.replace(/\|/g, "\\|").replace(/\n/g, " ");
}

export function jsonToMarkdown(value: JsonValue): string {
  if (!isCsvCompatible(value)) {
    throw new Error("JSON is not compatible (must be an array of flat objects)");
  }
  const rows = value as Record<string, JsonValue>[];
  const headerSet = new Set<string>();
  for (const row of rows) {
    for (const key of Object.keys(row)) headerSet.add(key);
  }
  const headers = Array.from(headerSet);
  const lines: string[] = [];
  lines.push(`| ${headers.join(" | ")} |`);
  lines.push(`| ${headers.map(() => "---").join(" | ")} |`);
  for (const row of rows) {
    const cells = headers.map((h) =>
      escapeCell((row[h] ?? "") as JsonValue),
    );
    lines.push(`| ${cells.join(" | ")} |`);
  }
  return lines.join("\n");
}
