import {
  MAX_SQL_BYTES,
  SQL_DIALECTS,
  SQL_OVERSIZED_MESSAGE,
  SQL_UPSTREAM_LIMITATION,
} from "@/lib/sql/types";
import type { SqlFormatOptions, SqlFormatResult } from "@/lib/sql/types";

const UTF8_ENCODER = new TextEncoder();
const KEYWORD_CASES = new Set(["preserve", "upper", "lower"]);
const INDENT_SIZES = new Set([2, 4]);

type SqlPreflightFailure = Extract<
  SqlFormatResult,
  { status: "empty" | "oversized" | "unsupported" }
>;

type SqlPreflightResult =
  | { byteLength: number; kind: "ready"; upstreamId: (typeof SQL_DIALECTS)[number]["upstreamId"] }
  | { kind: "rejected"; result: SqlPreflightFailure };

export function preflightSql(
  input: string,
  options: Readonly<SqlFormatOptions>,
): SqlPreflightResult {
  const byteLength = UTF8_ENCODER.encode(input).byteLength;
  const baseResult = { byteLength, input };

  if (input.trim() === "") {
    return {
      kind: "rejected",
      result: { ...baseResult, message: "Enter SQL to format.", status: "empty" },
    };
  }

  if (byteLength > MAX_SQL_BYTES) {
    return {
      kind: "rejected",
      result: {
        ...baseResult,
        maxBytes: MAX_SQL_BYTES,
        message: SQL_OVERSIZED_MESSAGE,
        status: "oversized",
      },
    };
  }

  const dialect = SQL_DIALECTS.find((candidate) => candidate.id === options.dialect);
  if (!dialect) {
    return {
      kind: "rejected",
      result: {
        ...baseResult,
        message: "Choose one of the six supported SQL dialects.",
        reason: "dialect",
        status: "unsupported",
      },
    };
  }

  if (hasKnownUpstreamLimitation(input, dialect.id)) {
    return {
      kind: "rejected",
      result: {
        ...baseResult,
        message: SQL_UPSTREAM_LIMITATION,
        reason: "upstream-limitation",
        status: "unsupported",
      },
    };
  }

  if (!KEYWORD_CASES.has(options.keywordCase) || !INDENT_SIZES.has(options.indentSize)) {
    return {
      kind: "rejected",
      result: {
        ...baseResult,
        message: "Choose a supported keyword case and indentation size.",
        reason: "options",
        status: "unsupported",
      },
    };
  }

  return { byteLength, kind: "ready", upstreamId: dialect.upstreamId };
}

type SqlDialectId = (typeof SQL_DIALECTS)[number]["id"];

function hasKnownUpstreamLimitation(input: string, dialect: SqlDialectId): boolean {
  if (!/\b(?:DELIMITER|PROC(?:EDURE)?)\b/i.test(input)) return false;

  const searchableSql = maskQuotedContentAndComments(input, dialect);
  const delimiterDirectives = searchableSql.matchAll(/^[\t ]*DELIMITER[\t ]+(\S+)/gim);
  const changesDelimiter = Array.from(delimiterDirectives).some((match) => match[1] !== ";");
  const storedProcedure = new RegExp(
    String.raw`(?:^|;)[\t \r\n]*(?:CREATE(?:[\t \r\n]+OR[\t \r\n]+(?:ALTER|REPLACE))?(?:[\t \r\n]+DEFINER[\t \r\n]*=[^;\r\n]*?)?|ALTER)[\t \r\n]+(?:PROCEDURE|PROC)\b`,
    dialect === "sql-server" ? "i" : "im",
  );
  const sqlServerBatchProcedure =
    dialect === "sql-server" &&
    /^[\t ]*GO[\t ]*(?:\r?\n|$)[\t \r\n]*(?:CREATE(?:[\t \r\n]+OR[\t \r\n]+ALTER)?|ALTER)[\t \r\n]+(?:PROCEDURE|PROC)\b/im.test(
      searchableSql,
    );

  return changesDelimiter || storedProcedure.test(searchableSql) || sqlServerBatchProcedure;
}

type MaskState =
  | "bigquery-string"
  | "block-comment"
  | "bracket"
  | "dollar-quote"
  | "double-quote"
  | "line-comment"
  | "plain"
  | "single-quote"
  | "backtick";

function maskQuotedContentAndComments(input: string, dialect: SqlDialectId): string {
  let masked = "";
  let state: MaskState = "plain";
  let blockCommentDepth = 0;
  let bigQueryStringDelimiter = "";
  let bigQueryStringUsesBackslashEscapes = false;
  let dollarQuoteDelimiter = "";
  let quotedContentAllowsDoubledDelimiter = true;
  let quotedContentUsesBackslashEscapes = false;
  const supportsHashComments = dialect === "mysql" || dialect === "bigquery";
  const supportsNestedBlockComments = dialect === "postgresql" || dialect === "sql-server";

  for (let index = 0; index < input.length; index += 1) {
    const character = input[index] ?? "";
    const next = input[index + 1] ?? "";

    if (state === "plain") {
      const bigQueryString = dialect === "bigquery" ? getBigQueryStringOpening(input, index) : null;
      if (bigQueryString) {
        masked += " ".repeat(bigQueryString.openingLength);
        bigQueryStringDelimiter = bigQueryString.delimiter;
        bigQueryStringUsesBackslashEscapes = bigQueryString.usesBackslashEscapes;
        state = "bigquery-string";
        index += bigQueryString.openingLength - 1;
      } else if (character === "-" && next === "-") {
        masked += "  ";
        state = "line-comment";
        index += 1;
      } else if (character === "/" && next === "*") {
        masked += "  ";
        state = "block-comment";
        blockCommentDepth = 1;
        index += 1;
      } else if (character === "#" && supportsHashComments) {
        masked += " ";
        state = "line-comment";
      } else if (character === "$" && dialect === "postgresql") {
        const delimiter = getDollarQuoteDelimiter(input, index);
        if (delimiter === null) {
          masked += character;
          continue;
        }
        masked += " ".repeat(delimiter.length);
        dollarQuoteDelimiter = delimiter;
        state = "dollar-quote";
        index += delimiter.length - 1;
      } else if (character === "'") {
        masked += " ";
        state = "single-quote";
        ({
          allowsDoubledDelimiter: quotedContentAllowsDoubledDelimiter,
          usesBackslashEscapes: quotedContentUsesBackslashEscapes,
        } = getQuotedContentRules(input, index, dialect, state));
      } else if (character === '"') {
        masked += " ";
        state = "double-quote";
        ({
          allowsDoubledDelimiter: quotedContentAllowsDoubledDelimiter,
          usesBackslashEscapes: quotedContentUsesBackslashEscapes,
        } = getQuotedContentRules(input, index, dialect, state));
      } else if (character === "`") {
        masked += " ";
        state = "backtick";
        quotedContentAllowsDoubledDelimiter = true;
        quotedContentUsesBackslashEscapes = false;
      } else if (character === "[") {
        masked += " ";
        state = "bracket";
        quotedContentAllowsDoubledDelimiter = true;
        quotedContentUsesBackslashEscapes = false;
      } else {
        masked += character;
      }
      continue;
    }

    if (state === "bigquery-string") {
      if (input.startsWith(bigQueryStringDelimiter, index)) {
        masked += " ".repeat(bigQueryStringDelimiter.length);
        index += bigQueryStringDelimiter.length - 1;
        bigQueryStringDelimiter = "";
        bigQueryStringUsesBackslashEscapes = false;
        state = "plain";
      } else if (bigQueryStringUsesBackslashEscapes && character === "\\" && next !== "") {
        masked += "  ";
        index += 1;
      } else {
        masked += character === "\n" ? "\n" : " ";
      }
      continue;
    }

    if (state === "dollar-quote") {
      if (input.startsWith(dollarQuoteDelimiter, index)) {
        masked += " ".repeat(dollarQuoteDelimiter.length);
        index += dollarQuoteDelimiter.length - 1;
        dollarQuoteDelimiter = "";
        state = "plain";
      } else {
        masked += character === "\n" ? "\n" : " ";
      }
      continue;
    }

    if (state === "line-comment") {
      if (character === "\n") {
        masked += "\n";
        state = "plain";
      } else {
        masked += " ";
      }
      continue;
    }

    if (state === "block-comment") {
      if (supportsNestedBlockComments && character === "/" && next === "*") {
        masked += "  ";
        blockCommentDepth += 1;
        index += 1;
      } else if (character === "*" && next === "/") {
        masked += "  ";
        blockCommentDepth -= 1;
        if (blockCommentDepth === 0) state = "plain";
        index += 1;
      } else {
        masked += character === "\n" ? "\n" : " ";
      }
      continue;
    }

    const closingCharacter = getClosingCharacter(state);
    if (character === "\\" && quotedContentUsesBackslashEscapes && next !== "") {
      masked += "  ";
      index += 1;
    } else if (
      character === closingCharacter &&
      next === closingCharacter &&
      quotedContentAllowsDoubledDelimiter
    ) {
      masked += "  ";
      index += 1;
    } else if (character === closingCharacter) {
      masked += " ";
      quotedContentAllowsDoubledDelimiter = true;
      quotedContentUsesBackslashEscapes = false;
      state = "plain";
    } else {
      masked += character === "\n" ? "\n" : " ";
    }
  }

  return masked;
}

function getClosingCharacter(
  state: Exclude<
    MaskState,
    "bigquery-string" | "block-comment" | "dollar-quote" | "line-comment" | "plain"
  >,
) {
  switch (state) {
    case "single-quote":
      return "'";
    case "double-quote":
      return '"';
    case "backtick":
      return "`";
    case "bracket":
      return "]";
  }
}

function getDollarQuoteDelimiter(input: string, index: number): string | null {
  return input.slice(index).match(/^\$(?:[A-Za-z_][A-Za-z0-9_]*)?\$/)?.[0] ?? null;
}

function getBigQueryStringOpening(
  input: string,
  index: number,
): {
  delimiter: "'" | "'''" | '"' | '"""';
  openingLength: number;
  usesBackslashEscapes: boolean;
} | null {
  const match = input.slice(index).match(/^(?:(RB|BR|R|B))?("""|'''|"|')/i);
  if (!match) return null;

  const prefix = match[1] ?? "";
  const delimiter = match[2] as "'" | "'''" | '"' | '"""';
  return {
    delimiter,
    openingLength: prefix.length + delimiter.length,
    usesBackslashEscapes: delimiter.length === 3 || prefix === "",
  };
}

function getQuotedContentRules(
  input: string,
  quoteIndex: number,
  dialect: SqlDialectId,
  state: "double-quote" | "single-quote",
): { allowsDoubledDelimiter: boolean; usesBackslashEscapes: boolean } {
  if (state === "double-quote") {
    return {
      allowsDoubledDelimiter: true,
      usesBackslashEscapes: dialect === "mysql",
    };
  }

  const hasRawPrefix =
    ((dialect === "basic" || dialect === "mysql" || dialect === "postgresql") &&
      (hasQuotePrefix(input, quoteIndex, "B") || hasQuotePrefix(input, quoteIndex, "X"))) ||
    (dialect === "sqlite" && hasQuotePrefix(input, quoteIndex, "X"));
  if (hasRawPrefix) {
    return { allowsDoubledDelimiter: false, usesBackslashEscapes: false };
  }

  return {
    allowsDoubledDelimiter: true,
    usesBackslashEscapes:
      dialect === "basic" ||
      dialect === "mysql" ||
      (dialect === "postgresql" && hasQuotePrefix(input, quoteIndex, "E")),
  };
}

function hasQuotePrefix(input: string, quoteIndex: number, prefix: string): boolean {
  const prefixStart = quoteIndex - prefix.length;
  if (prefixStart < 0 || input.slice(prefixStart, quoteIndex).toUpperCase() !== prefix)
    return false;
  const beforePrefix = input[prefixStart - 1];
  return beforePrefix === undefined || !/[A-Za-z0-9_]/.test(beforePrefix);
}
