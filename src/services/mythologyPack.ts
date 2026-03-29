/**
 * Mythology pack validation and import
 * Formal package format for mythology data expansion
 */

import type {
  MythologySystem,
  Being,
  Story,
  Place,
  Motif,
  Group,
  ObjectEntity,
  Relationship,
  Note,
  SourceRef,
} from '../types'
import { BEING_SUBTYPES } from '../utils/formConstants'
import { ALL_RELATION_TYPES, CERTAINTIES } from '../utils/relationshipCategories'

export interface MythologyPack {
  packageFormat: 1
  packageType: 'mythology-pack'
  packName: string
  packVersion: string
  description?: string
  mythologies: MythologySystem[]
  beings: Being[]
  stories: Story[]
  places: Place[]
  motifs: Motif[]
  groups: Group[]
  objects: ObjectEntity[]
  relationships: Relationship[]
  sources: SourceRef[]
  notes: Note[]
}

export interface PackPreview {
  packName: string
  packVersion: string
  description?: string
  mythologies: { id: string; name: string }[]
  counts: Record<string, number>
  warnings: string[]
  errors: string[]
}

function isMythologyPack(d: unknown): d is MythologyPack {
  if (!d || typeof d !== 'object') return false
  const o = d as Record<string, unknown>
  return (
    o.packageFormat === 1 &&
    o.packageType === 'mythology-pack' &&
    typeof o.packName === 'string' &&
    typeof o.packVersion === 'string' &&
    Array.isArray(o.mythologies) &&
    Array.isArray(o.beings) &&
    Array.isArray(o.stories) &&
    Array.isArray(o.places) &&
    Array.isArray(o.motifs) &&
    Array.isArray(o.groups) &&
    Array.isArray(o.objects) &&
    Array.isArray(o.relationships) &&
    Array.isArray(o.sources) &&
    Array.isArray(o.notes ?? [])
  )
}

function collectIds(
  pack: MythologyPack
): { beings: Set<string>; stories: Set<string>; places: Set<string>; motifs: Set<string>; groups: Set<string>; objects: Set<string>; mythologies: Set<string>; sources: Set<string> } {
  const mythologies = new Set(pack.mythologies.map((m) => m.id))
  const beings = new Set(pack.beings.map((b) => b.id))
  const stories = new Set(pack.stories.map((s) => s.id))
  const places = new Set(pack.places.map((p) => p.id))
  const motifs = new Set(pack.motifs.map((m) => m.id))
  const groups = new Set(pack.groups.map((g) => g.id))
  const objects = new Set(pack.objects.map((o) => o.id))
  const sources = new Set(pack.sources.map((s) => s.id))
  return { mythologies, beings, stories, places, motifs, groups, objects, sources }
}

export function validateAndPreviewPack(data: unknown, existingIds?: Record<string, Set<string>>): PackPreview | { error: string } {
  if (!isMythologyPack(data)) {
    return { error: 'Invalid package: must have packageFormat 1, packageType "mythology-pack", and required arrays' }
  }

  const pack = data
  const warnings: string[] = []
  const errors: string[] = []
  const ids = collectIds(pack)

  const counts = {
    mythologies: pack.mythologies.length,
    beings: pack.beings.length,
    stories: pack.stories.length,
    places: pack.places.length,
    motifs: pack.motifs.length,
    groups: pack.groups.length,
    objects: pack.objects.length,
    relationships: pack.relationships.length,
    sources: pack.sources.length,
    notes: (pack.notes ?? []).length,
  }

  if (pack.mythologies.length === 0) {
    errors.push('Pack must include at least one mythology')
  }

  for (const m of pack.mythologies) {
    if (!m.mythologyIds?.includes(m.id)) {
      warnings.push(`Mythology ${m.name} (${m.id}) should include its own id in mythologyIds`)
    }
  }

  const entityIds = new Set([
    ...ids.beings,
    ...ids.stories,
    ...ids.places,
    ...ids.motifs,
    ...ids.groups,
    ...ids.objects,
  ])

  for (const r of pack.relationships) {
    if (!entityIds.has(r.fromEntityId)) {
      errors.push(`Relationship ${r.id}: fromEntityId "${r.fromEntityId}" not found in pack`)
    }
    if (!entityIds.has(r.toEntityId)) {
      errors.push(`Relationship ${r.id}: toEntityId "${r.toEntityId}" not found in pack`)
    }
    if (!ALL_RELATION_TYPES.includes(r.relationType as (typeof ALL_RELATION_TYPES)[number])) {
      warnings.push(`Relationship ${r.id}: unknown relationType "${r.relationType}"`)
    }
    if (!CERTAINTIES.includes(r.certainty as (typeof CERTAINTIES)[number])) {
      warnings.push(`Relationship ${r.id}: unknown certainty "${r.certainty}"`)
    }
  }

  for (const b of pack.beings) {
    if (b.subtype && !BEING_SUBTYPES.includes(b.subtype)) {
      warnings.push(`Being ${b.name}: unknown subtype "${b.subtype}"`)
    }
    for (const mid of b.mythologyIds ?? []) {
      if (!ids.mythologies.has(mid)) {
        errors.push(`Being ${b.name}: mythologyIds references unknown mythology "${mid}"`)
      }
    }
  }

  for (const g of pack.groups) {
    for (const mid of g.memberIds ?? []) {
      if (!ids.beings.has(mid)) {
        warnings.push(`Group ${g.name}: memberIds references unknown being "${mid}"`)
      }
    }
  }

  for (const s of pack.sources) {
    const valid = ['primary', 'secondary', 'scholarly', 'oral', 'translation', 'other']
    if (s.sourceType && !valid.includes(s.sourceType)) {
      warnings.push(`Source ${s.title}: unknown sourceType "${s.sourceType}"`)
    }
  }

  if (existingIds) {
    for (const store of ['mythologies', 'beings', 'stories', 'places', 'motifs', 'groups', 'objects', 'sources'] as const) {
      const existing = existingIds[store]
      if (existing) {
        const packIds = store === 'mythologies' ? ids.mythologies
          : store === 'beings' ? ids.beings
          : store === 'stories' ? ids.stories
          : store === 'places' ? ids.places
          : store === 'motifs' ? ids.motifs
          : store === 'groups' ? ids.groups
          : store === 'objects' ? ids.objects
          : ids.sources
        for (const id of packIds) {
          if (existing.has(id)) {
            warnings.push(`Duplicate ID: ${store} "${id}" already exists (will be overwritten in merge)`)
          }
        }
      }
    }
  }

  return {
    packName: pack.packName,
    packVersion: pack.packVersion,
    description: pack.description,
    mythologies: pack.mythologies.map((m) => ({ id: m.id, name: m.name })),
    counts,
    warnings,
    errors,
  }
}

export function packToExportFormat(pack: MythologyPack): {
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
} {
  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    mythologies: pack.mythologies,
    beings: pack.beings,
    stories: pack.stories,
    places: pack.places,
    motifs: pack.motifs,
    groups: pack.groups,
    objects: pack.objects,
    relationships: pack.relationships,
    notes: pack.notes ?? [],
    sources: pack.sources,
    settings: [],
  }
}
