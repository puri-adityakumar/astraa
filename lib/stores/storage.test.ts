import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createEnhancedStorage, createZustandStorage } from "./storage";

type Handler = (() => void) | null;

function mockIndexedDB() {
  const data = new Map<string, string>();
  const fallbackData = new Map<string, string>();
  const localStorage = {
    getItem: vi.fn((key: string) => fallbackData.get(key) ?? null),
    setItem: vi.fn((key: string, value: string) => { fallbackData.set(key, value); }),
    removeItem: vi.fn((key: string) => { fallbackData.delete(key); }),
  };
  const controls = {
    failOpen: false,
    failRead: false,
    writeFailure: null as "error" | "abort" | null,
    autoComplete: true,
  };
  const pendingWrites: Array<() => void> = [];
  const database = {
    onversionchange: null as Handler,
    close: vi.fn(),
    transaction: vi.fn(() => {
      const transaction = {
        error: new Error("Transaction failed"),
        oncomplete: null as Handler,
        onerror: null as Handler,
        onabort: null as Handler,
        objectStore: () => ({
          get: (key: string) => {
            const request = {
              result: data.get(key) ?? null,
              error: new Error("Read failed"),
              onsuccess: null as Handler,
              onerror: null as Handler,
            };
            queueMicrotask(() => {
              if (controls.failRead) request.onerror?.();
              else request.onsuccess?.();
            });
            return request;
          },
          put: (value: string, key: string) => write(() => { data.set(key, value); }),
          delete: (key: string) => write(() => { data.delete(key); }),
        }),
      };
      const write = (commit: () => void) => {
        const request = { onsuccess: null as Handler, onerror: null as Handler };
        queueMicrotask(() => {
          request.onsuccess?.();
          const complete = () => {
            if (controls.writeFailure === "error") transaction.onerror?.();
            else if (controls.writeFailure === "abort") transaction.onabort?.();
            else {
              commit();
              transaction.oncomplete?.();
            }
          };
          if (controls.autoComplete) queueMicrotask(complete);
          else pendingWrites.push(complete);
        });
        return request;
      };
      return transaction;
    }),
  };
  const indexedDB = {
    open: vi.fn(() => {
      const request = {
        result: database,
        error: new Error("Open failed"),
        onsuccess: null as Handler,
        onerror: null as Handler,
      };
      queueMicrotask(() => {
        if (controls.failOpen) request.onerror?.();
        else request.onsuccess?.();
      });
      return request;
    }),
  };
  vi.stubGlobal("window", { indexedDB });
  vi.stubGlobal("indexedDB", indexedDB);
  vi.stubGlobal("localStorage", localStorage);
  return { data, fallbackData, localStorage, controls, pendingWrites, database, indexedDB };
}

beforeEach(() => {
  vi.spyOn(console, "warn").mockImplementation(() => {});
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("enhanced storage", () => {
  it("does not access browser storage or log errors on the server", async () => {
    vi.stubGlobal("window", undefined);
    const getItem = vi.fn(() => { throw new Error("Must not access localStorage"); });
    vi.stubGlobal("localStorage", { getItem });
    const storage = createZustandStorage();
    expect(await storage.getItem("key")).toBeNull();
    await storage.setItem("key", "value");
    await storage.removeItem("key");
    expect(getItem).not.toHaveBeenCalled();
    expect(console.error).not.toHaveBeenCalled();
  });

  it.each([undefined, null, {}])("tolerates unavailable localStorage: %s", async (value) => {
    vi.stubGlobal("window", {});
    vi.stubGlobal("localStorage", value);
    const storage = createEnhancedStorage();
    expect(await storage.getItem("key")).toBeNull();
    await storage.setItem("key", "value");
    await storage.removeItem("key");
    expect(console.error).not.toHaveBeenCalled();
  });

  it("uses localStorage when IndexedDB is unavailable", async () => {
    const { localStorage, fallbackData } = mockIndexedDB();
    vi.stubGlobal("window", {});
    const storage = createEnhancedStorage();
    await storage.setItem("key", "value");
    expect(fallbackData.get("key")).toBe("value");
    expect(await storage.getItem("key")).toBe("value");
    await storage.removeItem("key");
    expect(localStorage.removeItem).toHaveBeenCalledWith("key");
  });

  it("falls back after an asynchronous read request error", async () => {
    const { controls, fallbackData } = mockIndexedDB();
    controls.failRead = true;
    fallbackData.set("key", "fallback");
    expect(await createEnhancedStorage().getItem("key")).toBe("fallback");
  });

  it.each(["error", "abort"] as const)(
    "falls back after a write transaction %s",
    async (failure) => {
      const { controls, localStorage } = mockIndexedDB();
      controls.writeFailure = failure;
      const storage = createEnhancedStorage();
      await storage.setItem("key", "value");
      expect(localStorage.setItem).toHaveBeenCalledWith("key", "value");
      await storage.removeItem("key");
      expect(localStorage.removeItem).toHaveBeenCalledWith("key");
    },
  );

  it("waits for transaction completion rather than request success for writes", async () => {
    const { controls, pendingWrites, data } = mockIndexedDB();
    controls.autoComplete = false;
    const storage = createEnhancedStorage();
    let settled = false;
    const set = storage.setItem("key", "value").then(() => { settled = true; });
    await vi.waitFor(() => expect(pendingWrites).toHaveLength(1));
    expect(settled).toBe(false);
    pendingWrites.shift()?.();
    await set;
    expect(data.get("key")).toBe("value");

    settled = false;
    const remove = storage.removeItem("key").then(() => { settled = true; });
    await vi.waitFor(() => expect(pendingWrites).toHaveLength(1));
    expect(settled).toBe(false);
    pendingWrites.shift()?.();
    await remove;
    expect(data.has("key")).toBe(false);
  });

  it("shares one open promise across concurrent operations", async () => {
    const { indexedDB } = mockIndexedDB();
    const storage = createEnhancedStorage();
    await Promise.all([storage.getItem("one"), storage.getItem("two")]);
    await storage.setItem("key", "value");
    await storage.removeItem("key");
    expect(indexedDB.open).toHaveBeenCalledTimes(1);
  });

  it("retries opening after an open failure", async () => {
    const { controls, indexedDB, data } = mockIndexedDB();
    controls.failOpen = true;
    const storage = createEnhancedStorage();
    expect(await storage.getItem("key")).toBeNull();
    controls.failOpen = false;
    data.set("key", "recovered");
    expect(await storage.getItem("key")).toBe("recovered");
    expect(indexedDB.open).toHaveBeenCalledTimes(2);
  });

  it("closes and reopens after a database version change", async () => {
    const { database, indexedDB } = mockIndexedDB();
    const storage = createEnhancedStorage();
    await storage.getItem("key");
    database.onversionchange?.();
    expect(database.close).toHaveBeenCalledOnce();
    await storage.getItem("key");
    expect(indexedDB.open).toHaveBeenCalledTimes(2);
  });

  it("preserves empty strings", async () => {
    const { data } = mockIndexedDB();
    data.set("key", "");
    expect(await createEnhancedStorage().getItem("key")).toBe("");
  });
});

describe("Zustand storage locking", () => {
  it("keeps same-key writes and reads in order until transactions commit", async () => {
    const { controls, pendingWrites, database } = mockIndexedDB();
    controls.autoComplete = false;
    const storage = createZustandStorage();
    const first = storage.setItem("key", "first");
    const second = storage.setItem("key", "second");
    const read = storage.getItem("key");
    await vi.waitFor(() => expect(pendingWrites).toHaveLength(1));
    expect(database.transaction).toHaveBeenCalledTimes(1);
    pendingWrites.shift()?.();
    await first;
    await vi.waitFor(() => expect(pendingWrites).toHaveLength(1));
    expect(database.transaction).toHaveBeenCalledTimes(2);
    pendingWrites.shift()?.();
    await second;
    expect(await read).toBe("second");
  });

  it("does not block independent keys", async () => {
    const { controls, pendingWrites, data } = mockIndexedDB();
    controls.autoComplete = false;
    data.set("other", "available");
    const storage = createZustandStorage();
    const pending = storage.setItem("key", "value");
    await vi.waitFor(() => expect(pendingWrites).toHaveLength(1));
    expect(await storage.getItem("other")).toBe("available");
    pendingWrites.shift()?.();
    await pending;
  });

  it("recovers the queue after an operation and its fallback fail", async () => {
    const { controls, localStorage, data } = mockIndexedDB();
    controls.writeFailure = "abort";
    localStorage.setItem.mockImplementation(() => { throw new Error("Quota exceeded"); });
    const storage = createZustandStorage();
    const write = storage.setItem("key", "value");
    data.set("key", "available");
    const read = storage.getItem("key");
    await write;
    expect(await read).toBe("available");
    expect(console.error).toHaveBeenCalledOnce();
  });
});
