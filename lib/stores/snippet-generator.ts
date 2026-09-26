import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { createZustandStorage } from "./storage";
import { DEFAULT_STATE } from "@/lib/snippet-generator/defaults";
import type {
  AspectRatio,
  BackgroundState,
  FontConfig,
  Mode,
  Padding,
  SnippetState,
  WindowChrome,
} from "@/lib/snippet-generator/types";

type Actions = {
  setMode: (mode: Mode) => void;
  setCode: (code: string) => void;
  setLanguage: (language: string) => void;
  setFilename: (filename: string) => void;
  setTheme: (theme: string) => void;
  setFont: (font: FontConfig) => void;
  setPadding: (padding: Padding) => void;
  setWindowChrome: (windowChrome: WindowChrome) => void;
  setLineNumbers: (lineNumbers: boolean) => void;
  setDropShadow: (dropShadow: boolean) => void;
  setAspect: (aspect: AspectRatio) => void;
  setBackground: (background: BackgroundState) => void;
  setScreenshot: (screenshotDataUrl: string | null) => void;
  reset: () => void;
};

export type SnippetStore = SnippetState & Actions;

export function stripVolatile(state: SnippetState): SnippetState {
  const next: SnippetState = { ...state, screenshotDataUrl: null };
  if (next.background.kind === "image") {
    next.background = { ...DEFAULT_STATE.background };
  }
  return next;
}

export const useSnippetGenerator = create<SnippetStore>()(
  persist(
    (set) => ({
      ...DEFAULT_STATE,
      setMode: (mode) => set({ mode }),
      setCode: (code) => set({ code }),
      setLanguage: (language) => set({ language }),
      setFilename: (filename) => set({ filename }),
      setTheme: (theme) => set({ theme }),
      setFont: (font) => set({ font }),
      setPadding: (padding) => set({ padding }),
      setWindowChrome: (windowChrome) => set({ windowChrome }),
      setLineNumbers: (lineNumbers) => set({ lineNumbers }),
      setDropShadow: (dropShadow) => set({ dropShadow }),
      setAspect: (aspect) => set({ aspect }),
      setBackground: (background) => set({ background }),
      setScreenshot: (screenshotDataUrl) => set({ screenshotDataUrl }),
      reset: () => set({ ...DEFAULT_STATE }),
    }),
    {
      name: "snippet-generator",
      version: 1,
      storage: createJSONStorage(() => createZustandStorage()),
      partialize: (state) => {
        const persistable: SnippetState = {
          schemaVersion: state.schemaVersion,
          mode: state.mode,
          code: state.code,
          language: state.language,
          filename: state.filename,
          theme: state.theme,
          font: state.font,
          padding: state.padding,
          windowChrome: state.windowChrome,
          lineNumbers: state.lineNumbers,
          dropShadow: state.dropShadow,
          aspect: state.aspect,
          background: state.background,
          screenshotDataUrl: state.screenshotDataUrl,
        };
        return stripVolatile(persistable);
      },
    },
  ),
);
