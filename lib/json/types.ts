export type JsonPrimitive = string | number | boolean | null;
export type JsonValue = JsonPrimitive | JsonValue[] | { [key: string]: JsonValue };
export type JsonType = "string" | "number" | "boolean" | "null" | "object" | "array";

export type Diagnostic = {
  severity: "error";
  message: string;
  line?: number;
  column?: number;
  bytePosition?: number;
};

export type ParseResult = {
  id: number;
  value: JsonValue | null;
  diagnostics: Diagnostic[];
  bytes: number;
  parseMs: number;
};

export type View = "text" | "tree" | "convert" | "generate";
export type IndentOption = 2 | 4 | "tab";
export type ConvertFormat = "yaml" | "csv" | "markdown";
export type GenerateFormat = "typescript" | "zod" | "json-schema";

export type TreeRow = {
  path: string;
  key: string | number;
  depth: number;
  type: JsonType;
  preview: string;
  hasChildren: boolean;
  isExpanded: boolean;
  childCount?: number;
};

export type PatchOp = "set" | "remove" | "add";

export type ValidationResult =
  | { ok: true }
  | { ok: false; reason: "type" | "size" };
