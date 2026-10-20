import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { RegexWorkerRequest, RegexWorkerResponse } from "./redos-protocol";

const scope = {
  onmessage: null as ((event: MessageEvent<RegexWorkerRequest>) => void) | null,
  postMessage: vi.fn<(response: RegexWorkerResponse) => void>(),
};

beforeEach(async () => {
  vi.resetModules();
  scope.postMessage.mockClear();
  vi.stubGlobal("self", scope);
  await import("./redos-worker");
});

afterEach(() => vi.unstubAllGlobals());

function run(request: RegexWorkerRequest): RegexWorkerResponse | undefined {
  scope.onmessage?.({ data: request } as MessageEvent<RegexWorkerRequest>);
  return scope.postMessage.mock.calls[0]?.[0];
}

describe("regex worker operations", () => {
  it("returns matches with capture group offsets", () => {
    expect(run({ type: "run", pattern: "(a)", flags: "g", input: "ba" })).toMatchObject({
      type: "done",
      result: {
        results: [{ index: 1, full: "a", groups: ["a"], groupIndices: [0] }],
        timedOut: false,
      },
    });
  });

  it("returns replacement results", () => {
    expect(run({
      type: "replace", pattern: "(a)", flags: "g", input: "aa", replacement: "$1b",
    })).toEqual({ type: "done", result: { ok: true, result: "abab" } });
  });

  it("returns mini-test results", () => {
    expect(run({
      type: "tests", pattern: "a", flags: "g",
      tests: [
        { id: "one", input: "a", kind: "should-match" },
        { id: "two", input: "b", kind: "should-not-match" },
      ],
    })).toMatchObject({
      type: "done",
      result: [{ id: "one", passed: true }, { id: "two", passed: true }],
    });
  });

  it("reports compilation failures", () => {
    expect(run({ type: "run", pattern: "[", flags: "", input: "a" })).toMatchObject({
      type: "error",
    });
  });
});
