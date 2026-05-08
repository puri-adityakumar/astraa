import { describe, it, expect, beforeEach, vi } from "vitest";
import { useMarkdownEditor } from "./markdown-editor";

describe("markdown-editor store (v2)", () => {
  beforeEach(() => {
    useMarkdownEditor.setState(useMarkdownEditor.getInitialState(), true);
  });

  it("starts empty: no files, no currentId, view mode, sidebar closed", () => {
    const s = useMarkdownEditor.getState();
    expect(s.files).toEqual([]);
    expect(s.currentId).toBeNull();
    expect(s.mode).toBe("view");
    expect(s.sidebarOpen).toBe(false);
    expect(s.draft).toBeNull();
    expect(s.schemaVersion).toBe(2);
  });

  it("uploadFile prepends new entry and selects it", () => {
    useMarkdownEditor.getState().uploadFile("README.md", "# hi");
    const s = useMarkdownEditor.getState();
    expect(s.files).toHaveLength(1);
    expect(s.files[0]?.name).toBe("README.md");
    expect(s.files[0]?.content).toBe("# hi");
    expect(s.currentId).toBe(s.files[0]?.id);
    expect(s.mode).toBe("view");
    expect(s.draft).toBeNull();
  });

  it("uploadFile replaces existing entry by case-insensitive filename", () => {
    const { uploadFile } = useMarkdownEditor.getState();
    uploadFile("README.md", "v1");
    const firstId = useMarkdownEditor.getState().files[0]!.id;
    uploadFile("readme.MD", "v2");
    const s = useMarkdownEditor.getState();
    expect(s.files).toHaveLength(1);
    expect(s.files[0]?.id).toBe(firstId);
    expect(s.files[0]?.content).toBe("v2");
    expect(s.files[0]?.name).toBe("readme.MD");
  });

  it("uploadFile evicts the 11th when adding past cap", () => {
    const { uploadFile } = useMarkdownEditor.getState();
    for (let i = 0; i < 11; i += 1) uploadFile(`f${i}.md`, `c${i}`);
    const s = useMarkdownEditor.getState();
    expect(s.files).toHaveLength(10);
    expect(s.files.map((f) => f.name)).not.toContain("f0.md");
    expect(s.files[0]?.name).toBe("f10.md");
  });

  it("uploadFile of existing file moves it to the top", () => {
    const { uploadFile } = useMarkdownEditor.getState();
    uploadFile("a.md", "1");
    uploadFile("b.md", "1");
    uploadFile("a.md", "2");
    const s = useMarkdownEditor.getState();
    expect(s.files[0]?.name).toBe("a.md");
  });

  it("setMode('edit') seeds draft from current content", () => {
    const { uploadFile, setMode } = useMarkdownEditor.getState();
    uploadFile("a.md", "hello");
    setMode("edit");
    const s = useMarkdownEditor.getState();
    expect(s.mode).toBe("edit");
    expect(s.draft).toBe("hello");
  });

  it("setDraft updates draft", () => {
    const { uploadFile, setMode, setDraft } = useMarkdownEditor.getState();
    uploadFile("a.md", "hello");
    setMode("edit");
    setDraft("hello world");
    expect(useMarkdownEditor.getState().draft).toBe("hello world");
  });

  it("save commits draft to current file content", () => {
    vi.useFakeTimers();
    const { uploadFile, setMode, setDraft, save } = useMarkdownEditor.getState();
    uploadFile("a.md", "v1");
    const before = useMarkdownEditor.getState().files[0]!.updatedAt;
    setMode("edit");
    setDraft("v2");
    vi.setSystemTime(before + 1000);
    save();
    const s = useMarkdownEditor.getState();
    expect(s.files[0]?.content).toBe("v2");
    expect(s.files[0]?.updatedAt).toBeGreaterThan(before);
    expect(s.draft).toBeNull();
    expect(s.mode).toBe("edit");
    vi.useRealTimers();
  });

  it("setMode('view') with unchanged draft clears draft", () => {
    const { uploadFile, setMode } = useMarkdownEditor.getState();
    uploadFile("a.md", "hello");
    setMode("edit");
    setMode("view");
    expect(useMarkdownEditor.getState().draft).toBeNull();
    expect(useMarkdownEditor.getState().mode).toBe("view");
  });

  it("selectFile switches currentId and clears draft", () => {
    const { uploadFile, selectFile, setMode, setDraft } = useMarkdownEditor.getState();
    uploadFile("a.md", "1");
    uploadFile("b.md", "2");
    const aId = useMarkdownEditor.getState().files.find((f) => f.name === "a.md")!.id;
    setMode("edit");
    setDraft("dirty");
    selectFile(aId);
    const s = useMarkdownEditor.getState();
    expect(s.currentId).toBe(aId);
    expect(s.draft).toBeNull();
  });

  it("deleteFile removes entry; if current, picks next or null", () => {
    const { uploadFile, deleteFile } = useMarkdownEditor.getState();
    uploadFile("a.md", "1");
    uploadFile("b.md", "2");
    const currentId = useMarkdownEditor.getState().currentId!;
    deleteFile(currentId);
    let s = useMarkdownEditor.getState();
    expect(s.files).toHaveLength(1);
    expect(s.currentId).toBe(s.files[0]?.id);
    deleteFile(s.files[0]!.id);
    s = useMarkdownEditor.getState();
    expect(s.files).toHaveLength(0);
    expect(s.currentId).toBeNull();
    expect(s.mode).toBe("view");
  });

  it("toggleSidebar flips flag", () => {
    expect(useMarkdownEditor.getState().sidebarOpen).toBe(false);
    useMarkdownEditor.getState().toggleSidebar();
    expect(useMarkdownEditor.getState().sidebarOpen).toBe(true);
  });
});
