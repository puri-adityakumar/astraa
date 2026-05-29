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

  if (!regex.global && !regex.sticky) {
    const m = regex.exec(input);
    const elapsedMs = performance.now() - start;
    if (m) {
      results.push(toMatchResult(m));
    }
    return { results, elapsedMs, capped, timedOut: elapsedMs > TIME_BUDGET_MS };
  }

  regex.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = regex.exec(input)) !== null) {
    results.push(toMatchResult(m));

    if (m[0].length === 0) {
      regex.lastIndex = m.index + 1;
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

function toMatchResult(m: RegExpExecArray): MatchResult {
  const full = m[0];
  const groups: (string | undefined)[] = [];
  for (let i = 1; i < m.length; i++) {
    groups.push(m[i]);
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
  };
}
