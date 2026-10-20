import type { CommandResult, TerminalCommand } from "../types";

/** Message echoed when a bare /browser opens the panel. */
const BARE_MESSAGE = "Browser opens in a panel.";

/** The href when the candidate parses to an absolute http(s) URL, else null. */
function toHttpUrl(candidate: string): string | null {
  try {
    const url = new URL(candidate);
    if ((url.protocol !== "http:" && url.protocol !== "https:") || url.hostname === "") {
      return null;
    }
    return url.href;
  } catch {
    return null;
  }
}

/**
 * Normalise a user-typed address to an absolute http(s) URL: bare hosts get
 * https://, host:port keeps its port, and every non-http scheme
 * (javascript:, data:, about:, mailto:, ftp://, …) is rejected — the panel
 * only ever loads web pages. Returns null when the input is empty or not a
 * usable address.
 */
export function normalizeBrowserUrl(input: string): string | null {
  const trimmed = input.trim();
  if (trimmed === "") return null;
  if (/^https?:\/\//i.test(trimmed)) return toHttpUrl(trimmed);
  // Any other explicit scheme: "ftp://host", "file:///etc/hosts", …
  if (/^[a-z][a-z0-9+.-]*:\/\//i.test(trimmed)) return null;
  // Scheme-like input without slashes ("javascript:alert(1)", "mailto:…");
  // "host:3000" survives because its colon is followed by port digits.
  if (/^[a-z][a-z0-9+.-]*:(?!\/|\d)/i.test(trimmed)) return null;
  return toHttpUrl(`https://${trimmed}`);
}

/**
 * /browser (alias /web): bare or empty args open the panel on its start
 * page; an address normalises (bare hosts get https://) and opens the panel
 * there. Unusable addresses answer with an error instead of opening.
 */
export function runBrowser(args: string): CommandResult {
  const input = args.trim();
  if (input === "") {
    return { type: "browser", url: null, output: [{ type: "text", text: BARE_MESSAGE }] };
  }
  const url = normalizeBrowserUrl(input);
  if (url === null) {
    return {
      type: "answer",
      output: [
        {
          type: "error",
          text: `That doesn't look like a web address: "${input}". Try /browser example.com.`,
        },
      ],
    };
  }
  return {
    type: "browser",
    url,
    output: [{ type: "text", text: `Opening ${url} in the browser panel.` }],
  };
}

export const browserCommand: TerminalCommand = {
  name: "browser",
  aliases: ["web"],
  summary: "Browse a web page in the side panel",
  usage: ["/browser", "/browser example.com", "/browser https://example.com/path"],
  category: "Utilities",
  slug: null,
  status: "live",
  run(args: string): CommandResult {
    return runBrowser(args);
  },
};
