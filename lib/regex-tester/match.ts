import type { MatchResult } from "./types";

export const MATCH_CAP = 10000;
export const TIME_BUDGET_MS = 250;

export type RunMatchesResult = {
  results: MatchResult[];
  elapsedMs: number;
  capped: boolean;
  timedOut: boolean;
};

export function runMatches(regex: RegExp, input: string): RunMatchesResult {
  const results: MatchResult[] = [];
  const start = performance.now();
  let capped = false;
  let timedOut = false;

  // Ensure the `d` flag so exec() exposes per-group indices for highlighting.
  const re = regex.flags.includes("d") ? regex : new RegExp(regex.source, regex.flags + "d");

  if (!re.global && !re.sticky) {
    const m = re.exec(input);
    const elapsedMs = performance.now() - start;
    if (m) {
      results.push(toMatchResult(m));
    }
    return { results, elapsedMs, capped, timedOut: elapsedMs > TIME_BUDGET_MS };
  }

  re.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(input)) !== null) {
    results.push(toMatchResult(m));

    if (m[0].length === 0) {
      re.lastIndex = m.index + 1;
    }

    if (results.length >= MATCH_CAP) {
      capped = true;
      break;
    }

    if (performance.now() - start > TIME_BUDGET_MS) {
      timedOut = true;
      break;
    }
  }

  const elapsedMs = performance.now() - start;
  return { results, elapsedMs, capped, timedOut };
}

export function toMatchResult(m: RegExpExecArray): MatchResult {
  const full = m[0];
  const indices = (m as RegExpExecArray & { indices?: ([number, number] | undefined)[] }).indices;
  const groups: (string | undefined)[] = [];
  const groupIndices: (number | null)[] = [];
  for (let i = 1; i < m.length; i++) {
    groups.push(m[i]);
    const gi = indices?.[i];
    groupIndices.push(gi ? gi[0] - m.index : null);
  }
  const namedGroups: Record<string, string | undefined> = {};
  if (m.groups) {
    for (const key of Object.keys(m.groups)) {
      namedGroups[key] = m.groups[key];
    }
  }
  return {
    index: m.index,
    length: full.length,
    full,
    groups,
    namedGroups,
    groupIndices,
  };
}
