import type { Note } from '../../types'

const now = '2025-01-01T00:00:00Z'

export const notes: Note[] = [
  {
    id: 'note-1',
    title: 'Zeus vs Odin: sovereignty comparison',
    content: 'Zeus secures power through physical triumph (Titanomachy). Odin gains authority through sacrifice (eye, hanging). Different models of legitimacy.',
    noteType: 'hypothesis',
    linkedEntityIds: ['zeus', 'odin'],
    linkedRelationshipIds: ['rel-19'],
    tags: ['comparative', 'sovereignty'],
    status: 'active',
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'note-2',
    title: 'Katabasis in Odyssey',
    content: 'Odysseus\' descent to consult Tiresias fits the katabasis motif: living hero enters underworld, gains knowledge, returns. Compare Aeneid, Gilgamesh.',
    noteType: 'interpretation',
    linkedEntityIds: ['odysseus'],
    linkedRelationshipIds: [],
    tags: ['katabasis', 'odyssey'],
    status: 'active',
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'note-3',
    title: 'Binding motif: Greek vs Norse',
    content: 'Prometheus bound (Greek) vs Fenrir bound (Norse). Both: dangerous figure contained, prophesied to break free. Containment as temporary order.',
    noteType: 'hypothesis',
    linkedEntityIds: [],
    linkedRelationshipIds: [],
    tags: ['binding', 'comparative'],
    status: 'active',
    createdAt: now,
    updatedAt: now,
  },
]
