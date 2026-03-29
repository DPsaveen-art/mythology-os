import { useState, useEffect } from 'react'
import { BaseEntityFields, type BaseEntityFormState } from './BaseEntityFields'
import { mythoDb } from '../../services/db'
import { slugify } from '../../types/entity'
import { generateId } from '../../utils/id'
import { MOTIF_CATEGORIES } from '../../utils/formConstants'
import type { Motif } from '../../types'

interface MotifFormProps {
  initial?: Motif | null
  onSubmit: (entity: Motif) => void
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

export function MotifForm({ initial, onSubmit, onCancel }: MotifFormProps) {
  const [base, setBase] = useState<BaseEntityFormState>(defaultBase)
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const [category, setCategory] = useState('')
  const [interpretation, setInterpretation] = useState('')
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
      setCategory(initial.category ?? '')
      setInterpretation(initial.interpretation ?? '')
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

    const entity: Motif = {
      id: initial?.id ?? generateId(),
      entityType: 'motif',
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
      category: category || undefined,
      interpretation: interpretation.trim() || undefined,
      createdAt: initial?.createdAt ?? now,
      updatedAt: now,
    }
    onSubmit(entity)
  }

  return (
    <form onSubmit={handleSubmit} className="form">
      <BaseEntityFields state={base} onChange={(u) => setBase((b) => ({ ...b, ...u }))} mythologyNames={mythologyNames} errors={validationErrors} />
      <div className="form-group">
        <label>Category</label>
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="form-input">
          <option value="">—</option>
          {MOTIF_CATEGORIES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>
      <div className="form-group">
        <label>Interpretation</label>
        <textarea value={interpretation} onChange={(e) => setInterpretation(e.target.value)} rows={3} className="form-input" />
      </div>
      <div className="form-actions">
        <button type="button" className="btn" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn btn-primary">Save</button>
      </div>
    </form>
  )
}
