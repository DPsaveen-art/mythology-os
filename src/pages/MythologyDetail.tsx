import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { mythoDb } from '../services/db'
import { getEntityTypePlural } from '../types/entity'
import type { MythologySystem, ContentEntity, EntityType } from '../types'

export function MythologyDetail() {
  const { id } = useParams<{ id: string }>()
  const [myth, setMyth] = useState<MythologySystem | null>(null)
  const [beings, setBeings] = useState<ContentEntity[]>([])
  const [stories, setStories] = useState<ContentEntity[]>([])

  useEffect(() => {
    if (!id) return
    mythoDb.mythologies.getById(id).then((m) => {
      setMyth(m ?? null)
      if (m) {
        Promise.all([
          Promise.all((m.majorBeingIds ?? []).map((bid) => mythoDb.beings.getById(bid))),
          Promise.all((m.majorStoryIds ?? []).map((sid) => mythoDb.stories.getById(sid))),
        ]).then(([b, s]) => {
          setBeings(b.filter(Boolean) as ContentEntity[])
          setStories(s.filter(Boolean) as ContentEntity[])
        })
      }
    })
  }, [id])

  if (!myth) return <div>Loading…</div>

  const entityLink = (type: EntityType, eid: string, name: string) => (
    <Link key={eid} to={`/entities/${type}/${eid}`}>{name}</Link>
  )

  return (
    <div>
      <h1>{myth.name}</h1>
      <p className="muted">{myth.region} · {myth.historicalPeriod}</p>

      {myth.summary && (
        <section className="section">
          <h2 className="section-title">Summary</h2>
          <p>{myth.summary}</p>
        </section>
      )}

      {myth.cosmologySummary && (
        <section className="section">
          <h2 className="section-title">Cosmology</h2>
          <p>{myth.cosmologySummary}</p>
        </section>
      )}

      {myth.centralThemes && myth.centralThemes.length > 0 && (
        <section className="section">
          <h2 className="section-title">Central themes</h2>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {myth.centralThemes.map((t) => (
              <span key={t} className="badge">{t}</span>
            ))}
          </div>
        </section>
      )}

      {beings.length > 0 && (
        <section className="section">
          <h2 className="section-title">Major beings</h2>
          <ul className="entity-list">
            {beings.map((b) => (
              <li key={b.id}>{entityLink('being', b.id, b.name)}</li>
            ))}
          </ul>
        </section>
      )}

      {stories.length > 0 && (
        <section className="section">
          <h2 className="section-title">Major stories</h2>
          <ul className="entity-list">
            {stories.map((s) => (
              <li key={s.id}>{entityLink('story', s.id, s.name)}</li>
            ))}
          </ul>
        </section>
      )}

      <section className="section">
        <h2 className="section-title">Browse by type</h2>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          {(['being', 'story', 'place', 'motif', 'group', 'object'] as EntityType[]).map((t) => (
            <Link key={t} to={`/explorer?mythology=${id}&type=${t}`}>
              {getEntityTypePlural(t)}
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
