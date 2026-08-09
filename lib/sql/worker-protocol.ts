import type { SqlFormatOptions, SqlFormatResult } from "@/lib/sql/types";

export interface SqlFormatterWorkerRequest {
  input: string;
  options: SqlFormatOptions;
  requestId: number;
}

export interface SqlFormatterWorkerResponse {
  requestId: number;
  result: SqlFormatResult;
}
