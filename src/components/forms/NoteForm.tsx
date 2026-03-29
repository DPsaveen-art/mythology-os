import { useState, useEffect } from 'react'
import { EntityPicker } from '../pickers/EntityPicker'
import { RelationshipPicker } from '../pickers/RelationshipPicker'
import { mythoDb } from '../../services/db'
import type { Note } from '../../types'
import { generateId } from '../../utils/id'

const NOTE_TYPES: Note['noteType'][] = ['interpretation', 'question', 'hypothesis', 'reference', 'general']
const STATUSES: Note['status'][] = ['draft', 'active', 'archived']

interface NoteFormProps {
  initial?: Note | null
  onSubmit: (note: Note) => void
  onCancel: () => void
}

export function NoteForm({ initial, onSubmit, onCancel }: NoteFormProps) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [noteType, setNoteType] = useState<Note['noteType']>('general')
  const [tags, setTags] = useState('')
  const [status, setStatus] = useState<Note['status']>('active')
  const [linkedEntityIds, setLinkedEntityIds] = useState<string[]>([])
  const [linkedRelationshipIds, setLinkedRelationshipIds] = useState<string[]>([])

  const [mythologyNames, setMythologyNames] = useState<Record<string, string>>({})
  const [entityNames, setEntityNames] = useState<Record<string, string>>({})

  useEffect(() => {
    const load = async () => {
      const [myths, beings, stories, places, motifs, groups, objects] = await Promise.all([
        mythoDb.mythologies.getAll(),
        mythoDb.beings.getAll(),
        mythoDb.stories.getAll(),
        mythoDb.places.getAll(),
        mythoDb.motifs.getAll(),
        mythoDb.groups.getAll(),
        mythoDb.objects.getAll(),
      ])
      const mNames: Record<string, string> = {}
      myths.forEach((m) => { mNames[m.id] = m.name })
      setMythologyNames(mNames)

      const eNames: Record<string, string> = {}
      ;[myths, beings, stories, places, motifs, groups, objects].flat().forEach((e: { id: string; name: string }) => {
        eNames[e.id] = e.name
      })
      setEntityNames(eNames)
    }
    load()
  }, [])

  useEffect(() => {
    if (initial) {
      setTitle(initial.title)
      setContent(initial.content)
      setNoteType(initial.noteType)
      setTags(initial.tags.join(', '))
      setStatus(initial.status)
      setLinkedEntityIds(initial.linkedEntityIds ?? [])
      setLinkedRelationshipIds(initial.linkedRelationshipIds ?? [])
    }
  }, [initial])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const now = new Date().toISOString()
    const note: Note = {
      id: initial?.id ?? generateId(),
      title: title.trim(),
      content: content.trim(),
      noteType,
      tags: tags.split(/,\s*/).filter(Boolean).map((t) => t.trim()),
      status,
      linkedEntityIds,
      linkedRelationshipIds,
      createdAt: initial?.createdAt ?? now,
      updatedAt: now,
    }
    onSubmit(note)
  }

  return (
    <form onSubmit={handleSubmit} className="form">
      <div className="form-group">
        <label htmlFor="title">Title</label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="form-input"
        />
      </div>
      <div className="form-group">
        <label htmlFor="content">Content</label>
        <textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={6}
          className="form-input"
        />
      </div>
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="noteType">Type</label>
          <select
            id="noteType"
            value={noteType}
            onChange={(e) => setNoteType(e.target.value as Note['noteType'])}
            className="form-input"
          >
            {NOTE_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="status">Status</label>
          <select
            id="status"
            value={status}
            onChange={(e) => setStatus(e.target.value as Note['status'])}
            className="form-input"
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="form-group">
        <label>Tags (comma-separated)</label>
        <input
          id="tags"
          type="text"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="e.g. comparative, sovereignty"
          className="form-input"
        />
      </div>
      <div className="form-group">
        <label>Linked entities</label>
        <EntityPicker
          selectedIds={linkedEntityIds}
          onChange={setLinkedEntityIds}
          mythologyNames={mythologyNames}
          placeholder="Search entities to link…"
          multiple
        />
      </div>
      <div className="form-group">
        <label>Linked relationships</label>
        <RelationshipPicker
          selectedIds={linkedRelationshipIds}
          onChange={setLinkedRelationshipIds}
          entityNames={entityNames}
          placeholder="Search relationships to link…"
          multiple
        />
      </div>
      <div className="form-actions">
        <button type="button" className="btn" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn btn-primary">Save</button>
      </div>
    </form>
  )
}
