import type { MatchResult } from "./types";

export function matchesToJson(matches: MatchResult[]): string {
  return JSON.stringify(matches, null, 2);
}

function csvEscape(value: string): string {
  const needsQuoting = /[",\n\r]/.test(value);
  const escaped = value.replace(/"/g, '""');
  return needsQuoting ? `"${escaped}"` : escaped;
}

export function matchesToCsv(matches: MatchResult[]): string {
  // Stable schema across all rows: every numbered group + every named group key.
  const maxGroups = matches.reduce(
    (max, m) => Math.max(max, m.groups.length),
    0,
  );
  const namedKeys = Array.from(
    matches.reduce((acc, m) => {
      for (const key of Object.keys(m.namedGroups)) acc.add(key);
      return acc;
    }, new Set<string>()),
  ).sort();

  const header = ["index", "length", "full"];
  for (let i = 0; i < maxGroups; i++) header.push(`group_${i + 1}`);
  for (const key of namedKeys) header.push(`namedGroup_${key}`);

  if (matches.length === 0) {
    return header.map(csvEscape).join(",");
  }

  const lines = [header.map(csvEscape).join(",")];
  for (const m of matches) {
    const row: string[] = [
      String(m.index),
      String(m.length),
      m.full,
    ];
    for (let i = 0; i < maxGroups; i++) {
      row.push(m.groups[i] ?? "");
    }
    for (const key of namedKeys) {
      row.push(m.namedGroups[key] ?? "");
    }
    lines.push(row.map(csvEscape).join(","));
  }
  return lines.join("\n");
}
