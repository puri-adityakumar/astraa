import type { IndentOption, View, ConvertFormat, GenerateFormat } from "./types";

export const SAMPLE_JSON = `{
  "name": "astraa",
  "version": "1.1.0",
  "tools": ["snippet", "markdown", "json"],
  "stats": {
    "downloads": 12450,
    "stars": 87,
    "active": true
  },
  "tags": null
}`;

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
  expanded: [] as string[],
  convertFormat: "yaml" as ConvertFormat,
  generateFormat: "typescript" as GenerateFormat,
};
