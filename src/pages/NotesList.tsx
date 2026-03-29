import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { mythoDb } from '../services/db'
import type { Note } from '../types'

export function NotesList() {
  const [notes, setNotes] = useState<Note[]>([])

  useEffect(() => {
    mythoDb.notes.getAll().then(setNotes)
  }, [])

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div>
          <h1>Interpretations</h1>
          <p className="muted">Notes, questions, and hypotheses on mythological material</p>
        </div>
        <Link to="/notes/new" className="btn btn-primary">New interpretation</Link>
      </div>

      <ul className="entity-list" style={{ marginTop: '1.5rem' }}>
        {notes.map((n) => (
          <li key={n.id}>
            <Link to={`/notes/${n.id}`}>
              <strong>{n.title}</strong>
            </Link>
            <span className="badge" style={{ marginLeft: '0.5rem' }}>{n.noteType}</span>
            {n.tags.length > 0 && (
              <span className="muted small" style={{ marginLeft: '0.5rem' }}>
                {n.tags.join(', ')}
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
