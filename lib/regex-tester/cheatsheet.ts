import type { CheatsheetToken } from "./types";

export const CHEATSHEET: CheatsheetToken[] = [
  // Anchors (4)
  {
    id: "anchor-start",
    token: "^",
    label: "Start of string (or line with m flag)",
    category: "anchors",
    insertAtCaret: "^",
  },
  {
    id: "anchor-end",
    token: "$",
    label: "End of string (or line with m flag)",
    category: "anchors",
    insertAtCaret: "$",
  },
  {
    id: "anchor-word-boundary",
    token: "\\b",
    label: "Word boundary",
    category: "anchors",
    insertAtCaret: "\\b",
  },
  {
    id: "anchor-non-word-boundary",
    token: "\\B",
    label: "Non-word boundary",
    category: "anchors",
    insertAtCaret: "\\B",
  },

  // Quantifiers (6)
  {
    id: "quant-star",
    token: "*",
    label: "0 or more (greedy)",
    category: "quantifiers",
    insertAtCaret: "*",
  },
  {
    id: "quant-plus",
    token: "+",
    label: "1 or more (greedy)",
    category: "quantifiers",
    insertAtCaret: "+",
  },
  {
    id: "quant-question",
    token: "?",
    label: "0 or 1 (optional)",
    category: "quantifiers",
    insertAtCaret: "?",
  },
  {
    id: "quant-exact",
    token: "{n}",
    label: "Exactly n times",
    category: "quantifiers",
    insertAtCaret: "{3}",
  },
  {
    id: "quant-range",
    token: "{n,m}",
    label: "Between n and m times",
    category: "quantifiers",
    insertAtCaret: "{1,3}",
  },
  {
    id: "quant-lazy",
    token: "*?",
    label: "Lazy quantifier (match as little as possible)",
    category: "quantifiers",
    insertAtCaret: "*?",
  },

  // Classes (7)
  {
    id: "class-any",
    token: ".",
    label: "Any character except newline",
    category: "classes",
    insertAtCaret: ".",
  },
  {
    id: "class-digit",
    token: "\\d",
    label: "Any digit (0-9)",
    category: "classes",
    insertAtCaret: "\\d",
  },
  {
    id: "class-non-digit",
    token: "\\D",
    label: "Any non-digit",
    category: "classes",
    insertAtCaret: "\\D",
  },
  {
    id: "class-word",
    token: "\\w",
    label: "Word character (A-Z, a-z, 0-9, _)",
    category: "classes",
    insertAtCaret: "\\w",
  },
  {
    id: "class-non-word",
    token: "\\W",
    label: "Non-word character",
    category: "classes",
    insertAtCaret: "\\W",
  },
  {
    id: "class-whitespace",
    token: "\\s",
    label: "Whitespace (space, tab, newline)",
    category: "classes",
    insertAtCaret: "\\s",
  },
  {
    id: "class-custom",
    token: "[abc]",
    label: "Custom character set",
    category: "classes",
    insertAtCaret: "[abc]",
  },

  // Groups (4)
  {
    id: "group-capture",
    token: "( )",
    label: "Capturing group",
    category: "groups",
    insertAtCaret: "()",
  },
  {
    id: "group-non-capture",
    token: "(?: )",
    label: "Non-capturing group",
    category: "groups",
    insertAtCaret: "(?:)",
  },
  {
    id: "group-named",
    token: "(?<name> )",
    label: "Named capturing group",
    category: "groups",
    insertAtCaret: "(?<name>)",
  },
  {
    id: "group-alternation",
    token: "|",
    label: "Alternation (OR)",
    category: "groups",
    insertAtCaret: "|",
  },

  // Lookaround (4)
  {
    id: "lookahead-positive",
    token: "(?= )",
    label: "Positive lookahead",
    category: "lookaround",
    insertAtCaret: "(?=)",
  },
  {
    id: "lookahead-negative",
    token: "(?! )",
    label: "Negative lookahead",
    category: "lookaround",
    insertAtCaret: "(?!)",
  },
  {
    id: "lookbehind-positive",
    token: "(?<= )",
    label: "Positive lookbehind",
    category: "lookaround",
    insertAtCaret: "(?<=)",
  },
  {
    id: "lookbehind-negative",
    token: "(?<! )",
    label: "Negative lookbehind",
    category: "lookaround",
    insertAtCaret: "(?<!)",
  },

  // Escapes (5)
  {
    id: "escape-tab",
    token: "\\t",
    label: "Tab character",
    category: "escapes",
    insertAtCaret: "\\t",
  },
  {
    id: "escape-newline",
    token: "\\n",
    label: "Newline (line feed)",
    category: "escapes",
    insertAtCaret: "\\n",
  },
  {
    id: "escape-carriage-return",
    token: "\\r",
    label: "Carriage return",
    category: "escapes",
    insertAtCaret: "\\r",
  },
  {
    id: "escape-literal-dot",
    token: "\\.",
    label: "Literal dot",
    category: "escapes",
    insertAtCaret: "\\.",
  },
  {
    id: "escape-unicode",
    token: "\\uFFFF",
    label: "Unicode code point (4 hex digits)",
    category: "escapes",
    insertAtCaret: "\\u0000",
  },
];
