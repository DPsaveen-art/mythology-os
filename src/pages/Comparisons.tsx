import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { mythoDb } from '../services/db'
import { getEntityTypeLabel } from '../types/entity'
import type {
  MythologySystem,
  ContentEntity,
  Motif,
  Relationship,
  Being,
  Story,
} from '../types'

type CompareMode = 'mythology' | 'entity' | 'motif'

const CERTAINTY_LABELS: Record<string, string> = {
  direct: 'Direct',
  strong_inference: 'Strong inference',
  tentative: 'Tentative parallel',
  disputed: 'Disputed',
  symbolic: 'Symbolic',
  later_tradition: 'Later tradition',
}

export function Comparisons() {
  const [mode, setMode] = useState<CompareMode>('mythology')
  const [mythologies, setMythologies] = useState<MythologySystem[]>([])
  const [entities, setEntities] = useState<ContentEntity[]>([])
  const [motifs, setMotifs] = useState<Motif[]>([])

  const [mythA, setMythA] = useState<string>('')
  const [mythB, setMythB] = useState<string>('')
  const [entityA, setEntityA] = useState<string>('')
  const [entityB, setEntityB] = useState<string>('')
  const [motifId, setMotifId] = useState<string>('')

  useEffect(() => {
    const load = async () => {
      const [myths, beings, stories, places, motifsList, groups, objects, motifsData] = await Promise.all([
        mythoDb.mythologies.getAll(),
        mythoDb.beings.getAll(),
        mythoDb.stories.getAll(),
        mythoDb.places.getAll(),
        mythoDb.motifs.getAll(),
        mythoDb.groups.getAll(),
        mythoDb.objects.getAll(),
        mythoDb.motifs.getAll(),
      ])
      setMythologies(myths)
      setMotifs(motifsData)
      setEntities([...beings, ...stories, ...places, ...motifsList, ...groups, ...objects])
    }
    load()
  }, [])

  return (
    <div>
      <h1>Parallels</h1>
      <p className="muted">Explore narrative structures and symbolic motifs across traditions</p>

      <section className="section">
        <h2 className="section-title">Comparison mode</h2>
        <div className="tabs">
          <button className={`tab ${mode === 'mythology' ? 'active' : ''}`} onClick={() => setMode('mythology')}>
            Mythology ↔ Mythology
          </button>
          <button className={`tab ${mode === 'entity' ? 'active' : ''}`} onClick={() => setMode('entity')}>
            Entity ↔ Entity
          </button>
          <button className={`tab ${mode === 'motif' ? 'active' : ''}`} onClick={() => setMode('motif')}>
            Motif-centered
          </button>
        </div>
      </section>

      {mode === 'mythology' && (
        <MythologyComparison mythologies={mythologies} mythA={mythA} mythB={mythB} onMythAChange={setMythA} onMythBChange={setMythB} />
      )}
      {mode === 'entity' && (
        <EntityComparison entities={entities} entityA={entityA} entityB={entityB} onEntityAChange={setEntityA} onEntityBChange={setEntityB} />
      )}
      {mode === 'motif' && <MotifComparison motifs={motifs} motifId={motifId} onMotifChange={setMotifId} />}
    </div>
  )
}

function MythologyComparison({
  mythologies,
  mythA,
  mythB,
  onMythAChange,
  onMythBChange,
}: {
  mythologies: MythologySystem[]
  mythA: string
  mythB: string
  onMythAChange: (v: string) => void
  onMythBChange: (v: string) => void
}) {
  const [comparativeRels, setComparativeRels] = useState<Relationship[]>([])
  const [motifsByMyth, setMotifsByMyth] = useState<Record<string, Motif[]>>({})
  const [names, setNames] = useState<Record<string, string>>({})

  useEffect(() => {
    const load = async () => {
      const [rels, motifList, mythList, beings, stories, places, groups, objects] = await Promise.all([
        mythoDb.relationships.getAll(),
        mythoDb.motifs.getAll(),
        mythoDb.mythologies.getAll(),
        mythoDb.beings.getAll(),
        mythoDb.stories.getAll(),
        mythoDb.places.getAll(),
        mythoDb.groups.getAll(),
        mythoDb.objects.getAll(),
      ])
      const comparative = rels.filter(
        (r) =>
          (r.mythologyIds?.length ?? 0) >= 2 ||
          ['parallels', 'contrasts_with', 'counterpart_of', 'possible_equivalent_of', 'syncretized_with'].includes(r.relationType)
      )
      setComparativeRels(comparative)

      const byMyth: Record<string, Motif[]> = {}
      motifList.forEach((m) => {
        (m.mythologyIds ?? []).forEach((mid) => {
          if (!byMyth[mid]) byMyth[mid] = []
          byMyth[mid].push(m)
        })
      })
      setMotifsByMyth(byMyth)

      const nameMap: Record<string, string> = {}
      ;[mythList, beings, stories, places, motifList, groups, objects].flat().forEach((e: { id: string; name: string }) => {
        nameMap[e.id] = e.name
      })
      setNames(nameMap)
    }
    load()
  }, [])

  const m1 = mythologies.find((m) => m.id === mythA)
  const m2 = mythologies.find((m) => m.id === mythB)

  const relevantRels = comparativeRels.filter((r) => {
    if (!mythA && !mythB) return true
    const inA = mythA && r.mythologyIds?.includes(mythA)
    const inB = mythB && r.mythologyIds?.includes(mythB)
    if (mythA && mythB) return inA && inB
    if (mythA) return inA
    if (mythB) return inB
    return false
  })

  const sharedMotifs = mythA && mythB
    ? (motifsByMyth[mythA] ?? []).filter((ma) => (motifsByMyth[mythB] ?? []).some((mb) => mb.id === ma.id))
    : []

  const relsByCertainty = relevantRels.reduce<Record<string, Relationship[]>>((acc, r) => {
    const key = r.certainty
    if (!acc[key]) acc[key] = []
    acc[key].push(r)
    return acc
  }, {})

  return (
    <>
      <section className="section">
        <div className="comparison-selectors">
          <div className="form-group">
            <label>First mythology</label>
            <select value={mythA} onChange={(e) => onMythAChange(e.target.value)} className="form-input">
              <option value="">Select…</option>
              {mythologies.map((m) => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>
          <span className="comparison-vs">↔</span>
          <div className="form-group">
            <label>Second mythology</label>
            <select value={mythB} onChange={(e) => onMythBChange(e.target.value)} className="form-input">
              <option value="">Select…</option>
              {mythologies.map((m) => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {m1 && (
        <section className="section comparison-side">
          <h2 className="section-title">{m1.name}</h2>
          <p className="muted small">{m1.region} · {m1.historicalPeriod}</p>
          {m1.centralThemes?.length && <p><strong>Themes:</strong> {m1.centralThemes.join(', ')}</p>}
          {m1.cosmologySummary && <p className="small">{m1.cosmologySummary.slice(0, 150)}…</p>}
        </section>
      )}

      {m2 && (
        <section className="section comparison-side">
          <h2 className="section-title">{m2.name}</h2>
          <p className="muted small">{m2.region} · {m2.historicalPeriod}</p>
          {m2.centralThemes?.length && <p><strong>Themes:</strong> {m2.centralThemes.join(', ')}</p>}
          {m2.cosmologySummary && <p className="small">{m2.cosmologySummary.slice(0, 150)}…</p>}
        </section>
      )}

      {mythA && mythB && sharedMotifs.length > 0 && (
        <section className="section">
          <h2 className="section-title">Shared motifs</h2>
          <ul className="entity-list">
            {sharedMotifs.map((m) => (
              <li key={m.id}><Link to={`/entities/motif/${m.id}`}>{m.name}</Link></li>
            ))}
          </ul>
        </section>
      )}

      <section className="section">
        <h2 className="section-title">Cross-mythology parallels</h2>
        <p className="muted small">Distinguished by certainty level</p>
        {relevantRels.length === 0 ? (
          <p className="muted">No comparative relationships. Add parallels in Web of Relations.</p>
        ) : (
          Object.entries(relsByCertainty).map(([certainty, rels]) => (
            <div key={certainty} className="comparison-certainty-block">
              <h3 className="comparison-certainty-title">
                {CERTAINTY_LABELS[certainty] ?? certainty}
                {(certainty === 'tentative' || certainty === 'disputed') && (
                  <span className="caution-label"> — use with caution</span>
                )}
              </h3>
              <ul className="entity-list">
                {rels.map((r) => (
                  <li key={r.id}>
                    <Link to={`/entities/${r.fromEntityType}/${r.fromEntityId}`}>{names[r.fromEntityId] ?? r.fromEntityId}</Link>
                    {' '}<span className="relation-type">{r.relationType.replace(/_/g, ' ')}</span>{' '}
                    <Link to={`/entities/${r.toEntityType}/${r.toEntityId}`}>{names[r.toEntityId] ?? r.toEntityId}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))
        )}
      </section>
    </>
  )
}

function EntityComparison({
  entities,
  entityA,
  entityB,
  onEntityAChange,
  onEntityBChange,
}: {
  entities: ContentEntity[]
  entityA: string
  entityB: string
  onEntityAChange: (v: string) => void
  onEntityBChange: (v: string) => void
}) {
  const [relsA, setRelsA] = useState<Relationship[]>([])
  const [relsB, setRelsB] = useState<Relationship[]>([])
  const [names, setNames] = useState<Record<string, string>>({})
  const [comparativeBetween, setComparativeBetween] = useState<Relationship[]>([])

  useEffect(() => {
    const load = async () => {
      const all = await mythoDb.relationships.getAll()
      const nameMap: Record<string, string> = {}
      const stores = [mythoDb.mythologies, mythoDb.beings, mythoDb.stories, mythoDb.places, mythoDb.motifs, mythoDb.groups, mythoDb.objects]
      for (const s of stores) {
        const items = await s.getAll()
        items.forEach((e: { id: string; name: string }) => { nameMap[e.id] = e.name })
      }
      setNames(nameMap)
      if (entityA) setRelsA(all.filter((r) => r.fromEntityId === entityA || r.toEntityId === entityA))
      else setRelsA([])
      if (entityB) setRelsB(all.filter((r) => r.fromEntityId === entityB || r.toEntityId === entityB))
      else setRelsB([])
      if (entityA && entityB) {
        setComparativeBetween(all.filter(
          (r) =>
            (r.fromEntityId === entityA && r.toEntityId === entityB) ||
            (r.fromEntityId === entityB && r.toEntityId === entityA)
        ))
      } else setComparativeBetween([])
    }
    load()
  }, [entityA, entityB])

  const e1 = entities.find((e) => e.id === entityA)
  const e2 = entities.find((e) => e.id === entityB)

  const comparativeRelsA = relsA.filter((r) =>
    ['parallels', 'contrasts_with', 'counterpart_of', 'possible_equivalent_of', 'syncretized_with'].includes(r.relationType)
  )
  const comparativeRelsB = relsB.filter((r) =>
    ['parallels', 'contrasts_with', 'counterpart_of', 'possible_equivalent_of', 'syncretized_with'].includes(r.relationType)
  )

  return (
    <>
      <section className="section">
        <div className="comparison-selectors">
          <div className="form-group">
            <label>First entity</label>
            <select value={entityA} onChange={(e) => onEntityAChange(e.target.value)} className="form-input">
              <option value="">Select…</option>
              {entities.map((e) => (
                <option key={e.id} value={e.id}>{e.name} ({e.entityType})</option>
              ))}
            </select>
          </div>
          <span className="comparison-vs">↔</span>
          <div className="form-group">
            <label>Second entity</label>
            <select value={entityB} onChange={(e) => onEntityBChange(e.target.value)} className="form-input">
              <option value="">Select…</option>
              {entities.map((e) => (
                <option key={e.id} value={e.id}>{e.name} ({e.entityType})</option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {comparativeBetween.length > 0 && (
        <section className="section">
          <h2 className="section-title">Direct links between entities</h2>
          <ul className="entity-list">
            {comparativeBetween.map((r) => (
              <li key={r.id}>
                <Link to={`/entities/${r.fromEntityType}/${r.fromEntityId}`}>{names[r.fromEntityId] ?? r.fromEntityId}</Link>
                {' '}<span className="relation-type">{r.relationType.replace(/_/g, ' ')}</span>{' '}
                <Link to={`/entities/${r.toEntityType}/${r.toEntityId}`}>{names[r.toEntityId] ?? r.toEntityId}</Link>
                <span className={`certainty-badge ${r.certainty !== 'direct' ? 'caution' : ''}`} data-certainty={r.certainty}>
                  {CERTAINTY_LABELS[r.certainty] ?? r.certainty}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {e1 && e2 && (
        <div className="comparison-grid">
          <section className="section comparison-side">
            <h2 className="section-title">{e1.name}</h2>
            {(e1 as Being).domains?.length ? (
              <p><strong>Domains:</strong> {(e1 as Being).domains?.join(', ') ?? ''}</p>
            ) : null}
            {(e1 as Being).roles?.length ? (
              <p><strong>Roles:</strong> {(e1 as Being).roles?.join(', ') ?? ''}</p>
            ) : null}
            {(e1 as Story).themes?.length ? (
              <p><strong>Themes:</strong> {(e1 as Story).themes?.join(', ') ?? ''}</p>
            ) : null}
            <h3 className="section-title">Relationships</h3>
            <ul className="entity-list">
              {relsA.slice(0, 8).map((r) => {
                const otherId = r.fromEntityId === entityA ? r.toEntityId : r.fromEntityId
                const otherType = r.fromEntityId === entityA ? r.toEntityType : r.fromEntityType
                return (
                  <li key={r.id}>
                    <span className="relation-type">{r.relationType.replace(/_/g, ' ')}</span>{' '}
                    <Link to={`/entities/${otherType}/${otherId}`}>{names[otherId] ?? otherId}</Link>
                  </li>
                )
              })}
            </ul>
            {comparativeRelsA.length > 0 && (
              <>
                <h3 className="section-title">Comparative links</h3>
                <ul className="entity-list">
                  {comparativeRelsA.map((r) => (
                    <li key={r.id}>
                      <Link to={r.fromEntityId === entityA ? `/entities/${r.toEntityType}/${r.toEntityId}` : `/entities/${r.fromEntityType}/${r.fromEntityId}`}>
                        {names[r.fromEntityId === entityA ? r.toEntityId : r.fromEntityId] ?? (r.fromEntityId === entityA ? r.toEntityId : r.fromEntityId)}
                      </Link>
                      <span className="caution-label"> ({r.relationType.replace(/_/g, ' ')})</span>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </section>
          <section className="section comparison-side">
            <h2 className="section-title">{e2.name}</h2>
            {(e2 as Being).domains?.length ? (
              <p><strong>Domains:</strong> {(e2 as Being).domains?.join(', ') ?? ''}</p>
            ) : null}
            {(e2 as Being).roles?.length ? (
              <p><strong>Roles:</strong> {(e2 as Being).roles?.join(', ') ?? ''}</p>
            ) : null}
            {(e2 as Story).themes?.length ? (
              <p><strong>Themes:</strong> {(e2 as Story).themes?.join(', ') ?? ''}</p>
            ) : null}
            <h3 className="section-title">Relationships</h3>
            <ul className="entity-list">
              {relsB.slice(0, 8).map((r) => {
                const otherId = r.fromEntityId === entityB ? r.toEntityId : r.fromEntityId
                const otherType = r.fromEntityId === entityB ? r.toEntityType : r.fromEntityType
                return (
                  <li key={r.id}>
                    <span className="relation-type">{r.relationType.replace(/_/g, ' ')}</span>{' '}
                    <Link to={`/entities/${otherType}/${otherId}`}>{names[otherId] ?? otherId}</Link>
                  </li>
                )
              })}
            </ul>
            {comparativeRelsB.length > 0 && (
              <>
                <h3 className="section-title">Comparative links</h3>
                <ul className="entity-list">
                  {comparativeRelsB.map((r) => (
                    <li key={r.id}>
                      <Link to={r.fromEntityId === entityB ? `/entities/${r.toEntityType}/${r.toEntityId}` : `/entities/${r.fromEntityType}/${r.fromEntityId}`}>
                        {names[r.fromEntityId === entityB ? r.toEntityId : r.fromEntityId] ?? (r.fromEntityId === entityB ? r.toEntityId : r.fromEntityId)}
                      </Link>
                      <span className="caution-label"> ({r.relationType.replace(/_/g, ' ')})</span>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </section>
        </div>
      )}
    </>
  )
}

function MotifComparison({
  motifs,
  motifId,
  onMotifChange,
}: {
  motifs: Motif[]
  motifId: string
  onMotifChange: (v: string) => void
}) {
  const [motif, setMotif] = useState<Motif | null>(null)
  const [linkedByType, setLinkedByType] = useState<Record<string, Array<{ id: string; name: string }>>>({})
  const [byMythology, setByMythology] = useState<Record<string, Array<{ id: string; name: string; type: string }>>>({})
  const [mythologyNames, setMythologyNames] = useState<Record<string, string>>({})
  const [relatedMotifs, setRelatedMotifs] = useState<Motif[]>([])

  useEffect(() => {
    if (!motifId) {
      setMotif(null)
      setLinkedByType({})
      setByMythology({})
      setRelatedMotifs([])
      return
    }
    const load = async () => {
      const [m, myths, beings, stories, places, groups, objects] = await Promise.all([
        mythoDb.motifs.getById(motifId),
        mythoDb.mythologies.getAll(),
        mythoDb.beings.getAll(),
        mythoDb.stories.getAll(),
        mythoDb.places.getAll(),
        mythoDb.groups.getAll(),
        mythoDb.objects.getAll(),
      ])
      const mot = m ?? motifs.find((mo) => mo.id === motifId)
      setMotif(mot ?? null)
      if (!mot) return

      const mn: Record<string, string> = {}
      myths.forEach((x) => { mn[x.id] = x.name })
      setMythologyNames(mn)

      const storeList: Array<{ getById: (id: string) => Promise<{ id: string; name: string } | undefined>; type: string }> = [
        { getById: mythoDb.beings.getById.bind(mythoDb.beings), type: 'being' },
        { getById: mythoDb.stories.getById.bind(mythoDb.stories), type: 'story' },
        { getById: mythoDb.places.getById.bind(mythoDb.places), type: 'place' },
        { getById: mythoDb.groups.getById.bind(mythoDb.groups), type: 'group' },
        { getById: mythoDb.objects.getById.bind(mythoDb.objects), type: 'object' },
      ]

      const allIds = [...(mot.beingIds ?? []), ...(mot.storyIds ?? []), ...(mot.placeIds ?? []), ...(mot.groupIds ?? []), ...(mot.objectIds ?? [])]
      const linked: Record<string, Array<{ id: string; name: string }>> = { being: [], story: [], place: [], group: [], object: [] }
      const byMyth: Record<string, Array<{ id: string; name: string; type: string }>> = {}
      const fullEntities = [...beings, ...stories, ...places, ...groups, ...objects] as Array<{ id: string; name: string; mythologyIds?: string[] }>

      for (const id of allIds) {
        for (const { getById, type } of storeList) {
          const e = await getById(id)
          if (e) {
            linked[type].push({ id: e.id, name: e.name })
            const ent = fullEntities.find((x) => x.id === id)
            ;(ent?.mythologyIds ?? []).forEach((mid) => {
              if (!byMyth[mid]) byMyth[mid] = []
              if (!byMyth[mid].some((x) => x.id === id)) byMyth[mid].push({ id: e.id, name: e.name, type })
            })
            break
          }
        }
      }

      setLinkedByType(linked)
      setByMythology(byMyth)

      const related = await Promise.all((mot.relatedMotifIds ?? []).map((rid) => mythoDb.motifs.getById(rid)))
      setRelatedMotifs(related.filter(Boolean) as Motif[])
    }
    load()
  }, [motifId, motifs])

  return (
    <>
      <section className="section">
        <div className="form-group">
          <label>Select motif</label>
          <select value={motifId} onChange={(e) => onMotifChange(e.target.value)} className="form-input">
            <option value="">Select…</option>
            {motifs.map((m) => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
        </div>
      </section>

      {motif && (
        <>
          <section className="section">
            <h2 className="section-title">{motif.name}</h2>
            <p className="muted small">{motif.category}</p>
            {motif.summary && <p>{motif.summary}</p>}
            {motif.interpretation && <p><strong>Interpretation:</strong> {motif.interpretation}</p>}
          </section>

          <section className="section">
            <h2 className="section-title">By entity type</h2>
            {(['being', 'story', 'place', 'group', 'object'] as const).map((t) => {
              const items = linkedByType[t] ?? []
              if (items.length === 0) return null
              return (
                  <div key={t} className="comparison-motive-block">
                    <h3>{getEntityTypeLabel(t)}s</h3>
                    <ul className="entity-list">
                      {items.map((e) => (
                        <li key={e.id}>
                          <Link to={`/entities/${t}/${e.id}`}>{e.name}</Link>
                        </li>
                      ))}
                    </ul>
                  </div>
              )
            })}
          </section>

          <section className="section">
            <h2 className="section-title">By mythology</h2>
            {Object.entries(byMythology).map(
              ([mid, items]) =>
                items.length > 0 && (
                  <div key={mid} className="comparison-motive-block">
                    <h3>{mythologyNames[mid] ?? mid}</h3>
                    <ul className="entity-list">
                      {items.map((e) => (
                        <li key={`${e.id}-${e.type}`}>
                          <Link to={`/entities/${e.type}/${e.id}`}>{e.name}</Link>
                          <span className="muted small"> ({e.type})</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )
            )}
          </section>

          {relatedMotifs.length > 0 && (
            <section className="section">
              <h2 className="section-title">Related motifs</h2>
              <ul className="entity-list">
                {relatedMotifs.map((m) => (
                  <li key={m.id}><Link to={`/entities/motif/${m.id}`}>{m.name}</Link></li>
                ))}
              </ul>
            </section>
          )}
        </>
      )}
    </>
  )
}
