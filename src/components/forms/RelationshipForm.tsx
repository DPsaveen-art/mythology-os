import { useState, useEffect, useRef } from 'react'
import { EntityPicker } from '../pickers/EntityPicker'
import { SourceRefPicker } from '../pickers/SourceRefPicker'
import { getEntitiesByIds } from '../../services/entitySearch'
import { mythoDb } from '../../services/db'
import { generateId } from '../../utils/id'
import { ALL_RELATION_TYPES, CERTAINTIES } from '../../utils/relationshipCategories'
import type { Relationship, RelationType, RelationshipCertainty, EntityType } from '../../types'

interface RelationshipFormProps {
  initial?: Relationship | null
  onSubmit: (rel: Relationship) => void
  onCancel: () => void
}

export function RelationshipForm({ initial, onSubmit, onCancel }: RelationshipFormProps) {
  const [fromEntityId, setFromEntityId] = useState<string[]>([])
  const [toEntityId, setToEntityId] = useState<string[]>([])
  const [relationType, setRelationType] = useState<RelationType>('associated_with')
  const [certainty, setCertainty] = useState<RelationshipCertainty>('direct')
  const [direction, setDirection] = useState<Relationship['direction']>('forward')
  const [description, setDescription] = useState('')
  const [mythologyIds, setMythologyIds] = useState<string[]>([])
  const [sourceRefIds, setSourceRefIds] = useState<string[]>([])
  const [tags, setTags] = useState('')

  const [mythologyNames, setMythologyNames] = useState<Record<string, string>>({})
  const [fromType, setFromType] = useState<EntityType>('being')
  const [toType, setToType] = useState<EntityType>('being')
  const [validationError, setValidationError] = useState<string | null>(null)
  const duplicateOverrideRef = useRef(false)

  useEffect(() => {
    const load = async () => {
      const myths = await mythoDb.mythologies.getAll()
      const m: Record<string, string> = {}
      myths.forEach((x) => { m[x.id] = x.name })
      setMythologyNames(m)
    }
    load()
  }, [])

  useEffect(() => {
    if (initial) {
      setFromEntityId([initial.fromEntityId])
      setToEntityId([initial.toEntityId])
      setRelationType(initial.relationType)
      setCertainty(initial.certainty)
      setDirection(initial.direction)
      setDescription(initial.description ?? '')
      setMythologyIds(initial.mythologyIds ?? [])
      setSourceRefIds(initial.sourceRefIds ?? [])
      setTags((initial.tags ?? []).join(', '))
      setFromType(initial.fromEntityType)
      setToType(initial.toEntityType)
    }
  }, [initial])

  useEffect(() => {
    setValidationError(null)
    duplicateOverrideRef.current = false
  }, [fromEntityId, toEntityId, relationType])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setValidationError(null)

    const fromId = fromEntityId[0]
    const toId = toEntityId[0]

    if (!fromId || !toId) {
      setValidationError('Please select both From and To entities.')
      return
    }

    if (fromId === toId) {
      setValidationError('Self-links are not allowed. From and To entities must be different.')
      return
    }

    const existing = await mythoDb.relationships.getAll()
    const duplicate = existing.find(
      (r) =>
        r.fromEntityId === fromId &&
        r.toEntityId === toId &&
        r.relationType === relationType &&
        r.id !== (initial?.id ?? '')
    )

    if (duplicate && !duplicateOverrideRef.current) {
      setValidationError(
        `A relationship with this exact combination (from → type → to) already exists. Change it or confirm to save anyway.`
      )
      return
    }

    const now = new Date().toISOString()
    const rel: Relationship = {
      id: initial?.id ?? generateId(),
      fromEntityType: fromType,
      fromEntityId: fromId,
      relationType,
      toEntityType: toType,
      toEntityId: toId,
      mythologyIds: mythologyIds.length ? mythologyIds : [],
      certainty,
      direction,
      description: description.trim() || undefined,
      sourceRefIds,
      tags: tags.split(/,\s*/).filter(Boolean).map((s) => s.trim()),
      createdAt: initial?.createdAt ?? now,
      updatedAt: now,
    }
    onSubmit(rel)
  }

  const handleFromSelect = async (ids: string[]) => {
    setFromEntityId(ids)
    if (ids[0]) {
      const resolved = await getEntitiesByIds([ids[0]])
      if (resolved[0]) setFromType(resolved[0].entityType)
    }
  }

  const handleToSelect = async (ids: string[]) => {
    setToEntityId(ids)
    if (ids[0]) {
      const resolved = await getEntitiesByIds([ids[0]])
      if (resolved[0]) setToType(resolved[0].entityType)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="form">
      {validationError && (
        <div className="form-message form-error" role="alert">
          {validationError}
          {validationError.includes('already exists') && (
            <button
              type="button"
              className="btn btn-small"
              style={{ marginLeft: '0.5rem' }}
              onClick={() => {
                duplicateOverrideRef.current = true
                setValidationError(null)
                setTimeout(() => {
                  const form = document.querySelector('form')
                  form?.requestSubmit()
                }, 0)
              }}
            >
              Save anyway
            </button>
          )}
        </div>
      )}
      <div className="form-group">
        <label>From entity *</label>
        <EntityPicker
          selectedIds={fromEntityId}
          onChange={handleFromSelect}
          mythologyNames={mythologyNames}
          placeholder="Search entity…"
          multiple={false}
        />
      </div>
      <div className="form-group">
        <label>Relation type *</label>
        <select
          value={relationType}
          onChange={(e) => setRelationType(e.target.value as RelationType)}
          className="form-input"
        >
          {ALL_RELATION_TYPES.map((t) => (
            <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>
          ))}
        </select>
      </div>
      <div className="form-group">
        <label>To entity *</label>
        <EntityPicker
          selectedIds={toEntityId}
          onChange={handleToSelect}
          mythologyNames={mythologyNames}
          placeholder="Search entity…"
          multiple={false}
        />
      </div>
      <div className="form-row">
        <div className="form-group">
          <label>Certainty</label>
          <select
            value={certainty}
            onChange={(e) => setCertainty(e.target.value as RelationshipCertainty)}
            className="form-input"
          >
            {CERTAINTIES.map((c) => (
              <option key={c} value={c}>{c.replace(/_/g, ' ')}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>Direction</label>
          <select
            value={direction}
            onChange={(e) => setDirection(e.target.value as Relationship['direction'])}
            className="form-input"
          >
            <option value="forward">forward</option>
            <option value="reverse">reverse</option>
            <option value="bidirectional">bidirectional</option>
          </select>
        </div>
      </div>
      <div className="form-group">
        <label>Mythologies</label>
        <EntityPicker
          selectedIds={mythologyIds}
          onChange={setMythologyIds}
          mythologyNames={mythologyNames}
          filterTypes={['mythology']}
          placeholder="Select mythologies…"
          multiple
        />
      </div>
      <div className="form-group">
        <label>Sources</label>
        <SourceRefPicker
          selectedIds={sourceRefIds}
          onChange={setSourceRefIds}
          placeholder="Search sources to cite…"
          multiple
        />
      </div>
      <div className="form-group">
        <label>Description</label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="form-input"
        />
      </div>
      <div className="form-group">
        <label>Tags (comma-separated)</label>
        <input
          type="text"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="e.g. comparative"
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
