import { useState, useEffect } from 'react'
import type { SourceRef } from '../../types'
import { generateId } from '../../utils/id'

const SOURCE_TYPES: SourceRef['sourceType'][] = ['primary', 'secondary', 'scholarly', 'oral', 'translation', 'other']
const RELIABILITIES: NonNullable<SourceRef['reliability']>[] = ['high', 'medium', 'low', 'variable']

interface SourceFormProps {
  initial?: SourceRef | null
  onSubmit: (source: SourceRef) => void
  onCancel: () => void
}

export function SourceForm({ initial, onSubmit, onCancel }: SourceFormProps) {
  const [title, setTitle] = useState('')
  const [authorOrTradition, setAuthorOrTradition] = useState('')
  const [sourceType, setSourceType] = useState<SourceRef['sourceType']>('secondary')
  const [dateOrPeriod, setDateOrPeriod] = useState('')
  const [description, setDescription] = useState('')
  const [citation, setCitation] = useState('')
  const [url, setUrl] = useState('')
  const [reliability, setReliability] = useState<SourceRef['reliability']>('medium')
  const [notes, setNotes] = useState('')

  useEffect(() => {
    if (initial) {
      setTitle(initial.title)
      setAuthorOrTradition(initial.authorOrTradition ?? '')
      setSourceType(initial.sourceType)
      setDateOrPeriod(initial.dateOrPeriod ?? '')
      setDescription(initial.description ?? '')
      setCitation(initial.citation ?? '')
      setUrl(initial.url ?? '')
      setReliability(initial.reliability ?? 'medium')
      setNotes(initial.notes ?? '')
    }
  }, [initial])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const now = new Date().toISOString()
    const source: SourceRef = {
      id: initial?.id ?? generateId(),
      title: title.trim(),
      authorOrTradition: authorOrTradition.trim() || undefined,
      sourceType,
      dateOrPeriod: dateOrPeriod.trim() || undefined,
      description: description.trim() || undefined,
      citation: citation.trim() || undefined,
      url: url.trim() || undefined,
      reliability,
      notes: notes.trim() || undefined,
      createdAt: initial?.createdAt ?? now,
      updatedAt: now,
    }
    onSubmit(source)
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
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="authorOrTradition">Author / Tradition</label>
          <input
            id="authorOrTradition"
            type="text"
            value={authorOrTradition}
            onChange={(e) => setAuthorOrTradition(e.target.value)}
            className="form-input"
          />
        </div>
        <div className="form-group">
          <label htmlFor="sourceType">Source type</label>
          <select
            id="sourceType"
            value={sourceType}
            onChange={(e) => setSourceType(e.target.value as SourceRef['sourceType'])}
            className="form-input"
          >
            {SOURCE_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="dateOrPeriod">Date / Period</label>
          <input
            id="dateOrPeriod"
            type="text"
            value={dateOrPeriod}
            onChange={(e) => setDateOrPeriod(e.target.value)}
            placeholder="e.g. c. 700 BCE"
            className="form-input"
          />
        </div>
        <div className="form-group">
          <label htmlFor="reliability">Reliability</label>
          <select
            id="reliability"
            value={reliability}
            onChange={(e) => setReliability(e.target.value as SourceRef['reliability'])}
            className="form-input"
          >
            {RELIABILITIES.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="form-group">
        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="form-input"
        />
      </div>
      <div className="form-group">
        <label htmlFor="citation">Citation</label>
        <input
          id="citation"
          type="text"
          value={citation}
          onChange={(e) => setCitation(e.target.value)}
          placeholder="e.g. Homer. Odyssey. Trans. R. Fagles. Penguin, 1996."
          className="form-input"
        />
      </div>
      <div className="form-group">
        <label htmlFor="url">URL</label>
        <input
          id="url"
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://..."
          className="form-input"
        />
      </div>
      <div className="form-group">
        <label htmlFor="notes">Notes</label>
        <textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          className="form-input"
        />
      </div>
      <div className="form-actions">
        <button type="button" className="btn" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn btn-primary">Save</button>
      </div>
    </form>
  )
}
