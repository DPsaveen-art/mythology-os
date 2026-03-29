import { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { mythoDb } from '../services/db'
import { searchAll } from '../services/search'
import { getEntityTypeLabel } from '../types/entity'
import type { ContentEntity, EntityType } from '../types'

const ENTITY_TYPES: EntityType[] = ['mythology', 'being', 'story', 'place', 'motif', 'group', 'object']

const STORE_MAP = {
  mythology: mythoDb.mythologies,
  being: mythoDb.beings,
  story: mythoDb.stories,
  place: mythoDb.places,
  motif: mythoDb.motifs,
  group: mythoDb.groups,
  object: mythoDb.objects,
} as const

export function Explorer() {
  const [searchParams] = useSearchParams()
  const q = searchParams.get('q') ?? ''
  const typeFilter = (searchParams.get('type') ?? 'all') as EntityType | 'all'
  const mythologyFilter = searchParams.get('mythology') ?? 'all'

  const [activeTab, setActiveTab] = useState<EntityType | 'all'>(typeFilter === 'all' ? 'all' : typeFilter)
  const [results, setResults] = useState<ContentEntity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setActiveTab(typeFilter === 'all' ? 'all' : typeFilter)
  }, [typeFilter])

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      if (q.trim()) {
        const sr = await searchAll(q)
        const filtered = typeFilter !== 'all'
          ? sr.filter((r) => r.entityType === typeFilter)
          : sr
        const entities = filtered
          .filter((r) => 'entityType' in r.entity && r.entity.entityType)
          .map((r) => r.entity as ContentEntity)
        setResults(entities)
      } else {
        const typesToLoad = activeTab === 'all' ? ENTITY_TYPES : [activeTab]
        const allItems: ContentEntity[] = []
        for (const t of typesToLoad) {
          const store = STORE_MAP[t as keyof typeof STORE_MAP]
          if (store) {
            const items = await store.getAll()
            allItems.push(...items)
          }
        }
        let filtered = allItems
        if (mythologyFilter !== 'all') {
          filtered = allItems.filter((e) => e.mythologyIds?.includes(mythologyFilter))
        }
        setResults(filtered)
      }
      setLoading(false)
    }
    load()
  }, [q, activeTab, mythologyFilter])

  const editableTypes: EntityType[] = ['being', 'story', 'place', 'motif', 'group', 'object']

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div>
          <h1>Codex</h1>
          <p className="muted">Browse mythological systems, beings, stories, and symbolic structures</p>
        </div>
        <details className="new-entity-dropdown">
          <summary className="btn btn-primary">New entity</summary>
          <div className="new-entity-menu">
            {editableTypes.map((t) => (
              <Link key={t} to={`/entities/${t}/new`}>{getEntityTypeLabel(t)}</Link>
            ))}
          </div>
        </details>
      </div>

      <div className="tabs">
        <button
          className={`tab ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          All
        </button>
        {ENTITY_TYPES.map((t) => (
          <button
            key={t}
            className={`tab ${activeTab === t ? 'active' : ''}`}
            onClick={() => setActiveTab(t)}
          >
            {getEntityTypeLabel(t)}
          </button>
        ))}
      </div>

      {loading ? (
        <p>Loading…</p>
      ) : (
        <div className="card-grid">
          {results.map((entity) => (
            <Link
              key={entity.id}
              to={`/entities/${entity.entityType}/${entity.id}`}
              className="card-link"
            >
              <div className="card">
                <span className="badge">{getEntityTypeLabel(entity.entityType)}</span>
                <h3 style={{ marginTop: '0.5rem' }}>{entity.name}</h3>
                {entity.summary && (
                  <p className="muted small" style={{ marginTop: '0.25rem' }}>
                    {entity.summary.slice(0, 80)}…
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}

      {!loading && results.length === 0 && (
        <p className="muted">No entities found. Try adjusting filters or search.</p>
      )}
    </div>
  )
}
