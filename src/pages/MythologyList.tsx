import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { mythoDb } from '../services/db'
import type { MythologySystem } from '../types'

export function MythologyList() {
  const [items, setItems] = useState<MythologySystem[]>([])

  useEffect(() => {
    mythoDb.mythologies.getAll().then(setItems)
  }, [])

  return (
    <div>
      <h1>Mythologies</h1>
      <p className="muted">Browse mythological systems by tradition and region</p>

      <div className="card-grid" style={{ marginTop: '1.5rem' }}>
        {items.map((m) => (
          <Link key={m.id} to={`/mythologies/${m.id}`} className="card-link">
            <div className="card">
              <h3>{m.name}</h3>
              <p className="muted small">{m.region} · {m.historicalPeriod}</p>
              {m.summary && <p className="small" style={{ marginTop: '0.5rem' }}>{m.summary}</p>}
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
