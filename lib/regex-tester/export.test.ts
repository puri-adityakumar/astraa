import { describe, expect, it } from "vitest";
import { matchesToCsv, matchesToJson } from "./export";
import type { MatchResult } from "./types";

const sample: MatchResult[] = [
  {
    index: 0,
    length: 5,
    full: "hello",
    groups: ["ell"],
    namedGroups: { greeting: "hello" },
  },
  {
    index: 7,
    length: 5,
    full: "world",
    groups: ["orl"],
    namedGroups: {},
  },
];

describe("matchesToJson", () => {
  it("roundtrips through JSON.parse", () => {
    const json = matchesToJson(sample);
    expect(JSON.parse(json)).toEqual(sample);
  });

  it("returns [] for empty matches", () => {
    expect(matchesToJson([])).toBe("[]");
  });
});

describe("matchesToCsv", () => {
  it("emits a header row plus one row per match", () => {
    const csv = matchesToCsv(sample);
    const lines = csv.split("\n");
    expect(lines).toHaveLength(3);
    expect(lines[0]).toBe("index,length,full,group_1,namedGroup_greeting");
    expect(lines[1]).toBe("0,5,hello,ell,hello");
    expect(lines[2]).toBe("7,5,world,orl,");
  });

  it("escapes commas, quotes, and newlines", () => {
    const tricky: MatchResult[] = [
      {
        index: 0,
        length: 11,
        full: 'hello,"hi"\nbye',
        groups: [],
        namedGroups: {},
      },
    ];
    const csv = matchesToCsv(tricky);
    expect(csv).toBe(
      'index,length,full\n0,11,"hello,""hi""\nbye"',
    );
  });

  it("returns header only when matches empty", () => {
    expect(matchesToCsv([])).toBe("index,length,full");
  });
});
