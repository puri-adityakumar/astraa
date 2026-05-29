import type { IndentOption, View, ConvertFormat, GenerateFormat } from "./types";

export const SAMPLE_JSON = `[
  {
    "slug": "snippet",
    "name": "Code Snippet Generator",
    "released": "2026-04-02",
    "users": 12450,
    "rating": 4.8,
    "premium": false
  },
  {
    "slug": "markdown",
    "name": "Markdown Editor",
    "released": "2026-03-18",
    "users": 8560,
    "rating": 4.6,
    "premium": false
  },
  {
    "slug": "json",
    "name": "JSON Editor",
    "released": "2026-05-29",
    "users": 2100,
    "rating": 4.9,
    "premium": true
  }
]`;

export const MAX_DOCUMENT_BYTES = 50 * 1024 * 1024;
export const MAX_PERSIST_BYTES = 256 * 1024;
export const MAX_REPAIR_BYTES = 5 * 1024 * 1024;

export const INDENT_OPTIONS: IndentOption[] = [2, 4, "tab"];

export const ALLOWED_MIME = [
  "application/json",
  "text/plain",
  "",
] as const;

export const DEFAULT_STATE = {
  schemaVersion: 1 as const,
  text: SAMPLE_JSON,
  view: "text" as View,
  indent: 2 as IndentOption,
  sortKeys: false,
  filename: "data.json",
  parsedValue: null,
  diagnostics: [],
  parsedAt: 0,
  expanded: ["", "[0]", "[1]", "[2]"] as string[],
  convertFormat: "yaml" as ConvertFormat,
  generateFormat: "typescript" as GenerateFormat,
};
