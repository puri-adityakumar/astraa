import { describe, expect, it, vi } from "vitest";
import { readFileAsArrayBuffer, readFileAsDataURL, readFileAsText } from "./file-reader";

/**
 * Minimal synchronous fake FileReader. `readAs*` set `result` and invoke
 * `onload` synchronously so the wrappers' promises settle on the next tick.
 */
class FakeFileReader {
  result: string | ArrayBuffer | null = null;
  error: Error | null = null;
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;

  readAsText(file: Blob) {
    this.result = `text:${(file as File).name}`;
    queueMicrotask(() => this.onload?.());
  }

  readAsDataURL(file: Blob) {
    this.result = `data:fake;${(file as File).name}`;
    queueMicrotask(() => this.onload?.());
  }

  readAsArrayBuffer(file: Blob) {
    this.result = new ArrayBuffer((file as File).name.length);
    queueMicrotask(() => this.onload?.());
  }
}

class FailingFileReader {
  result: string | ArrayBuffer | null = null;
  error: Error = new Error("boom");
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;

  readAsText() {
    queueMicrotask(() => this.onerror?.());
  }

  readAsDataURL() {
    queueMicrotask(() => this.onerror?.());
  }

  readAsArrayBuffer() {
    queueMicrotask(() => this.onerror?.());
  }
}

const makeFile = (name = "f.txt"): File => new File([new Uint8Array([0])], name);

describe("readFileAsText", () => {
  it("resolves with the reader's string result", async () => {
    vi.stubGlobal("FileReader", FakeFileReader);
    const text = await readFileAsText(makeFile("notes.txt"));
    expect(text).toBe("text:notes.txt");
    vi.unstubAllGlobals();
  });

  it("rejects when the reader errors", async () => {
    vi.stubGlobal("FileReader", FailingFileReader);
    await expect(readFileAsText(makeFile())).rejects.toThrow("boom");
    vi.unstubAllGlobals();
  });
});

describe("readFileAsDataURL", () => {
  it("resolves with the reader's data URL", async () => {
    vi.stubGlobal("FileReader", FakeFileReader);
    const url = await readFileAsDataURL(makeFile("pic.png"));
    expect(url).toBe("data:fake;pic.png");
    vi.unstubAllGlobals();
  });

  it("rejects when the reader errors", async () => {
    vi.stubGlobal("FileReader", FailingFileReader);
    await expect(readFileAsDataURL(makeFile())).rejects.toThrow("boom");
    vi.unstubAllGlobals();
  });
});

describe("readFileAsArrayBuffer", () => {
  it("resolves with the reader's ArrayBuffer", async () => {
    vi.stubGlobal("FileReader", FakeFileReader);
    const buffer = await readFileAsArrayBuffer(makeFile("ab"));
    expect(buffer).toBeInstanceOf(ArrayBuffer);
    expect(buffer.byteLength).toBe(2);
    vi.unstubAllGlobals();
  });

  it("rejects when the reader errors", async () => {
    vi.stubGlobal("FileReader", FailingFileReader);
    await expect(readFileAsArrayBuffer(makeFile())).rejects.toThrow("boom");
    vi.unstubAllGlobals();
  });
});
