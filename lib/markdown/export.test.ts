import { afterEach, describe, expect, it, vi } from "vitest";
import { exportAsMarkdown } from "./export";

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("markdown downloads", () => {
  it("attaches the anchor before clicking and defers URL revocation", () => {
    vi.useFakeTimers();
    const appendChild = vi.fn();
    const anchor = { href: "", download: "", click: vi.fn(), remove: vi.fn() };
    const createElement = vi.fn(() => anchor);
    vi.stubGlobal("document", { body: { appendChild }, createElement });
    vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:markdown");
    const revoke = vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});

    exportAsMarkdown("notes.txt", "# Hello");

    expect(anchor.href).toBe("blob:markdown");
    expect(anchor.download).toBe("notes.md");
    expect(appendChild).toHaveBeenCalledWith(anchor);
    expect(appendChild.mock.invocationCallOrder[0]).toBeLessThan(
      anchor.click.mock.invocationCallOrder[0]!,
    );
    expect(anchor.remove).toHaveBeenCalledOnce();
    expect(revoke).not.toHaveBeenCalled();
    vi.runAllTimers();
    expect(revoke).toHaveBeenCalledWith("blob:markdown");
  });
});
