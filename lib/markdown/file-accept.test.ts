import { describe, it, expect } from "vitest";
import { acceptMarkdownFile, MAX_FILE_BYTES } from "./file-accept";

const makeFile = (name: string, size: number, text = "x".repeat(size)) => {
  const file = new File([text], name);
  Object.defineProperty(file, "size", { value: size });
  return file;
};

describe("acceptMarkdownFile", () => {
  it("accepts .md", async () => {
    const file = new File(["# hi"], "README.md");
    const r = await acceptMarkdownFile(file);
    expect(r.kind).toBe("ok");
    if (r.kind === "ok") {
      expect(r.name).toBe("README.md");
      expect(r.text).toBe("# hi");
    }
  });

  it("accepts .markdown and .txt", async () => {
    const a = await acceptMarkdownFile(new File(["a"], "a.markdown"));
    const b = await acceptMarkdownFile(new File(["b"], "b.txt"));
    expect(a.kind).toBe("ok");
    expect(b.kind).toBe("ok");
  });

  it("is case-insensitive on extension", async () => {
    const r = await acceptMarkdownFile(new File(["x"], "X.MD"));
    expect(r.kind).toBe("ok");
  });

  it("rejects unsupported extension", async () => {
    const r = await acceptMarkdownFile(new File(["x"], "x.docx"));
    expect(r.kind).toBe("rejected");
    if (r.kind === "rejected") {
      expect(r.reason).toMatch(/unsupported/i);
    }
  });

  it("rejects no-extension file", async () => {
    const r = await acceptMarkdownFile(new File(["x"], "README"));
    expect(r.kind).toBe("rejected");
  });

  it("rejects > 5 MB", async () => {
    const file = makeFile("big.md", MAX_FILE_BYTES + 1);
    const r = await acceptMarkdownFile(file);
    expect(r.kind).toBe("rejected");
    if (r.kind === "rejected") {
      expect(r.reason).toMatch(/too large/i);
    }
  });

  it("accepts exactly at 5 MB boundary", async () => {
    const file = makeFile("ok.md", MAX_FILE_BYTES);
    const r = await acceptMarkdownFile(file);
    expect(r.kind).toBe("ok");
  });
});
