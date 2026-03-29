/**
 * Resolve entity IDs to entities for display
 */

import { mythoDb } from './db'
import type { EntityType } from '../types'

const CONTENT_STORES: Array<{ type: EntityType; getById: (id: string) => Promise<{ id: string; name: string } | undefined> }> = [
  { type: 'mythology', getById: mythoDb.mythologies.getById.bind(mythoDb.mythologies) },
  { type: 'being', getById: mythoDb.beings.getById.bind(mythoDb.beings) },
  { type: 'story', getById: mythoDb.stories.getById.bind(mythoDb.stories) },
  { type: 'place', getById: mythoDb.places.getById.bind(mythoDb.places) },
  { type: 'motif', getById: mythoDb.motifs.getById.bind(mythoDb.motifs) },
  { type: 'group', getById: mythoDb.groups.getById.bind(mythoDb.groups) },
  { type: 'object', getById: mythoDb.objects.getById.bind(mythoDb.objects) },
]

export interface ResolvedEntity {
  id: string
  name: string
  entityType: EntityType
}

export async function resolveEntityId(id: string): Promise<ResolvedEntity | null> {
  for (const { type, getById } of CONTENT_STORES) {
    const entity = await getById(id)
    if (entity) {
      return { id: entity.id, name: entity.name, entityType: type }
    }
  }
  return null
}

export async function resolveEntityIds(ids: string[]): Promise<Array<ResolvedEntity | null>> {
  return Promise.all(ids.map(resolveEntityId))
}
