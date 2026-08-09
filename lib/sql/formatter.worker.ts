/// <reference lib="webworker" />

import { createSqlFormatter } from "@/lib/sql/formatter";
import { SQL_UNEXPECTED_ERROR_MESSAGE } from "@/lib/sql/types";
import type { SqlFormatOptions, SqlFormatResult } from "@/lib/sql/types";
import type {
  SqlFormatterWorkerRequest,
  SqlFormatterWorkerResponse,
} from "@/lib/sql/worker-protocol";

const formatInWorker = createSqlFormatter(() => import("sql-formatter"));
const UTF8_ENCODER = new TextEncoder();

self.addEventListener("message", async (event: MessageEvent<unknown>) => {
  const request = event.data;
  if (!isWorkerRequest(request)) return;

  let result: SqlFormatResult;
  try {
    result = await formatInWorker(request.input, request.options);
  } catch {
    result = {
      byteLength: UTF8_ENCODER.encode(request.input).byteLength,
      input: request.input,
      message: SQL_UNEXPECTED_ERROR_MESSAGE,
      retryable: true,
      status: "unexpected-error",
    };
  }

  const response: SqlFormatterWorkerResponse = { requestId: request.requestId, result };
  self.postMessage(response);
});

function isWorkerRequest(value: unknown): value is SqlFormatterWorkerRequest {
  if (!isRecord(value) || !isRecord(value.options)) return false;
  const options = value.options as Partial<SqlFormatOptions>;

  return (
    Number.isSafeInteger(value.requestId) &&
    typeof value.input === "string" &&
    typeof options.dialect === "string" &&
    typeof options.keywordCase === "string" &&
    typeof options.indentSize === "number"
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export {};
