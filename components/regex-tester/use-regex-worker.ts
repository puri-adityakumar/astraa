"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Task<T> = (signal: AbortSignal) => Promise<T>;

type WorkerState<T> = {
  value: T;
  error: string | null;
  pending: boolean;
  runNow: () => void;
};

export function useRegexWorker<T>(task: Task<T>, initialValue: T): WorkerState<T> {
  const [state, setState] = useState<{
    task: Task<T> | null;
    value: T;
    error: string | null;
  }>({ task: null, value: initialValue, error: null });
  const startRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    let started = false;
    const start = () => {
      if (started) return;
      started = true;
      clearTimeout(timer);
      void task(controller.signal).then(
        (value) => {
          if (!controller.signal.aborted) setState({ task, value, error: null });
        },
        (error: unknown) => {
          if (!controller.signal.aborted) {
            setState((previous) => ({
              task,
              value: previous.value,
              error: error instanceof Error ? error.message : String(error),
            }));
          }
        },
      );
    };
    const timer = setTimeout(start, 150);
    startRef.current = start;
    return () => {
      controller.abort();
      clearTimeout(timer);
      startRef.current = null;
    };
  }, [task]);

  const runNow = useCallback(() => startRef.current?.(), []);
  const pending = state.task !== task;
  return { value: state.value, error: pending ? null : state.error, pending, runNow };
}
