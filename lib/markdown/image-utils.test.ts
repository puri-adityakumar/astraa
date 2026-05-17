import { describe, it, expect, vi } from "vitest";
import { processImageDrop } from "./image-utils";

const makeFile = (size: number, type = "image/png", name = "pic.png"): File => {
  const blob = new Blob([new Uint8Array(size)], { type });
  return new File([blob], name, { type });
};

describe("processImageDrop", () => {
  it("rejects non-image MIME types", async () => {
    const result = await processImageDrop(makeFile(100, "text/plain", "x.txt"));
    expect(result.kind).toBe("ignored");
  });

  it("rejects images larger than 10MB", async () => {
    const result = await processImageDrop(makeFile(10 * 1024 * 1024 + 1));
    expect(result.kind).toBe("blocked");
    if (result.kind === "blocked") {
      expect(result.reason).toMatch(/too large/i);
    }
  });

  it("warns when between 2MB and 10MB but proceeds", async () => {
    vi.stubGlobal("FileReader", FakeFileReader);
    const result = await processImageDrop(makeFile(3 * 1024 * 1024));
    expect(result.kind).toBe("ok");
    if (result.kind === "ok") {
      expect(result.warning).toMatch(/large/i);
      expect(result.markdown).toMatch(/^!\[pic\.png\]\(data:image\/png;base64,/);
    }
    vi.unstubAllGlobals();
  });

  it("returns markdown image syntax for small images, no warning", async () => {
    vi.stubGlobal("FileReader", FakeFileReader);
    const result = await processImageDrop(makeFile(1024));
    expect(result.kind).toBe("ok");
    if (result.kind === "ok") {
      expect(result.warning).toBeUndefined();
      expect(result.markdown).toBe("![pic.png](data:image/png;base64,FAKE)");
    }
    vi.unstubAllGlobals();
  });
});

class FakeFileReader {
  result: string | null = null;
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;
  readAsDataURL(file: Blob) {
    this.result = `data:${(file as File).type};base64,FAKE`;
    queueMicrotask(() => this.onload?.());
  }
}
