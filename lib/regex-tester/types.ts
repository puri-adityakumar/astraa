export type RegexFlag = "g" | "i" | "m" | "s" | "u" | "y";

export type MatchResult = {
  index: number;
  length: number;
  full: string;
  groups: (string | undefined)[];
  namedGroups: Record<string, string | undefined>;
};

export type CompileResult =
  | { ok: true; regex: RegExp }
  | { ok: false; error: string };

export type StarterPattern = {
  id: string;
  label: string;
  pattern: string;
  flags: string;
  description: string;
};

export type CheatsheetCategory =
  | "anchors"
  | "quantifiers"
  | "classes"
  | "groups"
  | "lookaround"
  | "escapes";

export type CheatsheetToken = {
  id: string;
  token: string;
  label: string;
  category: CheatsheetCategory;
  insertAtCaret: string;
};

export type ExplainNode = {
  id: string;
  label: string;
  detail: string;
  sourceRange: [number, number];
  children?: ExplainNode[];
};

export type MiniTestKind = "should-match" | "should-not-match";

export type MiniTest = {
  id: string;
  kind: MiniTestKind;
  input: string;
  expected?: string;
};

export type MatchExportFormat = "json" | "csv";

export type CodeLang = "js" | "python" | "java" | "go" | "php";
