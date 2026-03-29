/**
 * IndexedDB schema definition
 */

export const DB_NAME = 'MythologyOS'
export const DB_VERSION = 1

export const STORES = {
  mythologies: 'mythologies',
  beings: 'beings',
  stories: 'stories',
  places: 'places',
  motifs: 'motifs',
  groups: 'groups',
  objects: 'objects',
  relationships: 'relationships',
  notes: 'notes',
  sources: 'sources',
  settings: 'settings',
} as const
