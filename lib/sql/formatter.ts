import {
  SQL_LOAD_ERROR_MESSAGE,
  SQL_PARSE_MESSAGE,
  SQL_UNEXPECTED_ERROR_MESSAGE,
} from "@/lib/sql/types";
import { preflightSql } from "@/lib/sql/preflight";
import type { SqlFormatOptions, SqlFormatResult } from "@/lib/sql/types";

export interface SqlFormatterModule {
  format: typeof import("sql-formatter").format;
}

export type SqlFormatterLoader = () => Promise<SqlFormatterModule>;
export type SqlFormatter = (
  input: string,
  options: Readonly<SqlFormatOptions>,
) => Promise<SqlFormatResult>;

export function createSqlFormatter(loadFormatter: SqlFormatterLoader): SqlFormatter {
  return async (input, options) => {
    const preflight = preflightSql(input, options);
    if (preflight.kind === "rejected") return preflight.result;
    const baseResult = { byteLength: preflight.byteLength, input };

    let formatterModule: SqlFormatterModule;
    try {
      formatterModule = await loadFormatter();
    } catch {
      return {
        ...baseResult,
        message: SQL_LOAD_ERROR_MESSAGE,
        retryable: true,
        status: "load-error",
      };
    }

    try {
      const output = formatterModule.format(input, {
        keywordCase: options.keywordCase,
        language: preflight.upstreamId,
        tabWidth: options.indentSize,
        useTabs: false,
      });
      return { ...baseResult, output, status: "success" };
    } catch (error) {
      if (isUpstreamParseError(error)) {
        return {
          ...baseResult,
          message: SQL_PARSE_MESSAGE,
          reason: "syntax",
          status: "unsupported",
        };
      }

      return {
        ...baseResult,
        message: SQL_UNEXPECTED_ERROR_MESSAGE,
        retryable: true,
        status: "unexpected-error",
      };
    }
  };
}

function isUpstreamParseError(error: unknown): boolean {
  return error instanceof Error && error.message.startsWith("Parse error");
}
