import { describe, expect, it } from "vitest";
import {
  BROWSER_HISTORY_LIMIT,
  browserHistoryBack,
  browserHistoryForward,
  navigateBrowser,
  type BrowserHistory,
} from "./browser-history";

describe("browser history", () => {
  it("starts a new browser session without history", () => {
    expect(navigateBrowser(null, null)).toEqual({ url: null, past: [], future: [] });
    expect(navigateBrowser(null, "https://example.com")).toEqual({
      url: "https://example.com",
      past: [],
      future: [],
    });
  });

  it("walks back and forward, including the start page, without mutating state", () => {
    const current = navigateBrowser(navigateBrowser(null, null), "https://example.com");
    const previous = browserHistoryBack(current);

    expect(previous).toEqual({ url: null, past: [], future: ["https://example.com"] });
    expect(browserHistoryForward(previous)).toEqual(current);
    expect(current).toEqual({ url: "https://example.com", past: [null], future: [] });
  });

  it("discards the forward stack on a fresh navigation", () => {
    const current = browserHistoryBack(
      navigateBrowser(navigateBrowser(null, null), "https://example.com"),
    );
    expect(navigateBrowser(current, "https://example.org")).toEqual({
      url: "https://example.org",
      past: [null],
      future: [],
    });
  });

  it("does nothing when back or forward is unavailable", () => {
    const current = navigateBrowser(null, null);
    expect(browserHistoryBack(null)).toBeNull();
    expect(browserHistoryForward(null)).toBeNull();
    expect(browserHistoryBack(current)).toBe(current);
    expect(browserHistoryForward(current)).toBe(current);
  });

  it("keeps only 50 past locations after navigating and walking forward", () => {
    let current: BrowserHistory | null = navigateBrowser(null, null);
    for (let index = 1; index <= BROWSER_HISTORY_LIMIT + 2; index++) {
      current = navigateBrowser(current, `https://example.com/${index}`);
    }

    expect(current.past).toHaveLength(50);
    expect(current.past[0]).toBe("https://example.com/2");
    expect(current.url).toBe("https://example.com/52");
    for (let index = 0; index < BROWSER_HISTORY_LIMIT; index++) {
      current = browserHistoryBack(current);
    }
    expect(current?.past).toEqual([]);
    expect(current?.future).toHaveLength(50);
    for (let index = 0; index < BROWSER_HISTORY_LIMIT; index++) {
      current = browserHistoryForward(current);
    }
    expect(current?.past).toHaveLength(50);
    expect(current?.url).toBe("https://example.com/52");
  });

  it("also caps the past stack when moving forward", () => {
    const past = Array.from({ length: BROWSER_HISTORY_LIMIT }, (_, index) => `${index}`);
    const current = { url: "current", past, future: ["next"] };
    const next = browserHistoryForward(current);

    expect(next?.past).toHaveLength(50);
    expect(next?.past[0]).toBe("1");
    expect(next?.past.at(-1)).toBe("current");
    expect(current.past).toEqual(past);
  });
});
