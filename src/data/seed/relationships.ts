import type { Relationship } from '../../types'

const now = '2025-01-01T00:00:00Z'

export const relationships: Relationship[] = [
  // Kinship - Greek
  { id: 'rel-1', fromEntityType: 'being', fromEntityId: 'zeus', relationType: 'consort_of', toEntityType: 'being', toEntityId: 'hera', mythologyIds: ['greek'], certainty: 'direct', direction: 'bidirectional', sourceRefIds: [], tags: [], createdAt: now, updatedAt: now },
  { id: 'rel-2', fromEntityType: 'being', fromEntityId: 'hades', relationType: 'consort_of', toEntityType: 'being', toEntityId: 'persephone', mythologyIds: ['greek'], certainty: 'direct', direction: 'bidirectional', sourceRefIds: [], tags: [], createdAt: now, updatedAt: now },
  // Rule/dwelling
  { id: 'rel-3', fromEntityType: 'being', fromEntityId: 'zeus', relationType: 'rules', toEntityType: 'place', toEntityId: 'olympus', mythologyIds: ['greek'], certainty: 'direct', direction: 'forward', sourceRefIds: [], tags: [], createdAt: now, updatedAt: now },
  { id: 'rel-4', fromEntityType: 'being', fromEntityId: 'hades', relationType: 'rules', toEntityType: 'place', toEntityId: 'underworld', mythologyIds: ['greek'], certainty: 'direct', direction: 'forward', sourceRefIds: [], tags: [], createdAt: now, updatedAt: now },
  { id: 'rel-5', fromEntityType: 'being', fromEntityId: 'apollo', relationType: 'associated_with', toEntityType: 'place', toEntityId: 'delphi', mythologyIds: ['greek'], certainty: 'direct', direction: 'forward', sourceRefIds: [], tags: [], createdAt: now, updatedAt: now },
  // Membership
  { id: 'rel-6', fromEntityType: 'being', fromEntityId: 'zeus', relationType: 'leader_of', toEntityType: 'group', toEntityId: 'olympians', mythologyIds: ['greek'], certainty: 'direct', direction: 'forward', sourceRefIds: [], tags: [], createdAt: now, updatedAt: now },
  { id: 'rel-7', fromEntityType: 'being', fromEntityId: 'odin', relationType: 'leader_of', toEntityType: 'group', toEntityId: 'aesir', mythologyIds: ['norse'], certainty: 'direct', direction: 'forward', sourceRefIds: [], tags: [], createdAt: now, updatedAt: now },
  // Narrative
  { id: 'rel-8', fromEntityType: 'being', fromEntityId: 'odysseus', relationType: 'appears_in', toEntityType: 'story', toEntityId: 'odyssey-journey', mythologyIds: ['greek'], certainty: 'direct', direction: 'forward', sourceRefIds: [], tags: [], createdAt: now, updatedAt: now },
  { id: 'rel-9', fromEntityType: 'being', fromEntityId: 'persephone', relationType: 'central_in', toEntityType: 'story', toEntityId: 'persephone-abduction', mythologyIds: ['greek'], certainty: 'direct', direction: 'forward', sourceRefIds: [], tags: [], createdAt: now, updatedAt: now },
  { id: 'rel-10', fromEntityType: 'being', fromEntityId: 'hades', relationType: 'central_in', toEntityType: 'story', toEntityId: 'persephone-abduction', mythologyIds: ['greek'], certainty: 'direct', direction: 'forward', sourceRefIds: [], tags: [], createdAt: now, updatedAt: now },
  { id: 'rel-11', fromEntityType: 'being', fromEntityId: 'thor', relationType: 'central_in', toEntityType: 'story', toEntityId: 'thor-hymnir', mythologyIds: ['norse'], certainty: 'direct', direction: 'forward', sourceRefIds: [], tags: [], createdAt: now, updatedAt: now },
  { id: 'rel-12', fromEntityType: 'being', fromEntityId: 'loki', relationType: 'central_in', toEntityType: 'story', toEntityId: 'binding-fenrir', mythologyIds: ['norse'], certainty: 'direct', direction: 'forward', sourceRefIds: [], tags: [], createdAt: now, updatedAt: now },
  { id: 'rel-13', fromEntityType: 'being', fromEntityId: 'fenrir', relationType: 'central_in', toEntityType: 'story', toEntityId: 'binding-fenrir', mythologyIds: ['norse'], certainty: 'direct', direction: 'forward', sourceRefIds: [], tags: [], createdAt: now, updatedAt: now },
  // Object ownership (object belongs_to being)
  { id: 'rel-14', fromEntityType: 'object', fromEntityId: 'lightning-bolt', relationType: 'belongs_to', toEntityType: 'being', toEntityId: 'zeus', mythologyIds: ['greek'], certainty: 'direct', direction: 'forward', sourceRefIds: [], tags: [], createdAt: now, updatedAt: now },
  { id: 'rel-15', fromEntityType: 'object', fromEntityId: 'trident', relationType: 'belongs_to', toEntityType: 'being', toEntityId: 'poseidon', mythologyIds: ['greek'], certainty: 'direct', direction: 'forward', sourceRefIds: [], tags: [], createdAt: now, updatedAt: now },
  { id: 'rel-16', fromEntityType: 'object', fromEntityId: 'mjolnir', relationType: 'belongs_to', toEntityType: 'being', toEntityId: 'thor', mythologyIds: ['norse'], certainty: 'direct', direction: 'forward', sourceRefIds: [], tags: [], createdAt: now, updatedAt: now },
  { id: 'rel-17', fromEntityType: 'object', fromEntityId: 'gungnir', relationType: 'belongs_to', toEntityType: 'being', toEntityId: 'odin', mythologyIds: ['norse'], certainty: 'direct', direction: 'forward', sourceRefIds: [], tags: [], createdAt: now, updatedAt: now },
  // Loki-Fenrir kinship
  { id: 'rel-18', fromEntityType: 'being', fromEntityId: 'loki', relationType: 'parent_of', toEntityType: 'being', toEntityId: 'fenrir', mythologyIds: ['norse'], certainty: 'direct', direction: 'forward', sourceRefIds: [], tags: [], createdAt: now, updatedAt: now },
  // Comparative
  { id: 'rel-19', fromEntityType: 'being', fromEntityId: 'zeus', relationType: 'possible_equivalent_of', toEntityType: 'being', toEntityId: 'odin', mythologyIds: ['greek', 'norse'], certainty: 'tentative', direction: 'bidirectional', description: 'Both are sky/sovereign gods; comparative mythology', sourceRefIds: [], tags: ['comparative'], createdAt: now, updatedAt: now },
  { id: 'rel-20', fromEntityType: 'being', fromEntityId: 'thor', relationType: 'possible_equivalent_of', toEntityType: 'being', toEntityId: 'zeus', mythologyIds: ['greek', 'norse'], certainty: 'disputed', direction: 'bidirectional', description: 'Thor as thunder god vs Zeus; different roles', sourceRefIds: [], tags: ['comparative'], createdAt: now, updatedAt: now },
  // Greek kinship
  { id: 'rel-21', fromEntityType: 'being', fromEntityId: 'zeus', relationType: 'child_of', toEntityType: 'being', toEntityId: 'cronus', mythologyIds: ['greek'], certainty: 'direct', direction: 'forward', sourceRefIds: [], tags: [], createdAt: now, updatedAt: now },
  { id: 'rel-22', fromEntityType: 'being', fromEntityId: 'demeter', relationType: 'parent_of', toEntityType: 'being', toEntityId: 'persephone', mythologyIds: ['greek'], certainty: 'direct', direction: 'forward', sourceRefIds: [], tags: [], createdAt: now, updatedAt: now },
  { id: 'rel-23', fromEntityType: 'being', fromEntityId: 'cronus', relationType: 'consort_of', toEntityType: 'being', toEntityId: 'rhea', mythologyIds: ['greek'], certainty: 'direct', direction: 'bidirectional', sourceRefIds: [], tags: [], createdAt: now, updatedAt: now },
  // Norse kinship
  { id: 'rel-24', fromEntityType: 'being', fromEntityId: 'odin', relationType: 'consort_of', toEntityType: 'being', toEntityId: 'frigg', mythologyIds: ['norse'], certainty: 'direct', direction: 'bidirectional', sourceRefIds: [], tags: [], createdAt: now, updatedAt: now },
  { id: 'rel-25', fromEntityType: 'being', fromEntityId: 'njord', relationType: 'parent_of', toEntityType: 'being', toEntityId: 'freyja', mythologyIds: ['norse'], certainty: 'direct', direction: 'forward', sourceRefIds: [], tags: [], createdAt: now, updatedAt: now },
  { id: 'rel-26', fromEntityType: 'being', fromEntityId: 'njord', relationType: 'parent_of', toEntityType: 'being', toEntityId: 'freyr', mythologyIds: ['norse'], certainty: 'direct', direction: 'forward', sourceRefIds: [], tags: [], createdAt: now, updatedAt: now },
  { id: 'rel-27', fromEntityType: 'being', fromEntityId: 'loki', relationType: 'parent_of', toEntityType: 'being', toEntityId: 'hel', mythologyIds: ['norse'], certainty: 'direct', direction: 'forward', sourceRefIds: [], tags: [], createdAt: now, updatedAt: now },
  { id: 'rel-28', fromEntityType: 'being', fromEntityId: 'loki', relationType: 'parent_of', toEntityType: 'being', toEntityId: 'jormungandr', mythologyIds: ['norse'], certainty: 'direct', direction: 'forward', sourceRefIds: [], tags: [], createdAt: now, updatedAt: now },
  // Rule/dwelling
  { id: 'rel-29', fromEntityType: 'being', fromEntityId: 'hel', relationType: 'rules', toEntityType: 'place', toEntityId: 'helheim', mythologyIds: ['norse'], certainty: 'direct', direction: 'forward', sourceRefIds: [], tags: [], createdAt: now, updatedAt: now },
  { id: 'rel-30', fromEntityType: 'being', fromEntityId: 'heimdall', relationType: 'protects', toEntityType: 'place', toEntityId: 'bifrost', mythologyIds: ['norse'], certainty: 'direct', direction: 'forward', sourceRefIds: [], tags: [], createdAt: now, updatedAt: now },
  // Narrative - Greek
  { id: 'rel-31', fromEntityType: 'being', fromEntityId: 'athena', relationType: 'central_in', toEntityType: 'story', toEntityId: 'birth-athena', mythologyIds: ['greek'], certainty: 'direct', direction: 'forward', sourceRefIds: [], tags: [], createdAt: now, updatedAt: now },
  { id: 'rel-32', fromEntityType: 'being', fromEntityId: 'prometheus', relationType: 'central_in', toEntityType: 'story', toEntityId: 'prometheus-fire', mythologyIds: ['greek'], certainty: 'direct', direction: 'forward', sourceRefIds: [], tags: [], createdAt: now, updatedAt: now },
  { id: 'rel-33', fromEntityType: 'being', fromEntityId: 'aphrodite', relationType: 'central_in', toEntityType: 'story', toEntityId: 'judgment-paris', mythologyIds: ['greek'], certainty: 'direct', direction: 'forward', sourceRefIds: [], tags: [], createdAt: now, updatedAt: now },
  { id: 'rel-34', fromEntityType: 'being', fromEntityId: 'achilles', relationType: 'central_in', toEntityType: 'story', toEntityId: 'iliad-achilles', mythologyIds: ['greek'], certainty: 'direct', direction: 'forward', sourceRefIds: [], tags: [], createdAt: now, updatedAt: now },
  { id: 'rel-35', fromEntityType: 'being', fromEntityId: 'herakles', relationType: 'appears_in', toEntityType: 'story', toEntityId: 'gigantomachy', mythologyIds: ['greek'], certainty: 'direct', direction: 'forward', sourceRefIds: [], tags: [], createdAt: now, updatedAt: now },
  // Narrative - Norse
  { id: 'rel-36', fromEntityType: 'being', fromEntityId: 'odin', relationType: 'central_in', toEntityType: 'story', toEntityId: 'odin-sacrifice', mythologyIds: ['norse'], certainty: 'direct', direction: 'forward', sourceRefIds: [], tags: [], createdAt: now, updatedAt: now },
  { id: 'rel-37', fromEntityType: 'being', fromEntityId: 'baldr', relationType: 'central_in', toEntityType: 'story', toEntityId: 'death-baldr', mythologyIds: ['norse'], certainty: 'direct', direction: 'forward', sourceRefIds: [], tags: [], createdAt: now, updatedAt: now },
  { id: 'rel-38', fromEntityType: 'being', fromEntityId: 'loki', relationType: 'central_in', toEntityType: 'story', toEntityId: 'death-baldr', mythologyIds: ['norse'], certainty: 'direct', direction: 'forward', sourceRefIds: [], tags: [], createdAt: now, updatedAt: now },
  { id: 'rel-39', fromEntityType: 'being', fromEntityId: 'loki', relationType: 'central_in', toEntityType: 'story', toEntityId: 'loki-punishment', mythologyIds: ['norse'], certainty: 'direct', direction: 'forward', sourceRefIds: [], tags: [], createdAt: now, updatedAt: now },
  { id: 'rel-40', fromEntityType: 'being', fromEntityId: 'tyr', relationType: 'central_in', toEntityType: 'story', toEntityId: 'binding-fenrir', mythologyIds: ['norse'], certainty: 'direct', direction: 'forward', sourceRefIds: [], tags: [], createdAt: now, updatedAt: now },
  // Cosmogony
  { id: 'rel-41', fromEntityType: 'being', fromEntityId: 'ymir', relationType: 'killed_by', toEntityType: 'being', toEntityId: 'odin', mythologyIds: ['norse'], certainty: 'direct', direction: 'forward', description: 'Odin and brothers slay Ymir', sourceRefIds: [], tags: [], createdAt: now, updatedAt: now },
  { id: 'rel-42', fromEntityType: 'place', fromEntityId: 'underworld', relationType: 'contains', toEntityType: 'place', toEntityId: 'tartarus', mythologyIds: ['greek'], certainty: 'direct', direction: 'forward', sourceRefIds: [], tags: [], createdAt: now, updatedAt: now },
  { id: 'rel-43', fromEntityType: 'place', fromEntityId: 'underworld', relationType: 'contains', toEntityType: 'place', toEntityId: 'elysium', mythologyIds: ['greek'], certainty: 'direct', direction: 'forward', sourceRefIds: [], tags: [], createdAt: now, updatedAt: now },
  // Comparative
  { id: 'rel-44', fromEntityType: 'being', fromEntityId: 'hades', relationType: 'possible_equivalent_of', toEntityType: 'being', toEntityId: 'hel', mythologyIds: ['greek', 'norse'], certainty: 'tentative', direction: 'bidirectional', description: 'Underworld rulers; different structures', sourceRefIds: [], tags: ['comparative'], createdAt: now, updatedAt: now },
]
