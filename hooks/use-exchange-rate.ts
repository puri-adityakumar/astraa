"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  getCachedExchangeRate,
  invalidateExchangeRate,
  LatestRequestTracker,
  loadExchangeRate,
  RateRequestError,
  serializeRateKey,
} from "@/lib/rates/client";
import type { RateKey } from "@/lib/rates/client";
import type { RateErrorCode, RateKind } from "@/lib/rates/types";

type ExchangeRateStatus = "error" | "loading" | "ready" | "refreshing";

export interface UseExchangeRateResult {
  rate: number | null;
  asOf: string | null;
  status: ExchangeRateStatus;
  errorCode: RateErrorCode | null;
  refresh: () => void;
}

interface ExchangeRateState extends Omit<UseExchangeRateResult, "refresh"> {
  key: string;
}

export function useExchangeRate(
  kind: RateKind,
  base: string,
  quote: string,
): UseExchangeRateResult {
  const key = useMemo<RateKey>(() => ({ kind, base, quote }), [kind, base, quote]);
  const serializedKey = serializeRateKey(key);
  const trackerRef = useRef(new LatestRequestTracker());
  const [refreshVersion, setRefreshVersion] = useState(0);
  const [state, setState] = useState<ExchangeRateState>(() => {
    const cached = getCachedExchangeRate(key);
    return {
      asOf: cached?.asOf ?? null,
      errorCode: null,
      key: serializedKey,
      rate: cached?.rate ?? null,
      status: cached ? "ready" : "loading",
    };
  });

  useEffect(() => {
    const tracker = trackerRef.current;
    const requestId = tracker.begin();
    const controller = new AbortController();

    void loadExchangeRate(key, { signal: controller.signal }).then(
      (rate) => {
        if (!tracker.isCurrent(requestId)) return;
        setState({
          asOf: rate.asOf,
          errorCode: null,
          key: serializedKey,
          rate: rate.rate,
          status: "ready",
        });
      },
      (error: unknown) => {
        if (!tracker.isCurrent(requestId) || isAbortError(error)) return;
        setState((previous) => ({
          asOf: previous.key === serializedKey ? previous.asOf : null,
          errorCode: error instanceof RateRequestError ? error.code : "UPSTREAM_UNAVAILABLE",
          key: serializedKey,
          rate: previous.key === serializedKey ? previous.rate : null,
          status: "error",
        }));
      },
    );

    return () => {
      tracker.cancel(requestId);
      controller.abort();
    };
  }, [key, refreshVersion, serializedKey]);

  const refresh = useCallback(() => {
    setState((previous) => {
      if (previous.key !== serializedKey) return previous;
      return {
        ...previous,
        errorCode: null,
        status: previous.rate === null ? "loading" : "refreshing",
      };
    });
    invalidateExchangeRate(key);
    setRefreshVersion((version) => version + 1);
  }, [key, serializedKey]);

  return {
    asOf: state.key === serializedKey ? state.asOf : null,
    errorCode: state.key === serializedKey ? state.errorCode : null,
    rate: state.key === serializedKey ? state.rate : null,
    refresh,
    status: state.key === serializedKey ? state.status : "loading",
  };
}

function isAbortError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "name" in error &&
    (error as { name?: unknown }).name === "AbortError"
  );
}
