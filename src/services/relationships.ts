/**
 * Relationship queries - semantic source of truth
 */

import { mythoDb } from './db'
import type { EntityType, Relationship } from '../types'

export async function getRelationshipsForEntity(
  entityType: EntityType,
  entityId: string
): Promise<Relationship[]> {
  const all = await mythoDb.relationships.getAll()
  return all.filter(
    (r) =>
      (r.fromEntityType === entityType && r.fromEntityId === entityId) ||
      (r.toEntityType === entityType && r.toEntityId === entityId)
  )
}

export async function getRelationshipsByMythology(mythologyId: string): Promise<Relationship[]> {
  const all = await mythoDb.relationships.getAll()
  return all.filter((r) => r.mythologyIds?.includes(mythologyId))
}

export async function getRelationshipsForEntities(
  entityKeys: Array<{ type: EntityType; id: string }>
): Promise<Relationship[]> {
  const all = await mythoDb.relationships.getAll()
  const keySet = new Set(entityKeys.map((k) => `${k.type}:${k.id}`))
  return all.filter(
    (r) =>
      keySet.has(`${r.fromEntityType}:${r.fromEntityId}`) ||
      keySet.has(`${r.toEntityType}:${r.toEntityId}`)
  )
}
