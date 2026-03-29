/**
 * Entity search for pickers - content entities only, IndexedDB-backed
 */

import { mythoDb } from './db'
import type { ContentEntity, EntityType } from '../types'

export interface EntitySearchResult {
  id: string
  name: string
  entityType: EntityType
  mythologyIds: string[]
  summary?: string
}

export async function searchEntities(query: string): Promise<EntitySearchResult[]> {
  const q = query.trim().toLowerCase()
  if (!q) return []

  const stores: Array<{ getAll: () => Promise<ContentEntity[]>; type: EntityType }> = [
    { getAll: mythoDb.mythologies.getAll, type: 'mythology' },
    { getAll: mythoDb.beings.getAll, type: 'being' },
    { getAll: mythoDb.stories.getAll, type: 'story' },
    { getAll: mythoDb.places.getAll, type: 'place' },
    { getAll: mythoDb.motifs.getAll, type: 'motif' },
    { getAll: mythoDb.groups.getAll, type: 'group' },
    { getAll: mythoDb.objects.getAll, type: 'object' },
  ]

  const results: EntitySearchResult[] = []
  for (const { getAll, type } of stores) {
    const items = await getAll()
    for (const item of items) {
      const name = item.name?.toLowerCase() ?? ''
      const summary = (item.summary ?? '').toLowerCase()
      const desc = (item.description ?? '').toLowerCase()
      const tags = (item.tags ?? []).join(' ').toLowerCase()
      const alt = (item.alternateNames ?? []).join(' ').toLowerCase()
      if (
        name.includes(q) ||
        alt.includes(q) ||
        summary.includes(q) ||
        desc.includes(q) ||
        tags.includes(q)
      ) {
        results.push({
          id: item.id,
          name: item.name,
          entityType: type,
          mythologyIds: item.mythologyIds ?? [],
          summary: item.summary,
        })
      }
    }
  }
  return results.slice(0, 50)
}

export async function getAllEntities(): Promise<EntitySearchResult[]> {
  const stores: Array<{ getAll: () => Promise<ContentEntity[]>; type: EntityType }> = [
    { getAll: mythoDb.mythologies.getAll, type: 'mythology' },
    { getAll: mythoDb.beings.getAll, type: 'being' },
    { getAll: mythoDb.stories.getAll, type: 'story' },
    { getAll: mythoDb.places.getAll, type: 'place' },
    { getAll: mythoDb.motifs.getAll, type: 'motif' },
    { getAll: mythoDb.groups.getAll, type: 'group' },
    { getAll: mythoDb.objects.getAll, type: 'object' },
  ]
  const results: EntitySearchResult[] = []
  for (const { getAll, type } of stores) {
    const items = await getAll()
    for (const item of items) {
      results.push({
        id: item.id,
        name: item.name,
        entityType: type,
        mythologyIds: item.mythologyIds ?? [],
        summary: item.summary,
      })
    }
  }
  return results.sort((a, b) => a.name.localeCompare(b.name))
}

export async function getEntitiesByIds(ids: string[]): Promise<EntitySearchResult[]> {
  if (ids.length === 0) return []
  const all = await getAllEntities()
  return ids.map((id) => all.find((e) => e.id === id)).filter(Boolean) as EntitySearchResult[]
}
