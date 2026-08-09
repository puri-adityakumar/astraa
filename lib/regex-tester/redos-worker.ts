/// <reference lib="webworker" />

import type { MatchResult } from "./types";

type Request = {
  type: "run";
  pattern: string;
  flags: string;
  input: string;
  replacement: string;
};

type Response =
  | {
      type: "done";
      results: MatchResult[];
      elapsedMs: number;
      capped: boolean;
      replacementResult: string;
    }
  | { type: "error"; error: string }
  | { type: "timeout" };

const MATCH_CAP = 10000;

function toMatchResult(m: RegExpExecArray): MatchResult {
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

self.onmessage = (event: MessageEvent<Request>) => {
  const { pattern, flags, input, replacement } = event.data;
  const start = performance.now();
  let regex: RegExp;
  try {
    // `d` flag exposes per-group indices for accurate highlighting.
    regex = new RegExp(pattern, flags.includes("d") ? flags : flags + "d");
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

  try {
    const replacementRegex = new RegExp(
      pattern,
      flags.includes("d") ? flags.replace("d", "") : flags,
    );
    const response: Response = {
      type: "done",
      results,
      elapsedMs: performance.now() - start,
      capped,
      replacementResult: input.replace(replacementRegex, replacement),
    };
    self.postMessage(response);
  } catch {
    const response: Response = { type: "error", error: "Regex execution failed" };
    self.postMessage(response);
  }
};
