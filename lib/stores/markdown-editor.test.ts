import { describe, it, expect, beforeEach, vi } from "vitest";
import { useMarkdownEditor } from "./markdown-editor";

describe("markdown-editor store", () => {
  beforeEach(() => {
    useMarkdownEditor.setState(useMarkdownEditor.getInitialState(), true);
  });

  it("starts with one unpinned draft and selects it", () => {
    const state = useMarkdownEditor.getState();
    expect(state.files).toHaveLength(1);
    expect(state.files[0]?.pinned).toBe(false);
    expect(state.files[0]?.content).toBe("");
    expect(state.currentFileId).toBe(state.files[0]?.id);
  });

  it("starts with viewMode 'split' and sidebar closed", () => {
    const state = useMarkdownEditor.getState();
    expect(state.viewMode).toBe("split");
    expect(state.sidebarOpen).toBe(false);
  });

  it("has schemaVersion 1", () => {
    expect(useMarkdownEditor.getState().schemaVersion).toBe(1);
  });

  it("createFile adds a pinned file and selects it", () => {
    useMarkdownEditor.getState().createFile();
    const state = useMarkdownEditor.getState();
    expect(state.files).toHaveLength(2);
    const created = state.files.find((f) => f.pinned);
    expect(created).toBeDefined();
    expect(created?.title).toBe("Untitled 1");
    expect(state.currentFileId).toBe(created?.id);
  });

  it("createFile is rejected at the 10-pinned cap", () => {
    const { createFile } = useMarkdownEditor.getState();
    for (let i = 0; i < 10; i += 1) createFile();
    expect(useMarkdownEditor.getState().files.filter((f) => f.pinned)).toHaveLength(10);
    createFile();
    expect(useMarkdownEditor.getState().files.filter((f) => f.pinned)).toHaveLength(10);
  });

  it("renameFile updates pinned files and trims; rejects empty/whitespace", () => {
    const { createFile, renameFile } = useMarkdownEditor.getState();
    createFile();
    const id = useMarkdownEditor.getState().currentFileId;
    renameFile(id, "  My Notes  ");
    expect(useMarkdownEditor.getState().files.find((f) => f.id === id)?.title).toBe("My Notes");
    renameFile(id, "   ");
    expect(useMarkdownEditor.getState().files.find((f) => f.id === id)?.title).toBe("My Notes");
  });

  it("renameFile ignores the unpinned draft", () => {
    const draftId = useMarkdownEditor.getState().currentFileId;
    useMarkdownEditor.getState().renameFile(draftId, "Renamed");
    expect(useMarkdownEditor.getState().files.find((f) => f.id === draftId)?.title).toBe(
      "Untitled draft",
    );
  });

  it("deleteFile removes a pinned file and reselects the first remaining", () => {
    const { createFile, deleteFile } = useMarkdownEditor.getState();
    createFile();
    const firstPinned = useMarkdownEditor.getState().currentFileId;
    createFile();
    deleteFile(firstPinned);
    expect(useMarkdownEditor.getState().files.some((f) => f.id === firstPinned)).toBe(false);
  });

  it("deleting the last file auto-creates a fresh draft", () => {
    const { createFile, deleteFile } = useMarkdownEditor.getState();
    createFile();
    const draftId = useMarkdownEditor.getState().files.find((f) => !f.pinned)?.id ?? "";
    const pinnedId = useMarkdownEditor.getState().files.find((f) => f.pinned)?.id ?? "";
    deleteFile(pinnedId);
    deleteFile(draftId);
    const state = useMarkdownEditor.getState();
    expect(state.files).toHaveLength(1);
    expect(state.files[0]?.pinned).toBe(false);
    expect(state.currentFileId).toBe(state.files[0]?.id);
  });

  it("deleteFile ignores the unpinned draft", () => {
    const draftId = useMarkdownEditor.getState().currentFileId;
    useMarkdownEditor.getState().deleteFile(draftId);
    expect(useMarkdownEditor.getState().files.find((f) => f.id === draftId)).toBeDefined();
  });

  it("selectFile switches currentFileId", () => {
    useMarkdownEditor.getState().createFile();
    const id = useMarkdownEditor.getState().currentFileId;
    const draftId = useMarkdownEditor.getState().files.find((f) => !f.pinned)?.id ?? "";
    useMarkdownEditor.getState().selectFile(draftId);
    expect(useMarkdownEditor.getState().currentFileId).toBe(draftId);
    expect(useMarkdownEditor.getState().currentFileId).not.toBe(id);
  });

  it("updateContent updates content and lastEditedAt", () => {
    vi.useFakeTimers();
    const id = useMarkdownEditor.getState().currentFileId;
    const before = useMarkdownEditor.getState().files.find((f) => f.id === id)?.lastEditedAt ?? 0;
    vi.setSystemTime(before + 1000);
    useMarkdownEditor.getState().updateContent(id, "hello");
    const after = useMarkdownEditor.getState().files.find((f) => f.id === id);
    expect(after?.content).toBe("hello");
    expect(after?.lastEditedAt).toBeGreaterThan(before);
    vi.useRealTimers();
  });

  it("setViewMode and toggleSidebar update flags", () => {
    useMarkdownEditor.getState().setViewMode("preview");
    expect(useMarkdownEditor.getState().viewMode).toBe("preview");
    useMarkdownEditor.getState().toggleSidebar();
    expect(useMarkdownEditor.getState().sidebarOpen).toBe(true);
  });
});
