/**
 * Seed data import - runs on first launch or explicit reseed
 */

import { openDB } from './init'
import { STORES } from './schema'
import type {
  Being,
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
import { mythologies } from '../data/seed/mythologies'
import { beings } from '../data/seed/beings'
import { stories } from '../data/seed/stories'
import { places } from '../data/seed/places'
import { motifs } from '../data/seed/motifs'
import { groups } from '../data/seed/groups'
import { objects } from '../data/seed/objects'
import { relationships } from '../data/seed/relationships'
import { notes } from '../data/seed/notes'
import { sources } from '../data/seed/sources'

async function putAll<T>(storeName: string, items: T[]): Promise<void> {
  const db = await openDB()
  const tx = db.transaction(storeName, 'readwrite')
  const store = tx.objectStore(storeName)
  for (const item of items) {
    store.put(item)
  }
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

export async function seedDatabase(): Promise<void> {
  await putAll<MythologySystem>(STORES.mythologies, mythologies)
  await putAll<Being>(STORES.beings, beings)
  await putAll<Story>(STORES.stories, stories)
  await putAll<Place>(STORES.places, places)
  await putAll<Motif>(STORES.motifs, motifs)
  await putAll<Group>(STORES.groups, groups)
  await putAll<ObjectEntity>(STORES.objects, objects)
  await putAll<Relationship>(STORES.relationships, relationships)
  await putAll<Note>(STORES.notes, notes)
  await putAll<SourceRef>(STORES.sources, sources)
}
