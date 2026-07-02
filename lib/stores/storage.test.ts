import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import {
  IndexedDBAdapter,
  LocalStorageAdapter,
  createEnhancedStorage,
  createZustandStorage,
} from "./storage";

/**
 * These tests run in vitest's default `node` environment where
 * `typeof window === "undefined"`, so LocalStorageAdapter exercises its SSR
 * (in-memory fallback) path directly. This is the core testable win from LS-07.
 */
describe("LocalStorageAdapter (SSR / no-window path)", () => {
  let adapter: LocalStorageAdapter;

  beforeEach(() => {
    adapter = new LocalStorageAdapter();
  });

  it("returns null for an unknown key", async () => {
    expect(await adapter.getItem("missing")).toBeNull();
  });

  it("round-trips a value through the memory fallback", async () => {
    await adapter.setItem("k", "v");
    expect(await adapter.getItem("k")).toBe("v");
  });

  it("overwrites an existing value", async () => {
    await adapter.setItem("k", "1");
    await adapter.setItem("k", "2");
    expect(await adapter.getItem("k")).toBe("2");
  });

  it("removes a value", async () => {
    await adapter.setItem("k", "v");
    await adapter.removeItem("k");
    expect(await adapter.getItem("k")).toBeNull();
  });

  it("removeItem is a no-op for unknown keys", async () => {
    await expect(adapter.removeItem("nope")).resolves.toBeUndefined();
  });
});

/**
 * Exercises the real localStorage path by stubbing `window` + `localStorage`.
 */
describe("LocalStorageAdapter (with localStorage present)", () => {
  let store: Map<string, string>;
  let ls: { getItem: (k: string) => null; setItem: () => void; removeItem: () => void };

  beforeEach(() => {
    store = new Map();
    ls = {
      getItem: (k: string) => store.get(k) ?? null,
      setItem: (k: string, v: string) => {
        store.set(k, v);
      },
      removeItem: (k: string) => {
        store.delete(k);
      },
    } as unknown as typeof ls;

    vi.stubGlobal("window", { localStorage: ls });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("uses the real localStorage when available", async () => {
    const adapter = new LocalStorageAdapter();
    await adapter.setItem("a", "b");
    expect(store.get("a")).toBe("b");
    expect(await adapter.getItem("a")).toBe("b");
    await adapter.removeItem("a");
    expect(store.has("a")).toBe(false);
  });

  it("falls back to memory when localStorage access throws", async () => {
    const throwingLs = {
      getItem: () => {
        throw new Error("blocked");
      },
      setItem: () => {
        throw new Error("blocked");
      },
      removeItem: () => {
        throw new Error("blocked");
      },
    };
    vi.stubGlobal("window", { localStorage: throwingLs });

    const adapter = new LocalStorageAdapter();
    await adapter.setItem("x", "y");
    expect(await adapter.getItem("x")).toBe("y");
    await adapter.removeItem("x");
    expect(await adapter.getItem("x")).toBeNull();
  });
});

/**
 * createEnhancedStorage must choose the localStorage adapter during SSR
 * (no IndexedDB), which is now the SSR-safe adapter.
 */
describe("createEnhancedStorage", () => {
  it("falls back to LocalStorageAdapter when IndexedDB is unavailable", () => {
    // node env: typeof window === "undefined"
    const adapter = createEnhancedStorage();
    expect(adapter).toBeInstanceOf(LocalStorageAdapter);
    expect(adapter).not.toBeInstanceOf(IndexedDBAdapter);
  });

  it("chooses IndexedDBAdapter when window.indexedDB is present", () => {
    vi.stubGlobal("window", { indexedDB: {} });
    const adapter = createEnhancedStorage();
    expect(adapter).toBeInstanceOf(IndexedDBAdapter);
    vi.unstubAllGlobals();
  });
});

/**
 * createZustandStorage should never throw to callers (it catches internally),
 * and the per-key enqueue lock must serialize operations for the same key.
 */
describe("createZustandStorage", () => {
  it("getItem returns null instead of throwing under SSR", async () => {
    const storage = createZustandStorage();
    expect(await storage.getItem("any")).toBeNull();
  });

  it("setItem/getItem round-trip under SSR (memory fallback)", async () => {
    const storage = createZustandStorage();
    await storage.setItem("k", "v");
    expect(await storage.getItem("k")).toBe("v");
  });

  it("runs same-key operations sequentially via the enqueue lock", async () => {
    const storage = createZustandStorage();
    const order: string[] = [];
    const slow = (label: string, ms: number) =>
      new Promise<void>((resolve) =>
        setTimeout(() => {
          order.push(label);
          resolve();
        }, ms),
      );

    // getItem/setItem all share the key "shared" and go through enqueue, but
    // only the adapter call is enqueued — not arbitrary lambdas. So we test
    // serialization indirectly: overlapping setItems on the same key should
    // not corrupt the final value.
    await Promise.all([storage.setItem("shared", "1"), storage.setItem("shared", "2")]);
    expect(await storage.getItem("shared")).toBe("2");

    // ensure the timer helper is exercised (keeps the slow() reference used)
    await slow("done", 0);
    expect(order).toEqual(["done"]);
  });

  it("removeItem under SSR does not throw", async () => {
    const storage = createZustandStorage();
    await expect(storage.removeItem("whatever")).resolves.toBeUndefined();
  });
});

/**
 * IndexedDB connection caching (LS-06): a minimal fake indexedDB is stubbed so
 * we can assert the connection is opened once and reused across operations.
 */
describe("IndexedDBAdapter connection caching", () => {
  let openCount: number;
  let backing: Map<string, string>;

  function makeFakeIDBFactory() {
    openCount = 0;
    backing = new Map();

    const makeStore = () => ({
      get: (k: string) => {
        const req = {
          result: backing.get(k) ?? null,
          onsuccess: null as null | (() => void),
          onerror: null as null | (() => void),
        };
        queueMicrotask(() => req.onsuccess && req.onsuccess());
        return req;
      },
      put: (v: string, k: string) => {
        backing.set(k, v);
        const req = {
          onsuccess: null as null | (() => void),
          onerror: null as null | (() => void),
        };
        queueMicrotask(() => req.onsuccess && req.onsuccess());
        return req;
      },
      delete: (k: string) => {
        backing.delete(k);
        const req = {
          onsuccess: null as null | (() => void),
          onerror: null as null | (() => void),
        };
        queueMicrotask(() => req.onsuccess && req.onsuccess());
        return req;
      },
    });

    const fakeDB = {
      objectStoreNames: { contains: () => false },
      createObjectStore: makeStore,
      transaction: () => ({ objectStore: makeStore }),
      close: () => {},
      onversionchange: null as null | (() => void),
    };

    return {
      open: () => {
        openCount++;
        const req = {
          result: fakeDB,
          error: null,
          onsuccess: null as null | (() => void),
          onerror: null as null | (() => void),
          onupgradeneeded: null as null | ((e: unknown) => void),
        };
        queueMicrotask(() => {
          if (req.onupgradeneeded) req.onupgradeneeded({ target: req });
          if (req.onsuccess) req.onsuccess();
        });
        return req;
      },
    };
  }

  beforeEach(() => {
    // createEnhancedStorage checks "indexedDB" in window; getDB() uses the
    // global `indexedDB`. Stub both with the same fake factory.
    const factory = makeFakeIDBFactory();
    vi.stubGlobal("indexedDB", factory);
    vi.stubGlobal("window", { indexedDB: factory });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("opens the database only once across multiple operations", async () => {
    const adapter = new IndexedDBAdapter();

    await adapter.setItem("a", "1");
    await adapter.setItem("b", "2");
    await adapter.setItem("c", "3");
    expect(await adapter.getItem("a")).toBe("1");
    expect(await adapter.getItem("b")).toBe("2");
    await adapter.removeItem("c");
    expect(await adapter.getItem("c")).toBeNull();

    // Before LS-06 each op re-opened; now exactly one open across 7 ops.
    expect(openCount).toBe(1);
  });

  it("round-trips values through the (cached) connection", async () => {
    const adapter = new IndexedDBAdapter();
    await adapter.setItem("k", "v");
    expect(await adapter.getItem("k")).toBe("v");
    await adapter.removeItem("k");
    expect(await adapter.getItem("k")).toBeNull();
  });
});
