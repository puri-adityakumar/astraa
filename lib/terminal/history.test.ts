import { describe, expect, it } from "vitest";
import {
  appendHistoryEntry,
  historyEntryFor,
  initialHistoryNav,
  PROMPT_HISTORY_LIMIT,
  recallNext,
  recallPrevious,
} from "./history";

const HISTORY = ["/theme", "/help"];

describe("appendHistoryEntry", () => {
  it("adds a sanitized entry without mutating the previous history", () => {
    expect(appendHistoryEntry(HISTORY, "/pw 24")).toEqual([
      "/theme",
      "/help",
      "/password",
    ]);
    expect(HISTORY).toEqual(["/theme", "/help"]);
  });

  it("keeps only the newest 500 entries and recall still starts at the newest", () => {
    const history = Array.from({ length: PROMPT_HISTORY_LIMIT }, (_, index) => `${index}`);
    const next = appendHistoryEntry(history, "/help");

    expect(next).toHaveLength(500);
    expect(next[0]).toBe("1");
    expect(next.at(-1)).toBe("/help");
    expect(recallPrevious(initialHistoryNav, next, "")).toEqual({
      index: 499,
      draft: "",
    });
  });
});

describe("recallPrevious", () => {
  it("recalls the newest entry and saves the draft", () => {
    expect(recallPrevious(initialHistoryNav, HISTORY, "/the")).toEqual({
      index: 1,
      draft: "/the",
    });
  });

  it("walks backwards through history in order", () => {
    const first = recallPrevious(initialHistoryNav, HISTORY, "");
    const second = recallPrevious(first, HISTORY, "");
    expect(second.index).toBe(0);
    expect(second.draft).toBe("");
  });

  it("stays on the oldest entry", () => {
    const atFirst: { index: number; draft: string } = { index: 0, draft: "" };
    expect(recallPrevious(atFirst, HISTORY, "")).toEqual(atFirst);
  });

  it("does nothing on an empty history", () => {
    expect(recallPrevious(initialHistoryNav, [], "/the")).toBe(initialHistoryNav);
  });
});

describe("recallNext", () => {
  it("walks forward through history", () => {
    const atFirst = { index: 0, draft: "" };
    expect(recallNext(atFirst, HISTORY)).toEqual({ index: 1, draft: "" });
  });

  it("restores the partial draft at the end of the history", () => {
    const atLast = { index: 1, draft: "/the" };
    expect(recallNext(atLast, HISTORY)).toEqual({ index: null, draft: "/the" });
  });

  it("does nothing when not recalling", () => {
    expect(recallNext(initialHistoryNav, HISTORY)).toBe(initialHistoryNav);
  });
});

describe("historyEntryFor", () => {
  it("stores password commands without their arguments", () => {
    expect(historyEntryFor("/password 24")).toBe("/password");
    expect(historyEntryFor("/pw 12")).toBe("/password");
    expect(historyEntryFor("/pass")).toBe("/password");
  });

  it("normalises the password command name and case", () => {
    expect(historyEntryFor("/Password 99")).toBe("/password");
  });

  it("stores other commands verbatim", () => {
    expect(historyEntryFor("/hash md5 hello")).toBe("/hash md5 hello");
    expect(historyEntryFor("/calculator 2+2")).toBe("/calculator 2+2");
    expect(historyEntryFor("/theme")).toBe("/theme");
  });
});
