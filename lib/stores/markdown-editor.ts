import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { createZustandStorage } from "./storage";

export type FileEntry = {
  id: string;
  name: string;
  content: string;
  uploadedAt: number;
  updatedAt: number;
};

export type Mode = "view" | "edit";

export type MarkdownEditorState = {
  schemaVersion: 3;
  files: FileEntry[];
  currentId: string | null;
  mode: Mode;
  sidebarOpen: boolean;
  draft: string | null;
  uploadFile: (name: string, content: string) => void;
  selectFile: (id: string) => void;
  deleteFile: (id: string) => void;
  setMode: (mode: Mode) => void;
  setDraft: (text: string) => void;
  save: () => void;
  toggleSidebar: () => void;
};

const MAX_FILES = 10;

const newId = (): string =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);

const initialState = {
  schemaVersion: 3 as const,
  files: [] as FileEntry[],
  currentId: null as string | null,
  mode: "view" as Mode,
  sidebarOpen: false,
  draft: null as string | null,
};

export const useMarkdownEditor = create<MarkdownEditorState>()(
  persist(
    (set, get) => ({
      ...initialState,

      uploadFile: (name, content) => {
        const now = Date.now();
        const lower = name.toLowerCase();
        const { files } = get();
        const existing = files.find((f) => f.name.toLowerCase() === lower);
        if (existing) {
          const updated: FileEntry = {
            ...existing,
            name,
            content,
            updatedAt: now,
          };
          const others = files.filter((f) => f.id !== existing.id);
          set({
            files: [updated, ...others],
            currentId: updated.id,
            mode: "view",
            draft: null,
          });
          return;
        }
        const entry: FileEntry = {
          id: newId(),
          name,
          content,
          uploadedAt: now,
          updatedAt: now,
        };
        const next = [entry, ...files].slice(0, MAX_FILES);
        set({ files: next, currentId: entry.id, mode: "view", draft: null });
      },

      selectFile: (id) => {
        const exists = get().files.some((f) => f.id === id);
        if (!exists) return;
        set({ currentId: id, mode: "view", draft: null });
      },

      deleteFile: (id) => {
        const { files, currentId } = get();
        const remaining = files.filter((f) => f.id !== id);
        if (currentId === id) {
          set({
            files: remaining,
            currentId: remaining[0]?.id ?? null,
            mode: "view",
            draft: null,
          });
        } else {
          set({ files: remaining });
        }
      },

      setMode: (mode) => {
        const { files, currentId } = get();
        if (mode === "edit") {
          const current = files.find((f) => f.id === currentId);
          set({ mode, draft: current?.content ?? "" });
        } else {
          set({ mode, draft: null });
        }
      },

      setDraft: (text) => set({ draft: text }),

      save: () => {
        const { files, currentId, draft } = get();
        if (draft === null || currentId === null) return;
        const now = Date.now();
        const next = files.map((f) =>
          f.id === currentId ? { ...f, content: draft, updatedAt: now } : f,
        );
        set({ files: next, draft: null, mode: "view" });
      },

      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
    }),
    {
      name: "markdown-editor",
      storage: createJSONStorage(() => createZustandStorage()),
      version: 3,
      migrate: (persisted, version) => {
        if (version < 3) {
          const p = persisted as Partial<MarkdownEditorState> | null;
          return {
            ...initialState,
            files: p?.files ?? [],
            sidebarOpen: p?.sidebarOpen ?? false,
          };
        }
        return persisted as MarkdownEditorState;
      },
      partialize: (s) => ({
        schemaVersion: s.schemaVersion,
        files: s.files,
        sidebarOpen: s.sidebarOpen,
      }),
    },
  ),
);
