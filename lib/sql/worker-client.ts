import { preflightSql } from "@/lib/sql/preflight";
import {
  MAX_SQL_BYTES,
  SQL_LOAD_ERROR_MESSAGE,
  SQL_OVERSIZED_MESSAGE,
  SQL_UNEXPECTED_ERROR_MESSAGE,
} from "@/lib/sql/types";
import type { SqlFormatter } from "@/lib/sql/formatter";
import type { SqlFormatResult } from "@/lib/sql/types";
import type {
  SqlFormatterWorkerRequest,
  SqlFormatterWorkerResponse,
} from "@/lib/sql/worker-protocol";

const SQL_WORKER_TIMEOUT_MS = 15_000;
let nextRequestId = 1;

type SqlWorkerFactory = () => Worker;

export function createSqlWorkerFormatter(
  createWorker: SqlWorkerFactory,
  timeoutMs = SQL_WORKER_TIMEOUT_MS,
): SqlFormatter {
  return async (input, options) => {
    const preflight = preflightSql(input, options);
    if (preflight.kind === "rejected") return preflight.result;

    let worker: Worker;
    try {
      worker = createWorker();
    } catch {
      return createWorkerFailure(input, preflight.byteLength, "load-error");
    }

    const request: SqlFormatterWorkerRequest = {
      input,
      options: { ...options },
      requestId: nextRequestId,
    };
    nextRequestId += 1;

    return new Promise<SqlFormatResult>((resolve) => {
      let settled = false;
      let timeout: ReturnType<typeof setTimeout> | null = null;

      const finish = (result: SqlFormatResult): void => {
        if (settled) return;
        settled = true;
        if (timeout !== null) globalThis.clearTimeout(timeout);
        worker.onmessage = null;
        worker.onerror = null;
        worker.terminate();
        resolve(result);
      };

      worker.onmessage = (event: MessageEvent<unknown>) => {
        if (!isWorkerResponse(event.data, request, preflight.byteLength)) {
          finish(createWorkerFailure(input, preflight.byteLength, "unexpected-error"));
          return;
        }
        finish(event.data.result);
      };
      worker.onerror = (event: ErrorEvent) => {
        event.preventDefault();
        finish(createWorkerFailure(input, preflight.byteLength, "load-error"));
      };
      timeout = globalThis.setTimeout(() => {
        finish(createWorkerFailure(input, preflight.byteLength, "unexpected-error"));
      }, timeoutMs);

      try {
        worker.postMessage(request);
      } catch {
        finish(createWorkerFailure(input, preflight.byteLength, "unexpected-error"));
      }
    });
  };
}

function createProductionWorker(): Worker {
  return new Worker(new URL("./formatter.worker.ts", import.meta.url), { type: "module" });
}

export const formatSql = createSqlWorkerFormatter(createProductionWorker);

function createWorkerFailure(
  input: string,
  byteLength: number,
  status: "load-error" | "unexpected-error",
): Extract<SqlFormatResult, { status: "load-error" | "unexpected-error" }> {
  if (status === "load-error") {
    return {
      byteLength,
      input,
      message: SQL_LOAD_ERROR_MESSAGE,
      retryable: true,
      status,
    };
  }

  return {
    byteLength,
    input,
    message: SQL_UNEXPECTED_ERROR_MESSAGE,
    retryable: true,
    status,
  };
}

function isWorkerResponse(
  value: unknown,
  request: SqlFormatterWorkerRequest,
  expectedByteLength: number,
): value is SqlFormatterWorkerResponse {
  if (!isRecord(value) || value.requestId !== request.requestId || !isRecord(value.result)) {
    return false;
  }

  const result = value.result;
  if (result.input !== request.input || result.byteLength !== expectedByteLength) return false;

  switch (result.status) {
    case "success":
      return typeof result.output === "string";
    case "empty":
      return result.message === "Enter SQL to format.";
    case "oversized":
      return result.maxBytes === MAX_SQL_BYTES && result.message === SQL_OVERSIZED_MESSAGE;
    case "unsupported":
      return (
        typeof result.message === "string" &&
        ["dialect", "options", "syntax", "upstream-limitation"].includes(String(result.reason))
      );
    case "load-error":
      return result.message === SQL_LOAD_ERROR_MESSAGE && result.retryable === true;
    case "unexpected-error":
      return result.message === SQL_UNEXPECTED_ERROR_MESSAGE && result.retryable === true;
    default:
      return false;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
