import { describe, expect, it } from "vitest";
import { browserCommand, normalizeBrowserUrl, runBrowser } from "@/lib/terminal/commands/browser";
import type { CommandContext } from "@/lib/terminal/types";

const ctx: CommandContext = { theme: "auto", commands: [] };

describe("normalizeBrowserUrl", () => {
  it("prefixes bare hosts with https and normalises the href", () => {
    expect(normalizeBrowserUrl("example.com")).toBe("https://example.com/");
    expect(normalizeBrowserUrl("  example.com/path?q=1  ")).toBe("https://example.com/path?q=1");
    expect(normalizeBrowserUrl("EXAMPLE.COM")).toBe("https://example.com/");
  });

  it("keeps explicit http and https URLs", () => {
    expect(normalizeBrowserUrl("http://neverssl.com")).toBe("http://neverssl.com/");
    expect(normalizeBrowserUrl("https://example.com")).toBe("https://example.com/");
    expect(normalizeBrowserUrl("HTTPS://EXAMPLE.COM/PATH")).toBe("https://example.com/PATH");
  });

  it("treats host:port as a host, not a scheme", () => {
    expect(normalizeBrowserUrl("localhost:3000")).toBe("https://localhost:3000/");
    expect(normalizeBrowserUrl("example.com:8080/x")).toBe("https://example.com:8080/x");
  });

  it.each([
    "javascript:alert(1)",
    " data:text/html,<h1>hi</h1>",
    "about:blank",
    "mailto:user@example.com",
    "ftp://example.com",
    "file:///etc/hosts",
    "https://",
    "example .com",
    "",
    "   ",
  ])("rejects %j", (input) => {
    expect(normalizeBrowserUrl(input)).toBeNull();
  });
});

describe("runBrowser", () => {
  it("opens the start page for bare and whitespace args", () => {
    expect(runBrowser("")).toEqual({
      type: "browser",
      url: null,
      output: [{ type: "text", text: "Browser opens in a panel." }],
    });
    expect(runBrowser("   ").type).toBe("browser");
  });

  it("normalises an address and echoes the absolute URL", () => {
    expect(runBrowser("example.com")).toEqual({
      type: "browser",
      url: "https://example.com/",
      output: [{ type: "text", text: "Opening https://example.com/ in the browser panel." }],
    });
  });

  it.each(["javascript:alert(1)", "not a url!!", "https://"])(
    "answers with an error for %j instead of opening",
    (input) => {
      const result = runBrowser(input);
      expect(result.type).toBe("answer");
      if (result.type === "answer") {
        const first = result.output[0];
        expect(first?.type).toBe("error");
        if (first?.type === "error") expect(first.text).toContain(input);
      }
    },
  );
});

describe("browserCommand", () => {
  it("registers without a tool slug and with the web alias", () => {
    expect(browserCommand.name).toBe("browser");
    expect(browserCommand.aliases).toContain("web");
    expect(browserCommand.slug).toBeNull();
    expect(browserCommand.status).toBe("live");
  });

  it("delegates run to runBrowser", () => {
    expect(browserCommand.run("example.com", ctx)).toEqual({
      type: "browser",
      url: "https://example.com/",
      output: [{ type: "text", text: "Opening https://example.com/ in the browser panel." }],
    });
  });
});
