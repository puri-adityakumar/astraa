import type { RunMatchesResult } from "./match";
import type { ReplaceResult } from "./replace";
import type { MiniTestResult } from "./tests-runner";
import type { MiniTest } from "./types";

export type RegexWorkerRequest = { pattern: string; flags: string } & (
  | { type: "run"; input: string }
  | { type: "replace"; input: string; replacement: string }
  | { type: "tests"; tests: MiniTest[] }
);

export type RegexWorkerResponse =
  | { type: "done"; result: RunMatchesResult | ReplaceResult | MiniTestResult[] }
  | { type: "error"; error: string };
