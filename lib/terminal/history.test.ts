import { describe, expect, it } from "vitest";
import { initialHistoryNav, recallNext, recallPrevious } from "./history";

const HISTORY = ["/theme", "/help"];

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
