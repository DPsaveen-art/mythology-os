import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { mythoDb } from '../services/db'
import { getRelationshipsForEntity } from '../services/relationships'
import { getEntityTypeLabel } from '../types/entity'
import { RelationMap } from '../components/RelationMap'
import { CATEGORY_LABELS, getRelationCategory } from '../utils/relationshipCategories'
import type {
  ContentEntity,
  EntityType,
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

const STORE_MAP: Record<string, { getById: (id: string) => Promise<{ id: string; name: string } | undefined> }> = {
  mythology: mythoDb.mythologies,
  being: mythoDb.beings,
  story: mythoDb.stories,
  place: mythoDb.places,
  motif: mythoDb.motifs,
  group: mythoDb.groups,
  object: mythoDb.objects,
}

export function EntityDetail() {
  const { entityType, id } = useParams<{ entityType: EntityType; id: string }>()
  const [entity, setEntity] = useState<ContentEntity | null>(null)
  const [relationships, setRelationships] = useState<Relationship[]>([])
  const [mythologyNames, setMythologyNames] = useState<Record<string, string>>({})
  const [relNames, setRelNames] = useState<Record<string, string>>({})
  const [linkedStories, setLinkedStories] = useState<Array<{ id: string; name: string }>>([])
  const [linkedPlaces, setLinkedPlaces] = useState<Array<{ id: string; name: string }>>([])
  const [linkedBeings, setLinkedBeings] = useState<Array<{ id: string; name: string }>>([])
  const [linkedMotifs, setLinkedMotifs] = useState<Array<{ id: string; name: string }>>([])
  const [linkedGroups, setLinkedGroups] = useState<Array<{ id: string; name: string }>>([])
  const [linkedObjects, setLinkedObjects] = useState<Array<{ id: string; name: string }>>([])
  const [notes, setNotes] = useState<Note[]>([])
  const [sources, setSources] = useState<SourceRef[]>([])
  const [relationMapSecondDegree, setRelationMapSecondDegree] = useState(false)
  const [relationMapFilterTypes, setRelationMapFilterTypes] = useState<EntityType[]>([])

  useEffect(() => {
    mythoDb.mythologies.getAll().then((list) => {
      const map: Record<string, string> = {}
      list.forEach((m) => { map[m.id] = m.name })
      setMythologyNames(map)
    })
  }, [])

  useEffect(() => {
    if (!entityType || !id) return
    const type = entityType as EntityType
    const store = STORE_MAP[type]
    if (!store) return
    Promise.all([
      store.getById(id) as Promise<ContentEntity | undefined>,
      getRelationshipsForEntity(type, id),
    ]).then(([e, rels]) => {
      setEntity(e ?? null)
      setRelationships(rels)
    })
  }, [entityType, id])

  useEffect(() => {
    if (!entity || relationships.length === 0) return
    const load = async () => {
      const names: Record<string, string> = {}
      for (const rel of relationships) {
        const isFrom = rel.fromEntityId === entity.id
        const targetType = isFrom ? rel.toEntityType : rel.fromEntityType
        const targetId = isFrom ? rel.toEntityId : rel.fromEntityId
        const store = STORE_MAP[targetType]
        if (store) {
          const e = await store.getById(targetId)
          names[`${rel.id}-${targetId}`] = e?.name ?? targetId
        }
      }
      setRelNames(names)
    }
    load()
  }, [relationships, entity?.id])

  useEffect(() => {
    if (!entity) return
    const loadLinked = async () => {
      const beingIds = (e: ContentEntity): string[] => {
        if ('beingIds' in e) return ((e as { beingIds?: string[] }).beingIds ?? [])
        if ('majorBeingIds' in e) return ((e as { majorBeingIds?: string[] }).majorBeingIds ?? [])
        return []
      }
      const storyIds = (e: ContentEntity): string[] => {
        if ('storyIds' in e) return e.storyIds ?? []
        if ('majorStoryIds' in e) return e.majorStoryIds ?? []
        return []
      }
      const placeIds = (e: ContentEntity): string[] => {
        if ('placeIds' in e) return e.placeIds ?? []
        if ('majorPlaceIds' in e) return e.majorPlaceIds ?? []
        return []
      }
      const motifIds = (e: ContentEntity): string[] => {
        if ('motifIds' in e) return e.motifIds ?? []
        if ('majorMotifIds' in e) return e.majorMotifIds ?? []
        return []
      }
      const groupIds = (e: ContentEntity): string[] => {
        if ('groupIds' in e && Array.isArray((e as { groupIds?: string[] }).groupIds)) return (e as { groupIds: string[] }).groupIds
        if ('majorGroupIds' in e && Array.isArray((e as { majorGroupIds?: string[] }).majorGroupIds)) return (e as { majorGroupIds: string[] }).majorGroupIds
        return []
      }
      const objectIds = (e: ContentEntity): string[] => {
        if ('objectIds' in e && Array.isArray((e as { objectIds?: string[] }).objectIds)) return (e as { objectIds: string[] }).objectIds
        if ('majorObjectIds' in e && Array.isArray((e as { majorObjectIds?: string[] }).majorObjectIds)) return (e as { majorObjectIds: string[] }).majorObjectIds
        return []
      }

      type EntityStore = { getById: (id: string) => Promise<{ id: string; name: string } | undefined> }
      const resolve = async (store: EntityStore, ids: string[]) => {
        const results = await Promise.all(ids.map((i) => store.getById(i)))
        return results.filter((e): e is { id: string; name: string } => !!e).map((e) => ({ id: e.id, name: e.name }))
      }
      const sIds = storyIds(entity)
      const pIds = placeIds(entity)
      const bIds = beingIds(entity)
      const mIds = motifIds(entity)
      const gIds = groupIds(entity)
      const oIds = objectIds(entity)

      const [stories, places, beings, motifs, groups, objects] = await Promise.all([
        resolve(mythoDb.stories, sIds),
        resolve(mythoDb.places, pIds),
        resolve(mythoDb.beings, bIds),
        resolve(mythoDb.motifs, mIds),
        resolve(mythoDb.groups, gIds),
        resolve(mythoDb.objects, oIds),
      ])
      setLinkedStories(stories)
      setLinkedPlaces(places)
      setLinkedBeings(beings)
      setLinkedMotifs(motifs)
      setLinkedGroups(groups)
      setLinkedObjects(objects)
    }
    loadLinked()
  }, [entity])

  useEffect(() => {
    if (!entity) return
    const loadNotesAndSources = async () => {
      const noteIds = entity.noteIds ?? []
      const sourceIds = entity.sourceRefIds ?? []
      const [n, s] = await Promise.all([
        Promise.all(noteIds.map((i) => mythoDb.notes.getById(i))),
        Promise.all(sourceIds.map((i) => mythoDb.sources.getById(i))),
      ])
      setNotes(n.filter(Boolean) as Note[])
      setSources(s.filter(Boolean) as SourceRef[])
    }
    loadNotesAndSources()
  }, [entity])

  if (!entity) return <div>Loading…</div>

  const getRelTargetName = (rel: Relationship) => {
    const isFrom = rel.fromEntityId === entity.id
    const targetId = isFrom ? rel.toEntityId : rel.fromEntityId
    return relNames[`${rel.id}-${targetId}`] ?? targetId
  }

  const getRelTargetLink = (rel: Relationship) => {
    const isFrom = rel.fromEntityId === entity.id
    const targetType = isFrom ? rel.toEntityType : rel.fromEntityType
    const targetId = isFrom ? rel.toEntityId : rel.fromEntityId
    return `/entities/${targetType}/${targetId}`
  }

  const isMythology = entity.entityType === 'mythology'
  const isCrossMyth = (r: Relationship) =>
    r.mythologyIds && r.mythologyIds.length >= 2
  const comparativeTypes = ['parallels', 'contrasts_with', 'counterpart_of', 'possible_equivalent_of', 'syncretized_with']
  const isComparative = (r: Relationship) => comparativeTypes.includes(r.relationType)

  const internalRels = relationships.filter((r) => !isComparative(r) && !isCrossMyth(r))
  const comparativeRels = relationships.filter((r) => isComparative(r) || isCrossMyth(r))

  const groupRels = (rels: Relationship[]) => {
    const g: Record<string, Relationship[]> = {}
    rels.forEach((r) => {
      const cat = getRelationCategory(r.relationType)
      if (!g[cat]) g[cat] = []
      g[cat].push(r)
    })
    return g
  }

  const renderTypeSpecific = () => {
    switch (entity.entityType) {
      case 'mythology': {
        const m = entity as MythologySystem
        return (
          <>
            {m.region && <p><strong>Region:</strong> {m.region}</p>}
            {m.cosmologySummary && (
              <section className="section">
                <h2 className="section-title">Cosmology</h2>
                <p>{m.cosmologySummary}</p>
              </section>
            )}
          </>
        )
      }
      case 'being': {
        const b = entity as Being
        return (
          <>
            {b.subtype && <p><strong>Type:</strong> {b.subtype}</p>}
            {b.domains?.length && <p><strong>Domains:</strong> {b.domains.join(', ')}</p>}
            {b.roles?.length && <p><strong>Roles:</strong> {b.roles.join(', ')}</p>}
            {b.epithets?.length && <p><strong>Epithets:</strong> {b.epithets.join(', ')}</p>}
            {b.originSummary && <p>{b.originSummary}</p>}
          </>
        )
      }
      case 'story': {
        const s = entity as Story
        return (
          <>
            {s.storyType && <p><strong>Type:</strong> {s.storyType}</p>}
            {s.themes?.length && <p><strong>Themes:</strong> {s.themes.join(', ')}</p>}
            {s.outcomeSummary && <p><strong>Outcome:</strong> {s.outcomeSummary}</p>}
          </>
        )
      }
      case 'place': {
        const p = entity as Place
        return (
          <>
            {p.subtype && <p><strong>Type:</strong> {p.subtype}</p>}
            {p.cosmologicalRole && <p><strong>Role:</strong> {p.cosmologicalRole}</p>}
          </>
        )
      }
      case 'motif': {
        const m = entity as Motif
        return (
          <>
            {m.category && <p><strong>Category:</strong> {m.category}</p>}
            {m.interpretation && <p>{m.interpretation}</p>}
          </>
        )
      }
      case 'group': {
        const g = entity as Group
        return <>{g.subtype && <p><strong>Type:</strong> {g.subtype}</p>}</>
      }
      case 'object': {
        const o = entity as ObjectEntity
        return (
          <>
            {o.subtype && <p><strong>Type:</strong> {o.subtype}</p>}
            {o.symbolicMeaning && <p><strong>Symbolism:</strong> {o.symbolicMeaning}</p>}
            {o.powers?.length && <p><strong>Powers:</strong> {o.powers.join(', ')}</p>}
          </>
        )
      }
      default:
        return null
    }
  }

  const LinkedPanel = ({
    title,
    items,
    type,
  }: {
    title: string
    items: Array<{ id: string; name: string }>
    type: EntityType
  }) =>
    items.length > 0 ? (
      <section className="section entity-detail-panel">
        <h2 className="section-title">{title}</h2>
        <div className="entity-detail-panel-grid">
          {items.map((e) => (
            <Link key={e.id} to={`/entities/${type}/${e.id}`} className="entity-detail-card">
              {e.name}
            </Link>
          ))}
        </div>
      </section>
    ) : null

  const hasLinkedContent =
    linkedStories.length > 0 ||
    linkedPlaces.length > 0 ||
    linkedBeings.length > 0 ||
    linkedMotifs.length > 0 ||
    linkedGroups.length > 0 ||
    linkedObjects.length > 0

  return (
    <div className="entity-detail-page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div>
          <span className="badge">{getEntityTypeLabel(entity.entityType)}</span>
          <h1 style={{ marginTop: '0.25rem' }}>{entity.name}</h1>
        </div>
        {!isMythology && (
          <Link to={`/entities/${entity.entityType}/${entity.id}/edit`} className="btn">Edit</Link>
        )}
      </div>
      {entity.alternateNames?.length && (
        <p className="muted small">Also: {entity.alternateNames.join(', ')}</p>
      )}
      {entity.mythologyIds?.length && (
        <p className="muted">
          {entity.mythologyIds.map((mid) => mythologyNames[mid] ?? mid).join(', ')}
        </p>
      )}

      {entity.summary && (
        <section className="section">
          <p>{entity.summary}</p>
        </section>
      )}

      {renderTypeSpecific()}

      {entity.description && (
        <section className="section">
          <h2 className="section-title">Description</h2>
          <p>{entity.description}</p>
        </section>
      )}

      {!isMythology && (
        <section className="section">
          <h2 className="section-title">Relation Map</h2>
          <p className="muted small">Trace connections. Click a node to navigate.</p>
          <RelationMap
            entity={entity}
            relationships={relationships}
            includeSecondDegree={relationMapSecondDegree}
            filterTypes={relationMapFilterTypes}
            onIncludeSecondDegreeChange={setRelationMapSecondDegree}
            onFilterTypesChange={setRelationMapFilterTypes}
          />
        </section>
      )}

      {hasLinkedContent && (
        <section className="section entity-detail-linked">
          <h2 className="section-title">Linked entities</h2>
          <div className="entity-detail-linked-grid">
            <LinkedPanel title="Stories" items={linkedStories} type="story" />
            <LinkedPanel title="Places" items={linkedPlaces} type="place" />
            <LinkedPanel title="Beings" items={linkedBeings} type="being" />
            <LinkedPanel title="Motifs" items={linkedMotifs} type="motif" />
            <LinkedPanel title="Groups" items={linkedGroups} type="group" />
            <LinkedPanel title="Objects" items={linkedObjects} type="object" />
          </div>
        </section>
      )}

      {internalRels.length > 0 && (
        <section className="section entity-detail-relationships entity-detail-internal">
          <h2 className="section-title">Relationships (within mythology)</h2>
          {Object.entries(groupRels(internalRels)).map(([cat, rels]) => (
            <div key={cat} className="connection-group">
              <h3 className="connection-group-title">{CATEGORY_LABELS[cat] ?? cat}</h3>
              <ul className="entity-list">
                {rels.map((rel) => (
                  <li key={rel.id}>
                    <span>{rel.relationType.replace(/_/g, ' ')}</span>
                    {' → '}
                    <Link to={getRelTargetLink(rel)}>{getRelTargetName(rel)}</Link>
                    {rel.certainty !== 'direct' && (
                      <span className="muted small"> ({rel.certainty})</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>
      )}

      {comparativeRels.length > 0 && (
        <section className="section entity-detail-relationships entity-detail-comparative">
          <h2 className="section-title">Cross-mythology & comparative links</h2>
          <p className="muted small">Parallels, counterparts, and cross-tradition comparisons. Certainty labels indicate reliability.</p>
          <ul className="entity-list">
            {comparativeRels.map((rel) => (
              <li key={rel.id}>
                <span>{rel.relationType.replace(/_/g, ' ')}</span>
                {' → '}
                <Link to={getRelTargetLink(rel)}>{getRelTargetName(rel)}</Link>
                <span className="certainty-badge" data-certainty={rel.certainty}>
                  {rel.certainty.replace(/_/g, ' ')}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {(notes.length > 0 || sources.length > 0) && (
        <section className="section entity-detail-research">
          <h2 className="section-title">Research workspace</h2>
          <div className="entity-detail-research-grid">
            {notes.length > 0 && (
              <div className="entity-detail-panel">
                <h3 className="section-title">Interpretations</h3>
                <div className="entity-detail-note-cards">
                  {notes.map((n) => (
                    <Link key={n.id} to={`/notes/${n.id}`} className="entity-detail-card entity-detail-note-card">
                      <span className="entity-detail-card-title">{n.title}</span>
                      <span className="badge entity-detail-card-badge">{n.noteType}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
            {sources.length > 0 && (
              <div className="entity-detail-panel">
                <h3 className="section-title">Canon</h3>
                <div className="entity-detail-source-cards">
                  {sources.map((s) => (
                    <Link key={s.id} to={`/sources/${s.id}`} className="entity-detail-card entity-detail-source-card">
                      <span className="entity-detail-card-title">{s.title}</span>
                      {(s.authorOrTradition || s.sourceType) && (
                        <span className="muted small">
                          {[s.authorOrTradition, s.sourceType].filter(Boolean).join(' · ')}
                        </span>
                      )}
                      {s.reliability && (
                        <span className="entity-detail-source-reliability" data-reliability={s.reliability}>
                          {s.reliability}
                        </span>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  )
}
