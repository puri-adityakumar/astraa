import { afterEach, describe, expect, it, vi } from "vitest";

import { createSqlWorkerFormatter } from "@/lib/sql/worker-client";
import {
  DEFAULT_SQL_OPTIONS,
  MAX_SQL_BYTES,
  SQL_LOAD_ERROR_MESSAGE,
  SQL_UNEXPECTED_ERROR_MESSAGE,
} from "@/lib/sql/types";
import type { SqlFormatOptions } from "@/lib/sql/types";
import type {
  SqlFormatterWorkerRequest,
  SqlFormatterWorkerResponse,
} from "@/lib/sql/worker-protocol";

afterEach(() => {
  vi.useRealTimers();
});

describe("createSqlWorkerFormatter", () => {
  it.each([
    ["empty", "", DEFAULT_SQL_OPTIONS],
    ["whitespace", "  \n", DEFAULT_SQL_OPTIONS],
    ["oversized", "x".repeat(MAX_SQL_BYTES + 1), DEFAULT_SQL_OPTIONS],
    ["known limitation", "CREATE PROCEDURE hidden() SELECT 1;", DEFAULT_SQL_OPTIONS],
    [
      "unsupported options",
      "select 1",
      { ...DEFAULT_SQL_OPTIONS, dialect: "oracle" } as unknown as SqlFormatOptions,
    ],
  ])("rejects %s before creating or messaging a worker", async (_case, input, options) => {
    const createWorker = vi.fn<() => Worker>();
    const formatter = createSqlWorkerFormatter(createWorker);

    const result = await formatter(input, options);

    expect(result.status).not.toBe("success");
    expect(result.input).toBe(input);
    expect(createWorker).not.toHaveBeenCalled();
  });

  it("accepts a matching structured success response and terminates the worker", async () => {
    const worker = new ControlledWorker((request) => {
      const response: SqlFormatterWorkerResponse = {
        requestId: request.requestId,
        result: {
          byteLength: request.input.length,
          input: request.input,
          output: "SELECT 1;",
          status: "success",
        },
      };
      queueMicrotask(() => worker.emitMessage(response));
    });
    const formatter = createSqlWorkerFormatter(() => worker as unknown as Worker);

    await expect(formatter("select 1;", DEFAULT_SQL_OPTIONS)).resolves.toEqual({
      byteLength: 9,
      input: "select 1;",
      output: "SELECT 1;",
      status: "success",
    });
    expect(worker.postMessage).toHaveBeenCalledOnce();
    expect(worker.terminate).toHaveBeenCalledOnce();
    expect(worker.onmessage).toBeNull();
    expect(worker.onerror).toBeNull();
  });

  it("maps worker construction and loading failures without leaking details", async () => {
    const input = "select private_worker_value from secrets";
    const constructorFormatter = createSqlWorkerFormatter(() => {
      throw new Error(`failed to construct for ${input}`);
    });
    const loadingWorker = new ControlledWorker(() => {
      queueMicrotask(() => loadingWorker.emitError());
    });
    const loadingFormatter = createSqlWorkerFormatter(() => loadingWorker as unknown as Worker);

    const constructorResult = await constructorFormatter(input, DEFAULT_SQL_OPTIONS);
    const loadingResult = await loadingFormatter(input, DEFAULT_SQL_OPTIONS);

    for (const result of [constructorResult, loadingResult]) {
      expect(result).toMatchObject({
        input,
        message: SQL_LOAD_ERROR_MESSAGE,
        retryable: true,
        status: "load-error",
      });
      expect(JSON.stringify(result)).not.toContain("failed to construct");
    }
    expect(loadingWorker.preventDefault).toHaveBeenCalledOnce();
    expect(loadingWorker.terminate).toHaveBeenCalledOnce();
  });

  it("sanitizes malformed responses and postMessage failures, then cleans up", async () => {
    const input = "select private_response_value from secrets";
    const malformedWorker = new ControlledWorker((request) => {
      queueMicrotask(() =>
        malformedWorker.emitMessage({
          requestId: request.requestId,
          result: {
            byteLength: input.length + 1,
            input,
            output: "unsafe response",
            rawError: `parser exposed ${input}`,
            status: "success",
          },
        }),
      );
    });
    const postMessageWorker = new ControlledWorker(() => {
      throw new Error(`clone failed for ${input}`);
    });

    const malformedResult = await createSqlWorkerFormatter(
      () => malformedWorker as unknown as Worker,
    )(input, DEFAULT_SQL_OPTIONS);
    const postMessageResult = await createSqlWorkerFormatter(
      () => postMessageWorker as unknown as Worker,
    )(input, DEFAULT_SQL_OPTIONS);

    for (const result of [malformedResult, postMessageResult]) {
      expect(result).toEqual({
        byteLength: input.length,
        input,
        message: SQL_UNEXPECTED_ERROR_MESSAGE,
        retryable: true,
        status: "unexpected-error",
      });
      expect(JSON.stringify(result)).not.toContain("parser exposed");
      expect(JSON.stringify(result)).not.toContain("clone failed");
    }
    expect(malformedWorker.terminate).toHaveBeenCalledOnce();
    expect(postMessageWorker.terminate).toHaveBeenCalledOnce();
  });

  it("times out and terminates a hanging worker", async () => {
    vi.useFakeTimers();
    const worker = new ControlledWorker(() => undefined);
    const formatter = createSqlWorkerFormatter(() => worker as unknown as Worker, 50);

    const resultPromise = formatter("select 1;", DEFAULT_SQL_OPTIONS);
    await vi.advanceTimersByTimeAsync(50);

    await expect(resultPromise).resolves.toMatchObject({
      message: SQL_UNEXPECTED_ERROR_MESSAGE,
      retryable: true,
      status: "unexpected-error",
    });
    expect(worker.terminate).toHaveBeenCalledOnce();
  });

  it("uses a fresh worker after a retryable load failure", async () => {
    const failedWorker = new ControlledWorker(() => {
      queueMicrotask(() => failedWorker.emitError());
    });
    const successfulWorker = new ControlledWorker((request) => {
      queueMicrotask(() =>
        successfulWorker.emitMessage({
          requestId: request.requestId,
          result: {
            byteLength: request.input.length,
            input: request.input,
            output: "SELECT 1;",
            status: "success",
          },
        } satisfies SqlFormatterWorkerResponse),
      );
    });
    const workers = [failedWorker, successfulWorker];
    const createWorker = vi.fn(() => workers.shift() as unknown as Worker);
    const formatter = createSqlWorkerFormatter(createWorker);

    await expect(formatter("select 1;", DEFAULT_SQL_OPTIONS)).resolves.toMatchObject({
      status: "load-error",
    });
    await expect(formatter("select 1;", DEFAULT_SQL_OPTIONS)).resolves.toMatchObject({
      output: "SELECT 1;",
      status: "success",
    });
    expect(createWorker).toHaveBeenCalledTimes(2);
    expect(failedWorker.terminate).toHaveBeenCalledOnce();
    expect(successfulWorker.terminate).toHaveBeenCalledOnce();
  });
});

class ControlledWorker {
  onmessage: ((event: MessageEvent<unknown>) => void) | null = null;
  onerror: ((event: ErrorEvent) => void) | null = null;
  readonly postMessage = vi.fn((request: SqlFormatterWorkerRequest) => {
    this.handlePostMessage(request);
  });
  readonly preventDefault = vi.fn();
  readonly terminate = vi.fn();

  constructor(private readonly handlePostMessage: (request: SqlFormatterWorkerRequest) => void) {}

  emitError(): void {
    this.onerror?.({ preventDefault: this.preventDefault } as unknown as ErrorEvent);
  }

  emitMessage(data: unknown): void {
    this.onmessage?.({ data } as MessageEvent<unknown>);
  }
}
