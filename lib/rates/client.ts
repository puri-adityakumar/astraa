import { parseExchangeRate, isRateErrorCode } from "@/lib/rates/types";
import type { ExchangeRate, RateErrorCode, RateKind } from "@/lib/rates/types";

const RATE_CACHE_TTL_MS: Record<RateKind, number> = {
  fiat: 60 * 60 * 1_000,
  crypto: 60 * 1_000,
};
const MAX_RATE_CACHE_ENTRIES = 50;

export interface RateKey {
  kind: RateKind;
  base: string;
  quote: string;
}

interface CacheEntry {
  expiresAt: number;
  rate: ExchangeRate;
}

interface InFlightRequest {
  controller: AbortController;
  consumers: Set<symbol>;
  promise: Promise<ExchangeRate>;
  settled: boolean;
}

interface RateLoadOptions {
  force?: boolean;
  signal?: AbortSignal;
}

interface RateCacheOptions {
  maxEntries?: number;
  now?: () => number;
  ttlMs?: Record<RateKind, number>;
}

interface RateResourceOptions {
  cache?: BoundedRateCache;
  fetchImplementation?: typeof fetch;
}

export class RateRequestError extends Error {
  constructor(public readonly code: RateErrorCode) {
    super("Exchange rate request failed");
    this.name = "RateRequestError";
  }
}

export class BoundedRateCache {
  private readonly entries = new Map<string, CacheEntry>();
  private readonly maxEntries: number;
  private readonly now: () => number;
  private readonly ttlMs: Record<RateKind, number>;

  constructor(options: RateCacheOptions = {}) {
    this.maxEntries = options.maxEntries ?? MAX_RATE_CACHE_ENTRIES;
    this.now = options.now ?? Date.now;
    this.ttlMs = options.ttlMs ?? RATE_CACHE_TTL_MS;
  }

  get(key: RateKey): ExchangeRate | null {
    const serialized = serializeRateKey(key);
    const entry = this.entries.get(serialized);
    if (!entry) return null;

    if (entry.expiresAt <= this.now()) {
      this.entries.delete(serialized);
      return null;
    }

    this.entries.delete(serialized);
    this.entries.set(serialized, entry);
    return entry.rate;
  }

  set(key: RateKey, rate: ExchangeRate): void {
    const serialized = serializeRateKey(key);
    this.entries.delete(serialized);
    this.entries.set(serialized, {
      expiresAt: this.now() + this.ttlMs[key.kind],
      rate,
    });

    while (this.entries.size > this.maxEntries) {
      const oldestKey = this.entries.keys().next().value as string | undefined;
      if (oldestKey === undefined) break;
      this.entries.delete(oldestKey);
    }
  }

  invalidate(key: RateKey): void {
    this.entries.delete(serializeRateKey(key));
  }

  get size(): number {
    return this.entries.size;
  }
}

export class LatestRequestTracker {
  private currentRequest = 0;

  begin(): number {
    this.currentRequest += 1;
    return this.currentRequest;
  }

  isCurrent(requestId: number): boolean {
    return requestId === this.currentRequest;
  }

  cancel(requestId: number): void {
    if (this.isCurrent(requestId)) this.currentRequest += 1;
  }
}

export class ExchangeRateResource {
  private readonly cache: BoundedRateCache;
  private readonly fetchImplementation: typeof fetch;
  private readonly inFlight = new Map<string, InFlightRequest>();

  constructor(options: RateResourceOptions = {}) {
    this.cache = options.cache ?? new BoundedRateCache();
    this.fetchImplementation = options.fetchImplementation ?? fetch;
  }

  getCached(key: RateKey): ExchangeRate | null {
    return this.cache.get(key);
  }

  invalidate(key: RateKey): void {
    this.cache.invalidate(key);
  }

  load(key: RateKey, options: RateLoadOptions = {}): Promise<ExchangeRate> {
    if (options.force) {
      this.cache.invalidate(key);
    } else {
      const cached = this.cache.get(key);
      if (cached) return Promise.resolve(cached);
    }

    const serialized = serializeRateKey(key);
    const existing = this.inFlight.get(serialized);
    const request =
      existing && !existing.controller.signal.aborted
        ? existing
        : this.startRequest(serialized, key);
    return this.subscribe(request, options.signal);
  }

  get inFlightCount(): number {
    return this.inFlight.size;
  }

  private startRequest(serialized: string, key: RateKey): InFlightRequest {
    const controller = new AbortController();
    const request: InFlightRequest = {
      controller,
      consumers: new Set(),
      promise: Promise.resolve({} as ExchangeRate),
      settled: false,
    };

    request.promise = requestExchangeRate(key, controller.signal, this.fetchImplementation)
      .then((rate) => {
        this.cache.set(key, rate);
        return rate;
      })
      .finally(() => {
        request.settled = true;
        if (this.inFlight.get(serialized) === request) {
          this.inFlight.delete(serialized);
        }
      });

    this.inFlight.set(serialized, request);
    return request;
  }

  private subscribe(request: InFlightRequest, signal?: AbortSignal): Promise<ExchangeRate> {
    const consumer = Symbol("rate-consumer");
    request.consumers.add(consumer);

    return new Promise((resolve, reject) => {
      let finished = false;

      const release = (): void => {
        if (finished) return;
        finished = true;
        signal?.removeEventListener("abort", handleAbort);
        request.consumers.delete(consumer);
        if (!request.settled && request.consumers.size === 0) {
          queueMicrotask(() => {
            if (!request.settled && request.consumers.size === 0) {
              request.controller.abort();
            }
          });
        }
      };

      const handleAbort = (): void => {
        release();
        reject(new DOMException("The rate request was aborted", "AbortError"));
      };

      if (signal?.aborted) {
        handleAbort();
        return;
      }

      signal?.addEventListener("abort", handleAbort, { once: true });
      void request.promise.then(
        (rate) => {
          if (finished) return;
          release();
          resolve(rate);
        },
        (error: unknown) => {
          if (finished) return;
          release();
          reject(error);
        },
      );
    });
  }
}

export function serializeRateKey(key: RateKey): string {
  return `${key.kind}:${key.base}:${key.quote}`;
}

async function requestExchangeRate(
  key: RateKey,
  signal: AbortSignal,
  fetchImplementation: typeof fetch = fetch,
): Promise<ExchangeRate> {
  const params = new URLSearchParams({ base: key.base, quote: key.quote });
  const response = await fetchImplementation(`/api/rates/${key.kind}?${params.toString()}`, {
    headers: { Accept: "application/json" },
    signal,
  });
  const payload = await readJson(response);

  if (!response.ok) {
    throw new RateRequestError(readErrorCode(payload));
  }

  const rate = parseExchangeRate(payload);
  if (!rate || rate.base !== key.base || rate.quote !== key.quote) {
    throw new RateRequestError("UPSTREAM_UNAVAILABLE");
  }

  return rate;
}

const sharedRateResource = new ExchangeRateResource();

export function getCachedExchangeRate(key: RateKey): ExchangeRate | null {
  return sharedRateResource.getCached(key);
}

export function invalidateExchangeRate(key: RateKey): void {
  sharedRateResource.invalidate(key);
}

export function loadExchangeRate(
  key: RateKey,
  options: RateLoadOptions = {},
): Promise<ExchangeRate> {
  return sharedRateResource.load(key, options);
}

async function readJson(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

function readErrorCode(payload: unknown): RateErrorCode {
  if (typeof payload !== "object" || payload === null) return "UPSTREAM_UNAVAILABLE";
  const error = (payload as Record<string, unknown>).error;
  if (typeof error !== "object" || error === null) return "UPSTREAM_UNAVAILABLE";
  const code = (error as Record<string, unknown>).code;
  return isRateErrorCode(code) ? code : "UPSTREAM_UNAVAILABLE";
}
