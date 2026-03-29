/**
 * IndexedDB initialization and database access
 */

import { DB_NAME, DB_VERSION, STORES } from './schema'

let dbInstance: IDBDatabase | null = null

export function openDB(): Promise<IDBDatabase> {
  if (dbInstance) return Promise.resolve(dbInstance)

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)
    request.onerror = () => reject(request.error)
    request.onsuccess = () => {
      dbInstance = request.result
      resolve(dbInstance)
    }
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result

      const keyPath = { keyPath: 'id' }

      if (!db.objectStoreNames.contains(STORES.mythologies)) {
        db.createObjectStore(STORES.mythologies, keyPath)
      }
      if (!db.objectStoreNames.contains(STORES.beings)) {
        db.createObjectStore(STORES.beings, keyPath)
      }
      if (!db.objectStoreNames.contains(STORES.stories)) {
        db.createObjectStore(STORES.stories, keyPath)
      }
      if (!db.objectStoreNames.contains(STORES.places)) {
        db.createObjectStore(STORES.places, keyPath)
      }
      if (!db.objectStoreNames.contains(STORES.motifs)) {
        db.createObjectStore(STORES.motifs, keyPath)
      }
      if (!db.objectStoreNames.contains(STORES.groups)) {
        db.createObjectStore(STORES.groups, keyPath)
      }
      if (!db.objectStoreNames.contains(STORES.objects)) {
        db.createObjectStore(STORES.objects, keyPath)
      }
      if (!db.objectStoreNames.contains(STORES.relationships)) {
        db.createObjectStore(STORES.relationships, keyPath)
      }
      if (!db.objectStoreNames.contains(STORES.notes)) {
        db.createObjectStore(STORES.notes, keyPath)
      }
      if (!db.objectStoreNames.contains(STORES.sources)) {
        db.createObjectStore(STORES.sources, keyPath)
      }
      if (!db.objectStoreNames.contains(STORES.settings)) {
        db.createObjectStore(STORES.settings, keyPath)
      }
    }
  })
}

export function closeDB(): void {
  if (dbInstance) {
    dbInstance.close()
    dbInstance = null
  }
}

export function deleteDB(): Promise<void> {
  closeDB()
  return new Promise((resolve, reject) => {
    const request = indexedDB.deleteDatabase(DB_NAME)
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve()
  })
}

export async function clearAllStores(): Promise<void> {
  const db = await openDB()
  const storeNames = Object.values(STORES)
  const tx = db.transaction(storeNames, 'readwrite')

  await Promise.all(
    storeNames.map(
      (name) =>
        new Promise<void>((resolve, reject) => {
          const store = tx.objectStore(name)
          const clearReq = store.clear()
          clearReq.onsuccess = () => resolve()
          clearReq.onerror = () => reject(clearReq.error)
        })
    )
  )
}
