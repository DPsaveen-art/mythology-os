/**
 * IndexedDB service - CRUD and query operations
 */

import { openDB } from '../db/init'
import { STORES } from '../db/schema'
import type {
  Being,
  ContentEntity,
  EntityType,
  Group,
  Motif,
  MythologySystem,
  Note,
  ObjectEntity,
  Place,
  Relationship,
  SourceRef,
  Story,
} from '../types'

async function getAll<T>(storeName: string): Promise<T[]> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly')
    const store = tx.objectStore(storeName)
    const req = store.getAll()
    req.onsuccess = () => resolve(req.result ?? [])
    req.onerror = () => reject(req.error)
  })
}

async function getById<T>(storeName: string, id: string): Promise<T | undefined> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly')
    const store = tx.objectStore(storeName)
    const req = store.get(id)
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

async function put<T>(storeName: string, item: T): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite')
    const store = tx.objectStore(storeName)
    store.put(item)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

async function remove(storeName: string, id: string): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite')
    const store = tx.objectStore(storeName)
    store.delete(id)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

// Store name by entity type
const STORE_BY_ENTITY: Record<EntityType, string> = {
  mythology: STORES.mythologies,
  being: STORES.beings,
  story: STORES.stories,
  place: STORES.places,
  motif: STORES.motifs,
  group: STORES.groups,
  object: STORES.objects,
  note: STORES.notes,
  source: STORES.sources,
}

export const mythoDb = {
  mythologies: {
    getAll: () => getAll<MythologySystem>(STORES.mythologies),
    getById: (id: string) => getById<MythologySystem>(STORES.mythologies, id),
    put: (item: MythologySystem) => put(STORES.mythologies, item),
    remove: (id: string) => remove(STORES.mythologies, id),
  },
  beings: {
    getAll: () => getAll<Being>(STORES.beings),
    getById: (id: string) => getById<Being>(STORES.beings, id),
    put: (item: Being) => put(STORES.beings, item),
    remove: (id: string) => remove(STORES.beings, id),
  },
  stories: {
    getAll: () => getAll<Story>(STORES.stories),
    getById: (id: string) => getById<Story>(STORES.stories, id),
    put: (item: Story) => put(STORES.stories, item),
    remove: (id: string) => remove(STORES.stories, id),
  },
  places: {
    getAll: () => getAll<Place>(STORES.places),
    getById: (id: string) => getById<Place>(STORES.places, id),
    put: (item: Place) => put(STORES.places, item),
    remove: (id: string) => remove(STORES.places, id),
  },
  motifs: {
    getAll: () => getAll<Motif>(STORES.motifs),
    getById: (id: string) => getById<Motif>(STORES.motifs, id),
    put: (item: Motif) => put(STORES.motifs, item),
    remove: (id: string) => remove(STORES.motifs, id),
  },
  groups: {
    getAll: () => getAll<Group>(STORES.groups),
    getById: (id: string) => getById<Group>(STORES.groups, id),
    put: (item: Group) => put(STORES.groups, item),
    remove: (id: string) => remove(STORES.groups, id),
  },
  objects: {
    getAll: () => getAll<ObjectEntity>(STORES.objects),
    getById: (id: string) => getById<ObjectEntity>(STORES.objects, id),
    put: (item: ObjectEntity) => put(STORES.objects, item),
    remove: (id: string) => remove(STORES.objects, id),
  },
  relationships: {
    getAll: () => getAll<Relationship>(STORES.relationships),
    getById: (id: string) => getById<Relationship>(STORES.relationships, id),
    put: (item: Relationship) => put(STORES.relationships, item),
    remove: (id: string) => remove(STORES.relationships, id),
  },
  notes: {
    getAll: () => getAll<Note>(STORES.notes),
    getById: (id: string) => getById<Note>(STORES.notes, id),
    put: (item: Note) => put(STORES.notes, item),
    remove: (id: string) => remove(STORES.notes, id),
  },
  sources: {
    getAll: () => getAll<SourceRef>(STORES.sources),
    getById: (id: string) => getById<SourceRef>(STORES.sources, id),
    put: (item: SourceRef) => put(STORES.sources, item),
    remove: (id: string) => remove(STORES.sources, id),
  },
}

export async function getEntity(
  entityType: EntityType,
  id: string
): Promise<ContentEntity | Note | SourceRef | undefined> {
  const store = STORE_BY_ENTITY[entityType]
  if (!store) return undefined
  return getById(store, id) as Promise<ContentEntity | Note | SourceRef | undefined>
}
