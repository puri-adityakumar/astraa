/**
 * Browser persistence utilities for Zustand stores.
 *
 * Server rendering always receives a no-op adapter. In the browser, IndexedDB
 * is preferred with a guarded localStorage fallback.
 */

export interface StorageAdapter {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
}

class NoopStorageAdapter implements StorageAdapter {
  async getItem(): Promise<null> {
    return null;
  }

  async setItem(): Promise<void> {}

  async removeItem(): Promise<void> {}
}

class LocalStorageAdapter implements StorageAdapter {
  constructor(private readonly storage: Storage) {}

  async getItem(key: string): Promise<string | null> {
    return this.storage.getItem(key);
  }

  async setItem(key: string, value: string): Promise<void> {
    this.storage.setItem(key, value);
  }

  async removeItem(key: string): Promise<void> {
    this.storage.removeItem(key);
  }
}

function getBrowserLocalStorage(): Storage | null {
  if (typeof window === "undefined") return null;

  try {
    return window.localStorage ?? null;
  } catch {
    return null;
  }
}

function createBrowserFallback(): StorageAdapter {
  const storage = getBrowserLocalStorage();
  return storage ? new LocalStorageAdapter(storage) : new NoopStorageAdapter();
}

class IndexedDBAdapter implements StorageAdapter {
  private readonly dbName = "astraa-tools-db";
  private readonly version = 1;
  private readonly storeName = "store";

  private async getDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = window.indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName);
        }
      };
    });
  }

  async getItem(key: string): Promise<string | null> {
    try {
      const db = await this.getDB();
      const transaction = db.transaction([this.storeName], "readonly");
      const store = transaction.objectStore(this.storeName);

      return await new Promise((resolve, reject) => {
        const request = store.get(key);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
          resolve(typeof request.result === "string" ? request.result : null);
        };
      });
    } catch {
      return createBrowserFallback().getItem(key);
    }
  }

  async setItem(key: string, value: string): Promise<void> {
    try {
      const db = await this.getDB();
      const transaction = db.transaction([this.storeName], "readwrite");
      const store = transaction.objectStore(this.storeName);

      await new Promise<void>((resolve, reject) => {
        const request = store.put(value, key);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve();
      });
    } catch {
      await createBrowserFallback().setItem(key, value);
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      const db = await this.getDB();
      const transaction = db.transaction([this.storeName], "readwrite");
      const store = transaction.objectStore(this.storeName);

      await new Promise<void>((resolve, reject) => {
        const request = store.delete(key);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve();
      });
    } catch {
      await createBrowserFallback().removeItem(key);
    }
  }
}

export function createEnhancedStorage(): StorageAdapter {
  if (typeof window === "undefined") {
    return new NoopStorageAdapter();
  }

  if (window.indexedDB) {
    return new IndexedDBAdapter();
  }

  return createBrowserFallback();
}

/**
 * Creates a Zustand-compatible storage object with per-key serialization.
 */
export function createZustandStorage(): StorageAdapter {
  const adapter = createEnhancedStorage();
  const locks = new Map<string, Promise<void>>();

  const enqueue = async <T>(key: string, operation: () => Promise<T>): Promise<T> => {
    const current = locks.get(key) ?? Promise.resolve();
    const nextPromise = current.then(operation);

    locks.set(
      key,
      nextPromise.then(
        () => undefined,
        () => undefined,
      ),
    );

    return nextPromise;
  };

  return {
    getItem: async (name: string): Promise<string | null> => {
      try {
        return await enqueue(name, () => adapter.getItem(name));
      } catch {
        return null;
      }
    },
    setItem: async (name: string, value: string): Promise<void> => {
      try {
        await enqueue(name, () => adapter.setItem(name, value));
      } catch {
        // Persistence is best-effort; editor state remains available in memory.
      }
    },
    removeItem: async (name: string): Promise<void> => {
      try {
        await enqueue(name, () => adapter.removeItem(name));
      } catch {
        // Persistence is best-effort; editor state remains available in memory.
      }
    },
  };
}
