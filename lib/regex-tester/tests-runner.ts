import type { MiniTest } from "./types";

export type MiniTestResult = {
  id: string;
  passed: boolean;
  reason: string;
};

export function runMiniTests(
  regex: RegExp | null,
  tests: MiniTest[],
): MiniTestResult[] {
  return tests.map((test) => {
    if (regex === null) {
      return {
        id: test.id,
        passed: false,
        reason: "Pattern did not compile",
      };
    }
    // Reset lastIndex so global/sticky regexes don't carry state across tests.
    const probe = new RegExp(regex.source, regex.flags.replace(/[gy]/g, ""));
    const matched = probe.test(test.input);
    if (test.kind === "should-match") {
      return {
        id: test.id,
        passed: matched,
        reason: matched ? "Matches as expected" : "Expected a match but got none",
      };
    }
    return {
      id: test.id,
      passed: !matched,
      reason: matched ? "Should not match but did" : "Correctly excluded",
    };
  });
}
