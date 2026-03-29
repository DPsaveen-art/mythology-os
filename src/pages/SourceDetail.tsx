import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { mythoDb } from '../services/db'
import type { SourceRef } from '../types'

export function SourceDetail() {
  const { id } = useParams<{ id: string }>()
  const [source, setSource] = useState<SourceRef | null>(null)

  useEffect(() => {
    if (!id) return
    mythoDb.sources.getById(id).then((s) => setSource(s ?? null))
  }, [id])

  if (!source) return <div>Loading…</div>

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
        <span className="badge">{source.sourceType}</span>
        <Link to={`/sources/${source.id}/edit`} className="btn">Edit</Link>
      </div>
      <h1>{source.title}</h1>
      {source.authorOrTradition && <p className="muted">{source.authorOrTradition}</p>}
      {source.dateOrPeriod && <p><strong>Date/Period:</strong> {source.dateOrPeriod}</p>}
      {source.description && <p>{source.description}</p>}
      {source.citation && (
        <section className="section">
          <h2 className="section-title">Citation</h2>
          <p style={{ fontFamily: 'monospace', fontSize: '0.9rem' }}>{source.citation}</p>
        </section>
      )}
      {source.reliability && <p><strong>Reliability:</strong> {source.reliability}</p>}
      {source.url && <p><a href={source.url} target="_blank" rel="noreferrer">Open URL</a></p>}
      {source.notes && <p className="muted small">{source.notes}</p>}
    </div>
  )
}
