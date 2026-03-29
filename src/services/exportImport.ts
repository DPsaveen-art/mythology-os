/**
 * Bulk export and import - IndexedDB backup/restore
 */

import { openDB } from '../db/init'
import { STORES } from '../db/schema'
import type { MythologySystem, Being, Story, Place, Motif, Group, ObjectEntity, Relationship, Note, SourceRef } from '../types'

export interface ExportData {
  version: 1
  exportedAt: string
  mythologies: MythologySystem[]
  beings: Being[]
  stories: Story[]
  places: Place[]
  motifs: Motif[]
  groups: Group[]
  objects: ObjectEntity[]
  relationships: Relationship[]
  notes: Note[]
  sources: SourceRef[]
  settings: Record<string, unknown>[]
}

const STORE_NAMES = [
  STORES.mythologies,
  STORES.beings,
  STORES.stories,
  STORES.places,
  STORES.motifs,
  STORES.groups,
  STORES.objects,
  STORES.relationships,
  STORES.notes,
  STORES.sources,
  STORES.settings,
] as const

export type ExistingIds = Record<string, Set<string>>

/** Collect existing entity IDs for duplicate detection when merging packs */
export async function getExistingIds(): Promise<ExistingIds> {
  const db = await openDB()
  const ids: ExistingIds = {}
  const storeKeys = [
    STORES.mythologies,
    STORES.beings,
    STORES.stories,
    STORES.places,
    STORES.motifs,
    STORES.groups,
    STORES.objects,
    STORES.sources,
  ] as const
  for (const name of storeKeys) {
    const items = await new Promise<unknown[]>((resolve, reject) => {
      const tx = db.transaction(name, 'readonly')
      const req = tx.objectStore(name).getAll()
      req.onsuccess = () => resolve(req.result ?? [])
      req.onerror = () => reject(req.error)
    })
    ids[name] = new Set(
      (items as { id?: string }[])
        .filter((x) => x && typeof x.id === 'string')
        .map((x) => x.id!)
    )
  }
  return ids
}

export async function exportAllData(): Promise<ExportData> {
  const db = await openDB()

  const loadStore = async (name: string): Promise<unknown[]> => {
    return new Promise((resolve, reject) => {
      const tx = db.transaction(name, 'readonly')
      const store = tx.objectStore(name)
      const req = store.getAll()
      req.onsuccess = () => resolve(req.result ?? [])
      req.onerror = () => reject(req.error)
    })
  }

  const [mythologies, beings, stories, places, motifs, groups, objects, relationships, notes, sources, settings] =
    await Promise.all(STORE_NAMES.map((n) => loadStore(n)))

  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    mythologies: mythologies as MythologySystem[],
    beings: beings as Being[],
    stories: stories as Story[],
    places: places as Place[],
    motifs: motifs as Motif[],
    groups: groups as Group[],
    objects: objects as ObjectEntity[],
    relationships: relationships as Relationship[],
    notes: notes as Note[],
    sources: sources as SourceRef[],
    settings: settings as Record<string, unknown>[],
  }
}

export function downloadExport(data: ExportData): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `mythology-os-backup-${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)
}

export interface ImportValidation {
  ok: boolean
  errors: string[]
}

export function validateImportData(data: unknown): ImportValidation {
  const errors: string[] = []
  if (!data || typeof data !== 'object') {
    return { ok: false, errors: ['Invalid JSON: root must be an object'] }
  }
  const d = data as Record<string, unknown>
  if (d.version !== 1) {
    errors.push('Unsupported export version')
  }
  const requiredStores = ['mythologies', 'beings', 'stories', 'places', 'motifs', 'groups', 'objects', 'relationships', 'notes', 'sources', 'settings']
  for (const store of requiredStores) {
    if (!(store in d)) {
      errors.push(`Missing store: ${store}`)
    } else if (!Array.isArray(d[store])) {
      errors.push(`Store ${store} must be an array`)
    }
  }
  if (errors.length > 0) {
    return { ok: false, errors }
  }
  return { ok: true, errors: [] }
}

export type ImportMode = 'replace' | 'merge'

export async function importData(data: ExportData, mode: ImportMode): Promise<{ ok: boolean; errors: string[] }> {
  const validation = validateImportData(data)
  if (!validation.ok) return validation

  const db = await openDB()
  const errors: string[] = []

  const writeStore = async (name: string, items: unknown[]): Promise<void> => {
    const tx = db.transaction(name, 'readwrite')
    const store = tx.objectStore(name)
    if (mode === 'replace') {
      store.clear()
    }
    for (const item of items) {
      if (item && typeof item === 'object' && 'id' in item && typeof (item as { id: unknown }).id === 'string') {
        try {
          store.put(item)
        } catch (e) {
          errors.push(`Failed to write to ${name}: ${e instanceof Error ? e.message : 'Unknown'}`)
        }
      }
    }
    await new Promise<void>((res, rej) => {
      tx.oncomplete = () => res()
      tx.onerror = () => rej(tx.error)
    })
  }

  try {
    await writeStore(STORES.mythologies, data.mythologies ?? [])
    await writeStore(STORES.beings, data.beings ?? [])
    await writeStore(STORES.stories, data.stories ?? [])
    await writeStore(STORES.places, data.places ?? [])
    await writeStore(STORES.motifs, data.motifs ?? [])
    await writeStore(STORES.groups, data.groups ?? [])
    await writeStore(STORES.objects, data.objects ?? [])
    await writeStore(STORES.relationships, data.relationships ?? [])
    await writeStore(STORES.notes, data.notes ?? [])
    await writeStore(STORES.sources, data.sources ?? [])
    await writeStore(STORES.settings, data.settings ?? [])
  } catch (e) {
    errors.push(e instanceof Error ? e.message : 'Import failed')
  }

  return {
    ok: errors.length === 0,
    errors,
  }
}
