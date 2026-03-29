import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { mythoDb } from '../services/db'
import type { SourceRef } from '../types'

export function SourcesList() {
  const [sources, setSources] = useState<SourceRef[]>([])

  useEffect(() => {
    mythoDb.sources.getAll().then(setSources)
  }, [])

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div>
          <h1>Canon</h1>
          <p className="muted">Primary and secondary sources, citations, and references</p>
        </div>
        <Link to="/sources/new" className="btn btn-primary">Add source</Link>
      </div>

      <ul className="entity-list" style={{ marginTop: '1.5rem' }}>
        {sources.map((s) => (
          <li key={s.id}>
            <Link to={`/sources/${s.id}`}>
              <strong>{s.title}</strong>
            </Link>
            {s.authorOrTradition && (
              <span className="muted small" style={{ marginLeft: '0.5rem' }}>
                — {s.authorOrTradition}
              </span>
            )}
            <span className="badge" style={{ marginLeft: '0.5rem' }}>{s.sourceType}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
