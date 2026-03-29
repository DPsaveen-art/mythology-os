import { useState, useEffect } from 'react'
import { BaseEntityFields, type BaseEntityFormState } from './BaseEntityFields'
import { EntityPicker } from '../pickers/EntityPicker'
import { mythoDb } from '../../services/db'
import { slugify } from '../../types/entity'
import { generateId } from '../../utils/id'
import { GROUP_SUBTYPES } from '../../utils/formConstants'
import type { Group } from '../../types'

interface GroupFormProps {
  initial?: Group | null
  onSubmit: (entity: Group) => void
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

export function GroupForm({ initial, onSubmit, onCancel }: GroupFormProps) {
  const [base, setBase] = useState<BaseEntityFormState>(defaultBase)
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const [subtype, setSubtype] = useState('')
  const [memberIds, setMemberIds] = useState<string[]>([])
  const [leaderIds, setLeaderIds] = useState<string[]>([])
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
      setMemberIds(initial.memberIds ?? [])
      setLeaderIds(initial.leaderIds ?? [])
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

    const entity: Group = {
      id: initial?.id ?? generateId(),
      entityType: 'group',
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
      memberIds: memberIds.length ? memberIds : undefined,
      leaderIds: leaderIds.length ? leaderIds : undefined,
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
          {GROUP_SUBTYPES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>
      <div className="form-group">
        <label>Members</label>
        <EntityPicker
          selectedIds={memberIds}
          onChange={setMemberIds}
          mythologyNames={mythologyNames}
          filterTypes={['being']}
          placeholder="Search beings…"
          multiple
        />
      </div>
      <div className="form-group">
        <label>Leaders</label>
        <EntityPicker
          selectedIds={leaderIds}
          onChange={setLeaderIds}
          mythologyNames={mythologyNames}
          filterTypes={['being']}
          placeholder="Search beings…"
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
