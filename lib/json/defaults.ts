import type { IndentOption, View, ConvertFormat, GenerateFormat } from "./types";

export const SAMPLE_JSON = `{
  "title": "Fictional garden checklist",
  "revision": 3,
  "published": false,
  "labels": ["sample", "planning"],
  "summary": null,
  "settings": {
    "theme": "moonlight",
    "showCompleted": true
  },
  "items": [
    {
      "id": 1,
      "task": "Sketch a winding path",
      "done": true
    },
    {
      "id": 2,
      "task": "Choose imaginary flowers",
      "done": false
    }
  ]
}`;

export const MAX_DOCUMENT_BYTES = 50 * 1024 * 1024;
export const MAX_PERSIST_BYTES = 256 * 1024;
export const MAX_REPAIR_BYTES = 5 * 1024 * 1024;

export const INDENT_OPTIONS: IndentOption[] = [2, 4, "tab"];

export const ALLOWED_MIME = ["application/json", "text/plain", ""] as const;

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
  expanded: ["", "settings", "items", "items[0]", "items[1]"] as string[],
  convertFormat: "yaml" as ConvertFormat,
  generateFormat: "typescript" as GenerateFormat,
};
