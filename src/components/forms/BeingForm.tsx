import { useState, useEffect } from 'react'
import { BaseEntityFields, type BaseEntityFormState } from './BaseEntityFields'
import { mythoDb } from '../../services/db'
import { slugify } from '../../types/entity'
import { generateId } from '../../utils/id'
import { BEING_SUBTYPES } from '../../utils/formConstants'
import type { Being } from '../../types'

interface BeingFormProps {
  initial?: Being | null
  onSubmit: (entity: Being) => void
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

export function BeingForm({ initial, onSubmit, onCancel }: BeingFormProps) {
  const [base, setBase] = useState<BaseEntityFormState>(defaultBase)
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const [subtype, setSubtype] = useState('')
  const [domains, setDomains] = useState('')
  const [roles, setRoles] = useState('')
  const [epithets, setEpithets] = useState('')
  const [originSummary, setOriginSummary] = useState('')
  const [genderPresentation, setGenderPresentation] = useState('')
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
      setDomains((initial.domains ?? []).join(', '))
      setRoles((initial.roles ?? []).join(', '))
      setEpithets((initial.epithets ?? []).join(', '))
      setOriginSummary(initial.originSummary ?? '')
      setGenderPresentation(initial.genderPresentation ?? '')
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

    const entity: Being = {
      id: initial?.id ?? generateId(),
      entityType: 'being',
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
      subtype: subtype.trim() || undefined,
      domains: domains.split(/,\s*/).filter(Boolean).map((s) => s.trim()),
      roles: roles.split(/,\s*/).filter(Boolean).map((s) => s.trim()),
      epithets: epithets.split(/,\s*/).filter(Boolean).map((s) => s.trim()),
      originSummary: originSummary.trim() || undefined,
      genderPresentation: genderPresentation.trim() || undefined,
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
          {BEING_SUBTYPES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label>Domains (comma-separated)</label>
          <input type="text" value={domains} onChange={(e) => setDomains(e.target.value)} placeholder="sky, thunder" className="form-input" />
        </div>
        <div className="form-group">
          <label>Roles (comma-separated)</label>
          <input type="text" value={roles} onChange={(e) => setRoles(e.target.value)} placeholder="king of gods" className="form-input" />
        </div>
      </div>
      <div className="form-group">
        <label>Epithets (comma-separated)</label>
        <input type="text" value={epithets} onChange={(e) => setEpithets(e.target.value)} placeholder="Zeus Olympios" className="form-input" />
      </div>
      <div className="form-group">
        <label>Gender presentation</label>
        <input type="text" value={genderPresentation} onChange={(e) => setGenderPresentation(e.target.value)} placeholder="male, female, fluid" className="form-input" />
      </div>
      <div className="form-group">
        <label>Origin summary</label>
        <textarea value={originSummary} onChange={(e) => setOriginSummary(e.target.value)} rows={2} className="form-input" />
      </div>
      <div className="form-actions">
        <button type="button" className="btn" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn btn-primary">Save</button>
      </div>
    </form>
  )
}
