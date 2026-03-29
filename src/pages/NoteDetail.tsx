import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { mythoDb } from '../services/db'
import { resolveEntityIds } from '../services/entityResolver'
import { getEntityTypeLabel } from '../types/entity'
import type { Note } from '../types'

export function NoteDetail() {
  const { id } = useParams<{ id: string }>()
  const [note, setNote] = useState<Note | null>(null)
  const [linkedEntities, setLinkedEntities] = useState<Array<{ id: string; name: string; entityType: string } | null>>([])
  const [linkedRels, setLinkedRels] = useState<Array<{ id: string; from: string; to: string; type: string; certainty: string }>>([])

  useEffect(() => {
    if (!id) return
    mythoDb.notes.getById(id).then((n) => setNote(n ?? null))
  }, [id])

  useEffect(() => {
    if (!note) return
    resolveEntityIds(note.linkedEntityIds).then((resolved) => {
      setLinkedEntities(resolved.map((r) => r ? { id: r.id, name: r.name, entityType: r.entityType } : null))
    })
  }, [note?.linkedEntityIds?.join(',')])

  useEffect(() => {
    if (!note || note.linkedRelationshipIds.length === 0) {
      setLinkedRels([])
      return
    }
    const load = async () => {
      const entityNames: Record<string, string> = {}
      const stores = [mythoDb.mythologies, mythoDb.beings, mythoDb.stories, mythoDb.places, mythoDb.motifs, mythoDb.groups, mythoDb.objects]
      for (const store of stores) {
        const items = await store.getAll()
        items.forEach((e: { id: string; name: string }) => { entityNames[e.id] = e.name })
      }
      const rels = await Promise.all(note.linkedRelationshipIds.map((rid) => mythoDb.relationships.getById(rid)))
      setLinkedRels(rels.filter(Boolean).map((r) => ({
        id: r!.id,
        from: entityNames[r!.fromEntityId] ?? r!.fromEntityId,
        to: entityNames[r!.toEntityId] ?? r!.toEntityId,
        type: r!.relationType.replace(/_/g, ' '),
        certainty: r!.certainty,
      })))
    }
    load()
  }, [note?.linkedRelationshipIds?.join(',')])

  if (!note) return <div>Loading…</div>

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div>
          <span className="badge">{note.noteType}</span>
          <span className="badge" style={{ marginLeft: '0.25rem' }}>{note.status}</span>
          <h1 style={{ marginTop: '0.25rem' }}>{note.title}</h1>
        </div>
        <Link to={`/notes/${note.id}/edit`} className="btn">Edit</Link>
      </div>
      {note.tags.length > 0 && (
        <p className="muted small">{note.tags.join(', ')}</p>
      )}

      <section className="section">
        <div style={{ whiteSpace: 'pre-wrap' }}>{note.content}</div>
      </section>

      {linkedEntities.length > 0 && (
        <section className="section">
          <h2 className="section-title">Linked entities</h2>
          <ul className="entity-list">
            {linkedEntities.map((e, i) => e ? (
              <li key={e.id}>
                <Link to={`/entities/${e.entityType}/${e.id}`}>{e.name}</Link>
                <span className="muted small"> ({getEntityTypeLabel(e.entityType as import('../types').EntityType)})</span>
              </li>
            ) : (
              <li key={note.linkedEntityIds[i]} className="muted">Unknown: {note.linkedEntityIds[i]}</li>
            ))}
          </ul>
        </section>
      )}

      {linkedRels.length > 0 && (
        <section className="section">
          <h2 className="section-title">Linked relationships</h2>
          <ul className="entity-list">
            {linkedRels.map((r) => (
              <li key={r.id}>
                <strong>{r.from}</strong> — {r.type} — <strong>{r.to}</strong>
                {r.certainty !== 'direct' && <span className="muted small"> ({r.certainty})</span>}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}
