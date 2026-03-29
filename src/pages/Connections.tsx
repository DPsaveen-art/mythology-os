import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { mythoDb } from '../services/db'
import { getRelationshipsByMythology } from '../services/relationships'
import { CATEGORY_LABELS, getRelationCategory } from '../utils/relationshipCategories'
import type { Relationship, MythologySystem } from '../types'

const ENTITY_TYPES = ['being', 'story', 'place', 'motif', 'group', 'object', 'mythology'] as const
const CERTAINTIES = ['direct', 'strong_inference', 'tentative', 'disputed', 'symbolic', 'later_tradition'] as const

export function Connections() {
  const [mythologies, setMythologies] = useState<MythologySystem[]>([])
  const [relationships, setRelationships] = useState<Relationship[]>([])
  const [entityNames, setEntityNames] = useState<Record<string, string>>({})

  const [filterMythology, setFilterMythology] = useState<string>('')
  const [filterRelationType, setFilterRelationType] = useState<string>('')
  const [filterCertainty, setFilterCertainty] = useState<string>('')
  const [filterEntityType, setFilterEntityType] = useState<string>('')
  const [allRelationTypes, setAllRelationTypes] = useState<string[]>([])

  useEffect(() => {
    mythoDb.mythologies.getAll().then(setMythologies)
  }, [])

  useEffect(() => {
    mythoDb.relationships.getAll().then((all) => {
      setAllRelationTypes(Array.from(new Set(all.map((r) => r.relationType))).sort())
    })
  }, [])

  useEffect(() => {
    const load = async () => {
      let all = filterMythology
        ? await getRelationshipsByMythology(filterMythology)
        : await mythoDb.relationships.getAll()

      if (filterRelationType) {
        all = all.filter((r) => r.relationType === filterRelationType)
      }
      if (filterCertainty) {
        all = all.filter((r) => r.certainty === filterCertainty)
      }
      if (filterEntityType) {
        all = all.filter((r) =>
          r.fromEntityType === filterEntityType || r.toEntityType === filterEntityType
        )
      }

      setRelationships(all)

      const ids = new Set<string>()
      all.forEach((r) => {
        ids.add(r.fromEntityId)
        ids.add(r.toEntityId)
      })
      const names: Record<string, string> = {}
      const stores = [
        mythoDb.mythologies,
        mythoDb.beings,
        mythoDb.stories,
        mythoDb.places,
        mythoDb.motifs,
        mythoDb.groups,
        mythoDb.objects,
      ]
      for (const store of stores) {
        const items = await store.getAll()
        items.forEach((e: { id: string; name: string }) => { names[e.id] = e.name })
      }
      setEntityNames(names)
    }
    load()
  }, [filterMythology, filterRelationType, filterCertainty, filterEntityType])

  const getName = (id: string) => entityNames[id] ?? id

  const grouped = relationships.reduce<Record<string, Relationship[]>>((acc, r) => {
    const cat = getRelationCategory(r.relationType)
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(r)
    return acc
  }, {})

  const categoryOrder = ['kinship', 'membership', 'rule_dwelling', 'narrative', 'spatial', 'symbolic', 'other']
  const sortedCategories = categoryOrder.filter((c) => grouped[c]?.length)

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div>
          <h1>Web of Relations</h1>
          <p className="muted">Trace relationships between beings, stories, places, and motifs</p>
        </div>
        <Link to="/connections/new" className="btn btn-primary">New relationship</Link>
      </div>

      <section className="section">
        <h2 className="section-title">Filters</h2>
        <div className="filters-row">
          <div className="filter-group">
            <label>Mythology</label>
            <select
              value={filterMythology}
              onChange={(e) => setFilterMythology(e.target.value)}
              className="form-input"
              style={{ minWidth: 140 }}
            >
              <option value="">All</option>
              {mythologies.map((m) => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>
          <div className="filter-group">
            <label>Relation type</label>
            <select
              value={filterRelationType}
              onChange={(e) => setFilterRelationType(e.target.value)}
              className="form-input"
              style={{ minWidth: 180 }}
            >
              <option value="">All</option>
              {allRelationTypes.map((rt) => (
                <option key={rt} value={rt}>{rt.replace(/_/g, ' ')}</option>
              ))}
            </select>
          </div>
          <div className="filter-group">
            <label>Certainty</label>
            <select
              value={filterCertainty}
              onChange={(e) => setFilterCertainty(e.target.value)}
              className="form-input"
              style={{ minWidth: 140 }}
            >
              <option value="">All</option>
              {CERTAINTIES.map((c) => (
                <option key={c} value={c}>{c.replace(/_/g, ' ')}</option>
              ))}
            </select>
          </div>
          <div className="filter-group">
            <label>Entity type</label>
            <select
              value={filterEntityType}
              onChange={(e) => setFilterEntityType(e.target.value)}
              className="form-input"
              style={{ minWidth: 120 }}
            >
              <option value="">All</option>
              {ENTITY_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>
      </section>

      <section className="section">
        <p className="muted small">{relationships.length} relationship(s)</p>

        {sortedCategories.map((cat) => (
          <div key={cat} className="connection-group">
            <h3 className="connection-group-title">{CATEGORY_LABELS[cat] ?? cat}</h3>
            <ul className="entity-list">
              {(grouped[cat] ?? []).map((r) => (
                <li key={r.id} className="connection-item">
                  <span className="connection-link">
                    <Link to={`/entities/${r.fromEntityType}/${r.fromEntityId}`}>
                      {getName(r.fromEntityId)}
                    </Link>
                    {' '}
                    <span className="relation-type">{r.relationType.replace(/_/g, ' ')}</span>
                    {' '}
                    <Link to={`/entities/${r.toEntityType}/${r.toEntityId}`}>
                      {getName(r.toEntityId)}
                    </Link>
                    {r.certainty !== 'direct' && (
                      <span className="certainty-badge" data-certainty={r.certainty}>
                        {r.certainty.replace(/_/g, ' ')}
                      </span>
                    )}
                  </span>
                  <Link to={`/relationships/${r.id}/edit`} className="connection-edit">Edit</Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        {relationships.length === 0 && (
          <p className="muted">No relationships match the filters.</p>
        )}
      </section>
    </div>
  )
}
