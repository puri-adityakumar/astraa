import { describe, it, expect, beforeEach } from "vitest";
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
});
