import { afterEach, describe, expect, it, vi } from "vitest";

import { createEnhancedStorage, createZustandStorage } from "./storage";

const originalWindow = Object.getOwnPropertyDescriptor(globalThis, "window");

function setWindow(value: Partial<Window> | undefined): void {
  if (value === undefined) {
    Reflect.deleteProperty(globalThis, "window");
    return;
  }

  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value,
  });
}

afterEach(() => {
  vi.restoreAllMocks();

  if (originalWindow) {
    Object.defineProperty(globalThis, "window", originalWindow);
  } else {
    Reflect.deleteProperty(globalThis, "window");
  }
});

describe("createEnhancedStorage", () => {
  it("uses a no-op adapter during server rendering", async () => {
    setWindow(undefined);
    const storage = createEnhancedStorage();

    await expect(storage.getItem("document")).resolves.toBeNull();
    await expect(storage.setItem("document", "value")).resolves.toBeUndefined();
    await expect(storage.removeItem("document")).resolves.toBeUndefined();
  });

  it("uses localStorage when IndexedDB is unavailable", async () => {
    const values = new Map<string, string>();
    const localStorage = {
      getItem: vi.fn((key: string) => values.get(key) ?? null),
      setItem: vi.fn((key: string, value: string) => values.set(key, value)),
      removeItem: vi.fn((key: string) => values.delete(key)),
    } as unknown as Storage;
    setWindow({ localStorage });

    const storage = createEnhancedStorage();
    await storage.setItem("document", "value");

    await expect(storage.getItem("document")).resolves.toBe("value");
    expect(localStorage.setItem).toHaveBeenCalledWith("document", "value");
  });

  it("falls back to a no-op adapter when localStorage access throws", async () => {
    const browserWindow = {} as Window;
    Object.defineProperty(browserWindow, "localStorage", {
      configurable: true,
      get: () => {
        throw new DOMException("Storage blocked", "SecurityError");
      },
    });
    setWindow(browserWindow);

    const storage = createEnhancedStorage();

    await expect(storage.getItem("document")).resolves.toBeNull();
    await expect(storage.setItem("document", "value")).resolves.toBeUndefined();
  });

  it("serializes operations for the same key", async () => {
    const order: string[] = [];
    const localStorage = {
      getItem: vi.fn(() => null),
      setItem: vi.fn((_key: string, value: string) => order.push(value)),
      removeItem: vi.fn(),
    } as unknown as Storage;
    setWindow({ localStorage });

    const storage = createZustandStorage();
    await Promise.all([
      storage.setItem("document", "first"),
      storage.setItem("document", "second"),
    ]);

    expect(order).toEqual(["first", "second"]);
  });
});
