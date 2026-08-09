export const MAX_SQL_BYTES = 100 * 1024;
export const SQL_SIZE_LABEL = "100 KB";

export const SQL_UPSTREAM_LIMITATION =
  "Stored procedures and custom delimiters other than ; are not supported by this formatter.";
export const SQL_PARSE_MESSAGE =
  "This SQL could not be formatted for the selected dialect. Check the syntax or choose a different dialect.";
export const SQL_LOAD_ERROR_MESSAGE =
  "The formatter could not be loaded. Check your connection and try again.";
export const SQL_UNEXPECTED_ERROR_MESSAGE =
  "The formatter could not complete this request. Try again.";
export const SQL_OVERSIZED_MESSAGE = `SQL must be ${SQL_SIZE_LABEL} or smaller.`;

type SqlDialectId = "basic" | "postgresql" | "mysql" | "sqlite" | "sql-server" | "bigquery";

type UpstreamSqlDialect = "sql" | "postgresql" | "mysql" | "sqlite" | "transactsql" | "bigquery";

export interface SqlDialectOption {
  id: SqlDialectId;
  label: string;
  upstreamId: UpstreamSqlDialect;
}

export const SQL_DIALECTS = [
  { id: "basic", label: "Basic SQL", upstreamId: "sql" },
  { id: "postgresql", label: "PostgreSQL", upstreamId: "postgresql" },
  { id: "mysql", label: "MySQL/MariaDB", upstreamId: "mysql" },
  { id: "sqlite", label: "SQLite", upstreamId: "sqlite" },
  { id: "sql-server", label: "SQL Server", upstreamId: "transactsql" },
  { id: "bigquery", label: "BigQuery", upstreamId: "bigquery" },
] as const satisfies readonly SqlDialectOption[];

export type SqlKeywordCase = "preserve" | "upper" | "lower";
export type SqlIndentSize = 2 | 4;

export interface SqlFormatOptions {
  dialect: SqlDialectId;
  keywordCase: SqlKeywordCase;
  indentSize: SqlIndentSize;
}

export const DEFAULT_SQL_OPTIONS: SqlFormatOptions = {
  dialect: "basic",
  keywordCase: "upper",
  indentSize: 2,
};

interface SqlFormatResultBase {
  byteLength: number;
  input: string;
}

interface SqlFormatSuccess extends SqlFormatResultBase {
  output: string;
  status: "success";
}

interface SqlFormatEmpty extends SqlFormatResultBase {
  message: "Enter SQL to format.";
  status: "empty";
}

interface SqlFormatOversized extends SqlFormatResultBase {
  maxBytes: typeof MAX_SQL_BYTES;
  message: typeof SQL_OVERSIZED_MESSAGE;
  status: "oversized";
}

interface SqlFormatUnsupported extends SqlFormatResultBase {
  message: string;
  reason: "dialect" | "options" | "syntax" | "upstream-limitation";
  status: "unsupported";
}

interface SqlFormatLoadError extends SqlFormatResultBase {
  message: typeof SQL_LOAD_ERROR_MESSAGE;
  retryable: true;
  status: "load-error";
}

interface SqlFormatUnexpectedError extends SqlFormatResultBase {
  message: typeof SQL_UNEXPECTED_ERROR_MESSAGE;
  retryable: true;
  status: "unexpected-error";
}

export type SqlFormatResult =
  | SqlFormatSuccess
  | SqlFormatEmpty
  | SqlFormatOversized
  | SqlFormatUnsupported
  | SqlFormatLoadError
  | SqlFormatUnexpectedError;
