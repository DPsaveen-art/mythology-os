import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { mythoDb } from '../services/db'
import type { MythologySystem } from '../types'

export function Dashboard() {
  const [mythologies, setMythologies] = useState<MythologySystem[]>([])
  const [stats, setStats] = useState({ beings: 0, stories: 0, notes: 0 })

  useEffect(() => {
    const load = async () => {
      const [myths, beings, stories, notes] = await Promise.all([
        mythoDb.mythologies.getAll(),
        mythoDb.beings.getAll(),
        mythoDb.stories.getAll(),
        mythoDb.notes.getAll(),
      ])
      setMythologies(myths)
      setStats({ beings: beings.length, stories: stories.length, notes: notes.length })
    }
    load()
  }, [])

  return (
    <div>
      <h1>Archive</h1>
      <p className="muted">Browse mythological systems and navigate the codex</p>

      <section className="section" style={{ marginTop: '1.5rem' }}>
        <h2 className="section-title">Overview</h2>
        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
          <span><strong>{stats.beings}</strong> beings</span>
          <span><strong>{stats.stories}</strong> stories</span>
          <span><strong>{stats.notes}</strong> notes</span>
        </div>
      </section>

      <section className="section">
        <h2 className="section-title">Mythologies</h2>
        <div className="card-grid">
          {mythologies.map((m) => (
            <Link key={m.id} to={`/mythologies/${m.id}`} className="card-link">
              <div className="card">
                <h3>{m.name}</h3>
                <p className="muted small">{m.region} · {m.historicalPeriod}</p>
                {m.summary && <p className="small" style={{ marginTop: '0.5rem' }}>{m.summary.slice(0, 100)}…</p>}
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="section">
        <h2 className="section-title">Navigate</h2>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <Link to="/explorer">Codex</Link>
          <Link to="/connections">Web of Relations</Link>
          <Link to="/notes">Interpretations</Link>
        </div>
      </section>
    </div>
  )
}
