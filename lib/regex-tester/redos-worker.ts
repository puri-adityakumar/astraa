/// <reference lib="webworker" />

import type { MatchResult } from "./types";

type Request = {
  type: "run";
  pattern: string;
  flags: string;
  input: string;
};

type Response =
  | { type: "done"; results: MatchResult[]; elapsedMs: number; capped: boolean }
  | { type: "error"; error: string }
  | { type: "timeout" };

const MATCH_CAP = 10000;

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

self.onmessage = (event: MessageEvent<Request>) => {
  const { pattern, flags, input } = event.data;
  const start = performance.now();
  let regex: RegExp;
  try {
    regex = new RegExp(pattern, flags);
  } catch (e) {
    const message: Response = {
      type: "error",
      error: e instanceof Error ? e.message : String(e),
    };
    self.postMessage(message);
    return;
  }

  const results: MatchResult[] = [];
  let capped = false;

  if (!regex.global && !regex.sticky) {
    const m = regex.exec(input);
    if (m) results.push(toMatchResult(m));
  } else {
    regex.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = regex.exec(input)) !== null) {
      results.push(toMatchResult(m));
      if (m[0].length === 0) regex.lastIndex = m.index + 1;
      if (results.length >= MATCH_CAP) {
        capped = true;
        break;
      }
    }
  }

  const response: Response = {
    type: "done",
    results,
    elapsedMs: performance.now() - start,
    capped,
  };
  self.postMessage(response);
};
