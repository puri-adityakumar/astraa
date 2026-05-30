import { describe, it, expect } from "vitest";
import { runMatches, MATCH_CAP } from "./match";

describe("runMatches", () => {
  it("finds all matches for /a/g on 'banana'", () => {
    const { results } = runMatches(/a/g, "banana");
    expect(results).toHaveLength(3);
    expect(results[0]?.index).toBe(1);
    expect(results[1]?.index).toBe(3);
    expect(results[2]?.index).toBe(5);
    expect(results[0]?.full).toBe("a");
  });

  it("populates capture groups for /(\\d+)-(\\d+)/g", () => {
    const { results } = runMatches(/(\d+)-(\d+)/g, "12-34 and 56-78");
    expect(results).toHaveLength(2);
    expect(results[0]?.groups).toEqual(["12", "34"]);
    expect(results[1]?.groups).toEqual(["56", "78"]);
  });

  it("populates named groups for /(?<year>\\d{4})/", () => {
    const namedRegex = new RegExp("(?<year>\\d{4})");
    const { results } = runMatches(namedRegex, "2025-05-30");
    expect(results).toHaveLength(1);
    expect(results[0]?.namedGroups["year"]).toBe("2025");
  });

  it("terminates on zero-length matches like /a*/g", () => {
    const { results } = runMatches(/a*/g, "bbb");
    expect(results.length).toBeGreaterThan(0);
    expect(results.length).toBeLessThan(10);
  });

  it("caps at 10000 matches", () => {
    const input = ".".repeat(MATCH_CAP + 500);
    const { results, capped } = runMatches(/./g, input);
    expect(results).toHaveLength(MATCH_CAP);
    expect(capped).toBe(true);
  });

  it("returns single match for non-global regex", () => {
    const { results } = runMatches(/a/, "banana");
    expect(results).toHaveLength(1);
    expect(results[0]?.index).toBe(1);
  });

  it("reports elapsedMs", () => {
    const { elapsedMs } = runMatches(/a/g, "banana");
    expect(elapsedMs).toBeGreaterThanOrEqual(0);
  });
});
