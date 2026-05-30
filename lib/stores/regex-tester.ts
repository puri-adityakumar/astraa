import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { createZustandStorage } from "./storage";
import type { CodeLang, MiniTest, RegexFlag } from "@/lib/regex-tester/types";

export type ReferenceTab =
  | "starters"
  | "cheatsheet"
  | "explain"
  | "tests"
  | "code";

export type RegexTesterState = {
  schemaVersion: 1;
  pattern: string;
  flags: string;
  testString: string;
  replacement: string;
  replaceOpen: boolean;
  selectedReferenceTab: ReferenceTab;
  miniTests: MiniTest[];
  codeLang: CodeLang;
  setPattern: (value: string) => void;
  setFlags: (value: string) => void;
  toggleFlag: (flag: RegexFlag) => void;
  setTestString: (value: string) => void;
  setReplacement: (value: string) => void;
  setReplaceOpen: (open: boolean) => void;
  setSelectedReferenceTab: (tab: ReferenceTab) => void;
  setMiniTests: (tests: MiniTest[]) => void;
  setCodeLang: (lang: CodeLang) => void;
  reset: () => void;
};

const DEFAULT_TEST_STRING = [
  "alice@example.com",
  "bob.smith+filter@mail.co",
  "not-an-email",
  "carol@sub.domain.org",
].join("\n");

const initialState = {
  schemaVersion: 1 as const,
  pattern: "",
  flags: "g",
  testString: DEFAULT_TEST_STRING,
  replacement: "",
  replaceOpen: false,
  selectedReferenceTab: "starters" as ReferenceTab,
  miniTests: [] as MiniTest[],
  codeLang: "js" as CodeLang,
};

const FLAG_ORDER: RegexFlag[] = ["g", "i", "m", "s", "u", "y"];

const normalizeFlags = (input: string): string => {
  const seen = new Set<string>();
  const allowed = new Set<string>(FLAG_ORDER);
  for (const ch of input) {
    if (allowed.has(ch)) seen.add(ch);
  }
  return FLAG_ORDER.filter((f) => seen.has(f)).join("");
};

export const useRegexTester = create<RegexTesterState>()(
  persist(
    (set, get) => ({
      ...initialState,

      setPattern: (value) => set({ pattern: value }),

      setFlags: (value) => set({ flags: normalizeFlags(value) }),

      toggleFlag: (flag) => {
        const current = get().flags;
        const has = current.includes(flag);
        const next = has
          ? current
              .split("")
              .filter((c) => c !== flag)
              .join("")
          : current + flag;
        set({ flags: normalizeFlags(next) });
      },

      setTestString: (value) => set({ testString: value }),

      setReplacement: (value) => set({ replacement: value }),

      setReplaceOpen: (open) => set({ replaceOpen: open }),

      setSelectedReferenceTab: (tab) => set({ selectedReferenceTab: tab }),

      setMiniTests: (tests) => set({ miniTests: tests }),

      setCodeLang: (lang) => set({ codeLang: lang }),

      reset: () => set({ ...initialState }),
    }),
    {
      name: "regex-tester",
      storage: createJSONStorage(() => createZustandStorage()),
      version: 1,
      partialize: (s) => ({
        schemaVersion: s.schemaVersion,
        pattern: s.pattern,
        flags: s.flags,
        testString: s.testString,
        replacement: s.replacement,
        replaceOpen: s.replaceOpen,
        selectedReferenceTab: s.selectedReferenceTab,
        miniTests: s.miniTests,
        codeLang: s.codeLang,
      }),
    },
  ),
);
