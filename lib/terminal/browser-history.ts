export const BROWSER_HISTORY_LIMIT = 50;

export interface BrowserHistory {
  url: string | null;
  past: (string | null)[];
  future: (string | null)[];
}

export function navigateBrowser(
  current: BrowserHistory | null,
  url: string | null,
): BrowserHistory {
  return current === null
    ? { url, past: [], future: [] }
    : {
        url,
        past: [...current.past, current.url].slice(-BROWSER_HISTORY_LIMIT),
        future: [],
      };
}

export function browserHistoryBack(current: BrowserHistory | null): BrowserHistory | null {
  if (current === null || current.past.length === 0) return current;
  return {
    url: current.past[current.past.length - 1] ?? null,
    past: current.past.slice(0, -1),
    future: [current.url, ...current.future],
  };
}

export function browserHistoryForward(current: BrowserHistory | null): BrowserHistory | null {
  if (current === null || current.future.length === 0) return current;
  return {
    url: current.future[0] ?? null,
    past: [...current.past, current.url].slice(-BROWSER_HISTORY_LIMIT),
    future: current.future.slice(1),
  };
}
