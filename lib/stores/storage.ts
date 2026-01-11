/**
 * Enhanced storage utilities for Zustand stores
 * Provides IndexedDB support for complex data and fallback to localStorage
 */

interface StorageAdapter {
  getItem: (key: string) => Promise<string | null>
  setItem: (key: string, value: string) => Promise<void>
  removeItem: (key: string) => Promise<void>
}

class IndexedDBAdapter implements StorageAdapter {
  private dbName = 'astraa-tools-db'
  private version = 1
  private storeName = 'store'
  
  private async getDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version)
      
      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result)
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName)
        }
      }
    })
  }
  
  async getItem(key: string): Promise<string | null> {
    try {
      const db = await this.getDB()
      const transaction = db.transaction([this.storeName], 'readonly')
      const store = transaction.objectStore(this.storeName)
      
      return new Promise((resolve, reject) => {
        const request = store.get(key)
        request.onerror = () => reject(request.error)
        request.onsuccess = () => resolve(request.result || null)
      })
    } catch (error) {
      console.warn('IndexedDB getItem failed, falling back to localStorage:', error)
      return localStorage.getItem(key)
    }
  }
  
  async setItem(key: string, value: string): Promise<void> {
    try {
      const db = await this.getDB()
      const transaction = db.transaction([this.storeName], 'readwrite')
      const store = transaction.objectStore(this.storeName)
      
      return new Promise((resolve, reject) => {
        const request = store.put(value, key)
        request.onerror = () => reject(request.error)
        request.onsuccess = () => resolve()
      })
    } catch (error) {
      console.warn('IndexedDB setItem failed, falling back to localStorage:', error)
      localStorage.setItem(key, value)
    }
  }
  
  async removeItem(key: string): Promise<void> {
    try {
      const db = await this.getDB()
      const transaction = db.transaction([this.storeName], 'readwrite')
      const store = transaction.objectStore(this.storeName)
      
      return new Promise((resolve, reject) => {
        const request = store.delete(key)
        request.onerror = () => reject(request.error)
        request.onsuccess = () => resolve()
      })
    } catch (error) {
      console.warn('IndexedDB removeItem failed, falling back to localStorage:', error)
      localStorage.removeItem(key)
    }
  }
}

class LocalStorageAdapter implements StorageAdapter {
  async getItem(key: string): Promise<string | null> {
    return localStorage.getItem(key)
  }
  
  async setItem(key: string, value: string): Promise<void> {
    localStorage.setItem(key, value)
  }
  
  async removeItem(key: string): Promise<void> {
    localStorage.removeItem(key)
  }
}

/**
 * Creates a storage adapter that uses IndexedDB with localStorage fallback
 */
export function createEnhancedStorage(): StorageAdapter {
  // Check if IndexedDB is available
  if (typeof window !== 'undefined' && 'indexedDB' in window) {
    return new IndexedDBAdapter()
  }
  
  // Fallback to localStorage
  return new LocalStorageAdapter()
}

/**
 * Creates a Zustand-compatible storage object for enhanced persistence
 * Includes concurrency control to prevent race conditions
 */
export function createZustandStorage() {
  const adapter = createEnhancedStorage()
  const locks = new Map<string, Promise<void>>()

  /**
   * Enqueues an operation for a specific key to ensure sequential execution
   */
  const enqueue = async <T>(key: string, operation: () => Promise<T>): Promise<T> => {
    // Get the current promise for this key or resolve immediately
    const current = locks.get(key) || Promise.resolve()

    // Create a new promise that chains after the current one
    const nextPromise = current.then(() => operation())

    // Update the lock with a promise that always resolves
    // This ensures that even if an operation fails, the queue doesn't get stuck
    // We explicitly cast the catch return to void to satisfy the map type
    locks.set(key, nextPromise.then(() => {}).catch(() => {}))

    return nextPromise
  }
  
  return {
    getItem: async (name: string): Promise<string | null> => {
      try {
        // We wait for pending writes to finish before reading
        return await enqueue(name, () => adapter.getItem(name))
      } catch (error) {
        console.error('Storage getItem error:', error)
        return null
      }
    },
    setItem: async (name: string, value: string): Promise<void> => {
      try {
        await enqueue(name, () => adapter.setItem(name, value))
      } catch (error) {
        console.error('Storage setItem error:', error)
      }
    },
    removeItem: async (name: string): Promise<void> => {
      try {
        await enqueue(name, () => adapter.removeItem(name))
      } catch (error) {
        console.error('Storage removeItem error:', error)
      }
    }
  }
}

/**
 * Utility to clear all stored data (useful for debugging or reset functionality)
 */
export async function clearAllStoredData(): Promise<void> {
  const adapter = createEnhancedStorage()
  
  // Clear Zustand store data
  const storeKeys = ['user-preferences', 'tool-settings', 'activity-tracking']
  
  for (const key of storeKeys) {
    await adapter.removeItem(key)
  }
  

}

/**
 * Utility to export all stored data for backup purposes
 */
export async function exportAllStoredData(): Promise<string> {
  const adapter = createEnhancedStorage()
  const data: Record<string, any> = {}
  
  const storeKeys = ['user-preferences', 'tool-settings', 'activity-tracking']
  
  for (const key of storeKeys) {
    const value = await adapter.getItem(key)
    if (value) {
      try {
        data[key] = JSON.parse(value)
      } catch (error) {
        data[key] = value
      }
    }
  }
  
  return JSON.stringify(data, null, 2)
}

/**
 * Utility to import stored data from backup
 */
export async function importStoredData(jsonData: string): Promise<boolean> {
  try {
    const data = JSON.parse(jsonData)
    const adapter = createEnhancedStorage()
    
    for (const [key, value] of Object.entries(data)) {
      await adapter.setItem(key, JSON.stringify(value))
    }
    

    return true
  } catch (error) {
    console.error('Failed to import data:', error)
    return false
  }
}