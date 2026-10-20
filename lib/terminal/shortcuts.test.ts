import { describe, expect, it } from "vitest";
import { TERMINAL_SHORTCUTS } from "@/lib/terminal/shortcuts";

describe("terminal shortcuts", () => {
  it("lists the prompt controls and discovery commands without duplicate keys", () => {
    expect(TERMINAL_SHORTCUTS.map((shortcut) => shortcut.key)).toEqual([
      "/",
      "↑ ↓",
      "Tab",
      "Enter",
      "Esc",
      "Ctrl+L",
      "/config",
      "/help",
    ]);
    expect(new Set(TERMINAL_SHORTCUTS.map((shortcut) => shortcut.key)).size)
      .toBe(TERMINAL_SHORTCUTS.length);
    expect(TERMINAL_SHORTCUTS.every((shortcut) => shortcut.description.length > 0)).toBe(true);
  });
});
