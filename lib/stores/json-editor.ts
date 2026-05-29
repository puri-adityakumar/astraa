import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { createZustandStorage } from "./storage";
import { DEFAULT_STATE, MAX_PERSIST_BYTES } from "@/lib/json/defaults";
import { applyPatch } from "@/lib/json/patch";
import { serialize } from "@/lib/json/serialize";
import type {
  ConvertFormat,
  Diagnostic,
  GenerateFormat,
  IndentOption,
  JsonValue,
  PatchOp,
  View,
} from "@/lib/json/types";

export type JsonEditorState = {
  schemaVersion: 1;
  text: string;
  view: View;
  indent: IndentOption;
  sortKeys: boolean;
  filename: string;
  parsedValue: JsonValue | null;
  diagnostics: Diagnostic[];
  parsedAt: number;
  expanded: string[];
  convertFormat: ConvertFormat;
  generateFormat: GenerateFormat;
};

type Actions = {
  setText: (text: string) => void;
  setView: (view: View) => void;
  setIndent: (indent: IndentOption) => void;
  setSortKeys: (on: boolean) => void;
  setFilename: (name: string) => void;
  setParseResult: (value: JsonValue | null, diagnostics: Diagnostic[]) => void;
  setExpanded: (paths: string[]) => void;
  togglePath: (path: string) => void;
  setConvertFormat: (f: ConvertFormat) => void;
  setGenerateFormat: (f: GenerateFormat) => void;
  format: () => void;
  minify: () => void;
  sortKeysAction: () => void;
  applyPatchAt: (path: string, op: PatchOp, value?: JsonValue) => void;
  reset: () => void;
};

export type JsonEditorStore = JsonEditorState & Actions;

const initialState: JsonEditorState = {
  schemaVersion: 1,
  text: DEFAULT_STATE.text,
  view: DEFAULT_STATE.view,
  indent: DEFAULT_STATE.indent,
  sortKeys: DEFAULT_STATE.sortKeys,
  filename: DEFAULT_STATE.filename,
  parsedValue: DEFAULT_STATE.parsedValue,
  diagnostics: DEFAULT_STATE.diagnostics,
  parsedAt: DEFAULT_STATE.parsedAt,
  expanded: DEFAULT_STATE.expanded,
  convertFormat: DEFAULT_STATE.convertFormat,
  generateFormat: DEFAULT_STATE.generateFormat,
};

export function stripVolatile(state: JsonEditorState): JsonEditorState {
  const text =
    state.text.length > MAX_PERSIST_BYTES
      ? state.text.slice(0, MAX_PERSIST_BYTES)
      : state.text;
  return { ...state, text, parsedValue: null, diagnostics: [], parsedAt: 0 };
}

export const useJsonEditor = create<JsonEditorStore>()(
  persist(
    (set, get) => ({
      ...initialState,
      setText: (text) => set({ text }),
      setView: (view) => set({ view }),
      setIndent: (indent) => set({ indent }),
      setSortKeys: (sortKeys) => set({ sortKeys }),
      setFilename: (filename) => set({ filename }),
      setParseResult: (parsedValue, diagnostics) =>
        set({ parsedValue, diagnostics, parsedAt: get().parsedAt + 1 }),
      setExpanded: (expanded) => set({ expanded }),
      togglePath: (path) => {
        const expanded = get().expanded;
        set({
          expanded: expanded.includes(path)
            ? expanded.filter((p) => p !== path)
            : [...expanded, path],
        });
      },
      setConvertFormat: (convertFormat) => set({ convertFormat }),
      setGenerateFormat: (generateFormat) => set({ generateFormat }),
      format: () => {
        const { parsedValue, indent, sortKeys } = get();
        if (parsedValue === null) return;
        set({ text: serialize(parsedValue, { indent, sortKeys }) });
      },
      minify: () => {
        const { parsedValue } = get();
        if (parsedValue === null) return;
        set({ text: JSON.stringify(parsedValue) });
      },
      sortKeysAction: () => {
        const { parsedValue, indent } = get();
        if (parsedValue === null) return;
        set({
          text: serialize(parsedValue, { indent, sortKeys: true }),
          sortKeys: true,
        });
      },
      applyPatchAt: (path, op, value) => {
        const { parsedValue, indent, sortKeys } = get();
        if (parsedValue === null) return;
        const next = applyPatch(parsedValue, path, op, value);
        set({ text: serialize(next, { indent, sortKeys }) });
      },
      reset: () => set({ ...initialState }),
    }),
    {
      name: "json-editor",
      version: 1,
      storage: createJSONStorage(() => createZustandStorage()),
      partialize: (state) => {
        const persistable: JsonEditorState = {
          schemaVersion: state.schemaVersion,
          text: state.text,
          view: state.view,
          indent: state.indent,
          sortKeys: state.sortKeys,
          filename: state.filename,
          parsedValue: state.parsedValue,
          diagnostics: state.diagnostics,
          parsedAt: state.parsedAt,
          expanded: state.expanded,
          convertFormat: state.convertFormat,
          generateFormat: state.generateFormat,
        };
        return stripVolatile(persistable);
      },
    },
  ),
);
