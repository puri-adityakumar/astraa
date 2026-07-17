/**
 * Enhanced storage utilities for Zustand stores
 * Provides IndexedDB support for complex data and fallback to localStorage
 */

interface StorageAdapter {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
}

export class IndexedDBAdapter implements StorageAdapter {
  private dbName = "astraa-tools-db";
  private version = 1;
  private storeName = "store";

  /**
   * Cached open connection promise. We open the database once and reuse the
   * connection across operations instead of re-opening on every get/set/remove,
   * which previously paid a full open round-trip (re-running onupgradeneeded)
   * on each call.
   *
   * Null when no connection has been opened yet, or after the connection was
   * closed (e.g. another tab triggered a version change or storage was cleared).
   * On close we reset the cache so the next operation re-opens cleanly.
   */
  private dbPromise: Promise<IDBDatabase> | null = null;

  private getDB(): Promise<IDBDatabase> {
    if (!this.dbPromise) {
      this.dbPromise = new Promise((resolve, reject) => {
        const request = indexedDB.open(this.dbName, this.version);

        request.onerror = () => {
          // Open failed: don't cache a rejected promise.
          this.dbPromise = null;
          reject(request.error);
        };

        request.onsuccess = () => {
          const db = request.result;
          // If another tab requests a version change, the connection must close.
          // Invalidate the cache so the next operation re-opens fresh.
          db.onversionchange = () => {
            db.close();
            this.dbPromise = null;
          };
          resolve(db);
        };

        request.onupgradeneeded = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;
          if (!db.objectStoreNames.contains(this.storeName)) {
            db.createObjectStore(this.storeName);
          }
        };
      });
    }
    return this.dbPromise;
  }

  /**
   * Runs an operation against the (cached) database. If the connection was
   * closed externally between ops, the cached db will throw on transaction
   * creation; we reset the cache and retry once with a fresh connection.
   */
  private async withDB<T>(fn: (db: IDBDatabase) => Promise<T>): Promise<T> {
    try {
      const db = await this.getDB();
      return await fn(db);
    } catch (error) {
      // A closed/invalid connection is recoverable by re-opening.
      this.dbPromise = null;
      // Retry once with a fresh connection.
      const db = await this.getDB();
      return fn(db);
    }
  }

  async getItem(key: string): Promise<string | null> {
    try {
      return await this.withDB((db) => {
        const transaction = db.transaction([this.storeName], "readonly");
        const store = transaction.objectStore(this.storeName);

        return new Promise<string | null>((resolve, reject) => {
          const request = store.get(key);
          request.onerror = () => reject(request.error);
          request.onsuccess = () => resolve(request.result || null);
        });
      });
    } catch (error) {
      console.warn("IndexedDB getItem failed, falling back to localStorage:", error);
      return localStorage.getItem(key);
    }
  }

  async setItem(key: string, value: string): Promise<void> {
    try {
      await this.withDB((db) => {
        const transaction = db.transaction([this.storeName], "readwrite");
        const store = transaction.objectStore(this.storeName);

        return new Promise<void>((resolve, reject) => {
          const request = store.put(value, key);
          request.onerror = () => reject(request.error);
          request.onsuccess = () => resolve();
        });
      });
    } catch (error) {
      console.warn("IndexedDB setItem failed, falling back to localStorage:", error);
      localStorage.setItem(key, value);
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      await this.withDB((db) => {
        const transaction = db.transaction([this.storeName], "readwrite");
        const store = transaction.objectStore(this.storeName);

        return new Promise<void>((resolve, reject) => {
          const request = store.delete(key);
          request.onerror = () => reject(request.error);
          request.onsuccess = () => resolve();
        });
      });
    } catch (error) {
      console.warn("IndexedDB removeItem failed, falling back to localStorage:", error);
      localStorage.removeItem(key);
    }
  }
}

export class LocalStorageAdapter implements StorageAdapter {
  /**
   * In-memory fallback used when localStorage is unavailable (SSR / prerender,
   * private browsing, or environments where it is blocked). SSR state is not
   * meant to persist, so this is intentionally non-persistent.
   */
  private mem = new Map<string, string>();

  private get ls(): Storage | null {
    if (typeof window === "undefined") return null;
    // window.localStorage may be undefined/throw in restricted contexts.
    try {
      return window.localStorage ?? null;
    } catch {
      return null;
    }
  }

  async getItem(key: string): Promise<string | null> {
    const ls = this.ls;
    if (ls) {
      try {
        return ls.getItem(key);
      } catch {
        // Fall through to memory fallback if localStorage access throws.
      }
    }
    return this.mem.get(key) ?? null;
  }

  async setItem(key: string, value: string): Promise<void> {
    const ls = this.ls;
    if (ls) {
      try {
        ls.setItem(key, value);
        return;
      } catch {
        // Fall through to memory fallback if localStorage access throws.
      }
    }
    this.mem.set(key, value);
  }

  async removeItem(key: string): Promise<void> {
    const ls = this.ls;
    if (ls) {
      try {
        ls.removeItem(key);
        return;
      } catch {
        // Fall through to memory fallback if localStorage access throws.
      }
    }
    this.mem.delete(key);
  }
}

/**
 * Creates a storage adapter that uses IndexedDB with localStorage fallback
 */
export function createEnhancedStorage(): StorageAdapter {
  // Check if IndexedDB is available
  if (typeof window !== "undefined" && "indexedDB" in window) {
    return new IndexedDBAdapter();
  }

  // Fallback to localStorage
  return new LocalStorageAdapter();
}

/**
 * Creates a Zustand-compatible storage object for enhanced persistence
 * Includes concurrency control to prevent race conditions
 */
export function createZustandStorage() {
  const adapter = createEnhancedStorage();
  const locks = new Map<string, Promise<void>>();

  /**
   * Enqueues an operation for a specific key to ensure sequential execution
   */
  const enqueue = async <T>(key: string, operation: () => Promise<T>): Promise<T> => {
    // Get the current promise for this key or resolve immediately
    const current = locks.get(key) || Promise.resolve();

    // Create a new promise that chains after the current one
    const nextPromise = current.then(() => operation());

    // Update the lock with a promise that always resolves
    // This ensures that even if an operation fails, the queue doesn't get stuck
    // We explicitly cast the catch return to void to satisfy the map type
    locks.set(
      key,
      nextPromise.then(() => {}).catch(() => {}),
    );

    return nextPromise;
  };

  return {
    getItem: async (name: string): Promise<string | null> => {
      try {
        // We wait for pending writes to finish before reading
        return await enqueue(name, () => adapter.getItem(name));
      } catch (error) {
        console.error("Storage getItem error:", error);
        return null;
      }
    },
    setItem: async (name: string, value: string): Promise<void> => {
      try {
        await enqueue(name, () => adapter.setItem(name, value));
      } catch (error) {
        console.error("Storage setItem error:", error);
      }
    },
    removeItem: async (name: string): Promise<void> => {
      try {
        await enqueue(name, () => adapter.removeItem(name));
      } catch (error) {
        console.error("Storage removeItem error:", error);
      }
    },
  };
}

/**
 * Utility to clear all stored data (useful for debugging or reset functionality)
 */
export async function clearAllStoredData(): Promise<void> {
  const adapter = createEnhancedStorage();

  // Clear Zustand store data
  const storeKeys = ["user-preferences", "tool-settings", "activity-tracking"];

  for (const key of storeKeys) {
    await adapter.removeItem(key);
  }
}

/**
 * Utility to export all stored data for backup purposes
 */
export async function exportAllStoredData(): Promise<string> {
  const adapter = createEnhancedStorage();
  const data: Record<string, any> = {};

  const storeKeys = ["user-preferences", "tool-settings", "activity-tracking"];

  for (const key of storeKeys) {
    const value = await adapter.getItem(key);
    if (value) {
      try {
        data[key] = JSON.parse(value);
      } catch (error) {
        data[key] = value;
      }
    }
  }

  return JSON.stringify(data, null, 2);
}

/**
 * Utility to import stored data from backup
 */
export async function importStoredData(jsonData: string): Promise<boolean> {
  try {
    const data = JSON.parse(jsonData);
    const adapter = createEnhancedStorage();

    for (const [key, value] of Object.entries(data)) {
      await adapter.setItem(key, JSON.stringify(value));
    }

    return true;
  } catch (error) {
    console.error("Failed to import data:", error);
    return false;
  }
}
