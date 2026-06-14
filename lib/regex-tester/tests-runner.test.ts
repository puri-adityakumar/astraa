import { describe, expect, it } from "vitest";
import { runMiniTests } from "./tests-runner";

describe("runMiniTests", () => {
  it("returns failure for every test when regex is null", () => {
    const out = runMiniTests(null, [
      { id: "a", kind: "should-match", input: "abc" },
      { id: "b", kind: "should-not-match", input: "xyz" },
    ]);
    expect(out).toEqual([
      { id: "a", passed: false, reason: "Pattern did not compile" },
      { id: "b", passed: false, reason: "Pattern did not compile" },
    ]);
  });

  it("passes should-match when regex matches", () => {
    const out = runMiniTests(/\d+/, [
      { id: "a", kind: "should-match", input: "abc 123" },
    ]);
    expect(out[0]?.passed).toBe(true);
  });

  it("fails should-match when regex does not match", () => {
    const out = runMiniTests(/\d+/, [
      { id: "a", kind: "should-match", input: "no digits here" },
    ]);
    expect(out[0]?.passed).toBe(false);
  });

  it("passes should-not-match when regex does not match", () => {
    const out = runMiniTests(/\d+/, [
      { id: "a", kind: "should-not-match", input: "letters only" },
    ]);
    expect(out[0]?.passed).toBe(true);
  });

  it("fails should-not-match when regex matches", () => {
    const out = runMiniTests(/\d+/, [
      { id: "a", kind: "should-not-match", input: "123" },
    ]);
    expect(out[0]?.passed).toBe(false);
  });

  it("does not carry global regex lastIndex across tests", () => {
    const re = /\d+/g;
    const out = runMiniTests(re, [
      { id: "a", kind: "should-match", input: "123" },
      { id: "b", kind: "should-match", input: "456" },
    ]);
    expect(out.every((r) => r.passed)).toBe(true);
  });
});
