import { useState, useEffect } from 'react'
import { BaseEntityFields, type BaseEntityFormState } from './BaseEntityFields'
import { mythoDb } from '../../services/db'
import { slugify } from '../../types/entity'
import { generateId } from '../../utils/id'
import { PLACE_SUBTYPES } from '../../utils/formConstants'
import type { Place } from '../../types'

interface PlaceFormProps {
  initial?: Place | null
  onSubmit: (entity: Place) => void
  onCancel: () => void
}

const defaultBase: BaseEntityFormState = {
  name: '',
  alternateNames: '',
  slug: '',
  mythologyIds: [],
  summary: '',
  description: '',
  tags: '',
  status: 'active',
  confidence: 'certain',
}

export function PlaceForm({ initial, onSubmit, onCancel }: PlaceFormProps) {
  const [base, setBase] = useState<BaseEntityFormState>(defaultBase)
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const [subtype, setSubtype] = useState('')
  const [cosmologicalRole, setCosmologicalRole] = useState('')
  const [mythologyNames, setMythologyNames] = useState<Record<string, string>>({})

  useEffect(() => {
    mythoDb.mythologies.getAll().then((list) => {
      const m: Record<string, string> = {}
      list.forEach((x) => { m[x.id] = x.name })
      setMythologyNames(m)
    })
  }, [])

  useEffect(() => {
    if (initial) {
      setBase({
        name: initial.name,
        alternateNames: (initial.alternateNames ?? []).join(', '),
        slug: initial.slug,
        mythologyIds: initial.mythologyIds ?? [],
        summary: initial.summary ?? '',
        description: initial.description ?? '',
        tags: (initial.tags ?? []).join(', '),
        status: initial.status,
        confidence: initial.confidence,
      })
      setSubtype(initial.subtype ?? '')
      setCosmologicalRole(initial.cosmologicalRole ?? '')
    }
  }, [initial])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const errs: string[] = []
    if (!base.name.trim()) errs.push('Name is required')
    if (base.mythologyIds.length === 0) errs.push('Select at least one mythology')
    if (errs.length > 0) {
      setValidationErrors(errs)
      return
    }
    setValidationErrors([])
    const now = new Date().toISOString()
    const slug = base.slug.trim() || slugify(base.name)

    const entity: Place = {
      id: initial?.id ?? generateId(),
      entityType: 'place',
      name: base.name.trim(),
      alternateNames: base.alternateNames.split(/,\s*/).filter(Boolean).map((s) => s.trim()),
      slug,
      mythologyIds: base.mythologyIds,
      summary: base.summary.trim() || undefined,
      description: base.description.trim() || undefined,
      tags: base.tags.split(/,\s*/).filter(Boolean).map((s) => s.trim()),
      status: base.status,
      confidence: base.confidence,
      sourceRefIds: initial?.sourceRefIds ?? [],
      noteIds: initial?.noteIds ?? [],
      subtype: subtype || undefined,
      cosmologicalRole: cosmologicalRole.trim() || undefined,
      createdAt: initial?.createdAt ?? now,
      updatedAt: now,
    }
    onSubmit(entity)
  }

  return (
    <form onSubmit={handleSubmit} className="form">
      <BaseEntityFields state={base} onChange={(u) => setBase((b) => ({ ...b, ...u }))} mythologyNames={mythologyNames} errors={validationErrors} />
      <div className="form-group">
        <label>Subtype</label>
        <select value={subtype} onChange={(e) => setSubtype(e.target.value)} className="form-input">
          <option value="">—</option>
          {PLACE_SUBTYPES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>
      <div className="form-group">
        <label>Cosmological role</label>
        <input type="text" value={cosmologicalRole} onChange={(e) => setCosmologicalRole(e.target.value)} placeholder="domain of the gods" className="form-input" />
      </div>
      <div className="form-actions">
        <button type="button" className="btn" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn btn-primary">Save</button>
      </div>
    </form>
  )
}
