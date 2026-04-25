import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { createZustandStorage } from "./storage";

export type MarkdownFile = {
  id: string;
  title: string;
  content: string;
  pinned: boolean;
  createdAt: number;
  lastEditedAt: number;
};

export type ViewMode = "split" | "editor" | "preview";

export type MarkdownEditorState = {
  schemaVersion: 1;
  files: MarkdownFile[];
  currentFileId: string;
  viewMode: ViewMode;
  sidebarOpen: boolean;
  createFile: () => void;
  renameFile: (id: string, title: string) => void;
  deleteFile: (id: string) => void;
  selectFile: (id: string) => void;
  updateContent: (id: string, content: string) => void;
  setViewMode: (mode: ViewMode) => void;
  toggleSidebar: () => void;
};

const PINNED_CAP = 10;

const newId = (): string =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);

const newDraft = (): MarkdownFile => {
  const now = Date.now();
  return {
    id: newId(),
    title: "Untitled draft",
    content: "",
    pinned: false,
    createdAt: now,
    lastEditedAt: now,
  };
};

const initialDraft = newDraft();

export const useMarkdownEditor = create<MarkdownEditorState>()(
  persist(
    (set, get) => ({
      schemaVersion: 1,
      files: [initialDraft],
      currentFileId: initialDraft.id,
      viewMode: "split",
      sidebarOpen: false,

      createFile: () => {
        const { files } = get();
        const pinnedCount = files.filter((f) => f.pinned).length;
        if (pinnedCount >= PINNED_CAP) {
          return;
        }
        const now = Date.now();
        const file: MarkdownFile = {
          id: newId(),
          title: `Untitled ${pinnedCount + 1}`,
          content: "",
          pinned: true,
          createdAt: now,
          lastEditedAt: now,
        };
        set({ files: [...files, file], currentFileId: file.id });
      },

      renameFile: (id, title) => {
        const trimmed = title.trim();
        if (!trimmed) {
          return;
        }
        set((state) => ({
          files: state.files.map((f) =>
            f.id === id && f.pinned ? { ...f, title: trimmed } : f,
          ),
        }));
      },

      deleteFile: (id) => {
        const { files, currentFileId } = get();
        const target = files.find((f) => f.id === id);
        if (!target || !target.pinned) {
          return;
        }
        const remaining = files.filter((f) => f.id !== id);
        if (remaining.length === 0) {
          const draft = newDraft();
          set({ files: [draft], currentFileId: draft.id });
          return;
        }
        const nextCurrent =
          currentFileId === id ? (remaining[0]?.id ?? "") : currentFileId;
        set({ files: remaining, currentFileId: nextCurrent });
      },

      selectFile: (id) => {
        const exists = get().files.some((f) => f.id === id);
        if (!exists) {
          return;
        }
        set({ currentFileId: id });
      },

      updateContent: (id, content) => {
        const now = Date.now();
        set((state) => ({
          files: state.files.map((f) =>
            f.id === id ? { ...f, content, lastEditedAt: now } : f,
          ),
        }));
      },

      setViewMode: (mode) => set({ viewMode: mode }),
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
    }),
    {
      name: "markdown-editor",
      storage: createJSONStorage(() => createZustandStorage()),
      version: 1,
    },
  ),
);
