import { useState, useEffect, useRef } from 'react'
import { mythoDb } from '../../services/db'
import type { Relationship } from '../../types'

interface RelationshipPickerProps {
  selectedIds: string[]
  onChange: (ids: string[]) => void
  entityNames: Record<string, string>
  placeholder?: string
  multiple?: boolean
}

interface RelWithNames extends Relationship {
  fromName: string
  toName: string
}

export function RelationshipPicker({
  selectedIds,
  onChange,
  entityNames,
  placeholder = 'Search relationships…',
  multiple = true,
}: RelationshipPickerProps) {
  const [query, setQuery] = useState('')
  const [allRels, setAllRels] = useState<RelWithNames[]>([])
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const load = async () => {
      const rels = await mythoDb.relationships.getAll()
      const withNames = rels.map((r) => ({
        ...r,
        fromName: entityNames[r.fromEntityId] ?? r.fromEntityId,
        toName: entityNames[r.toEntityId] ?? r.toEntityId,
      }))
      setAllRels(withNames)
    }
    load()
  }, [entityNames])

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [])

  const filtered = query.trim()
    ? allRels.filter(
        (r) =>
          r.fromName.toLowerCase().includes(query.toLowerCase()) ||
          r.toName.toLowerCase().includes(query.toLowerCase()) ||
          r.relationType.toLowerCase().includes(query.toLowerCase())
      )
    : allRels

  const select = (r: RelWithNames) => {
    if (multiple) {
      if (!selectedIds.includes(r.id)) {
        onChange([...selectedIds, r.id])
      }
    } else {
      onChange([r.id])
      setOpen(false)
    }
  }

  const remove = (id: string) => {
    onChange(selectedIds.filter((i) => i !== id))
  }

  const selectedRels = allRels.filter((r) => selectedIds.includes(r.id))

  return (
    <div ref={containerRef} className="entity-picker relationship-picker">
      <div className="entity-picker-selected">
        {selectedRels.map((r) => (
          <span key={r.id} className="entity-picker-chip">
            {r.fromName} — {r.relationType.replace(/_/g, ' ')} — {r.toName}
            {r.certainty !== 'direct' && (
              <span className="entity-picker-chip-meta"> ({r.certainty})</span>
            )}
            <button
              type="button"
              className="entity-picker-chip-remove"
              onClick={() => remove(r.id)}
              aria-label="Remove"
            >
              ×
            </button>
          </span>
        ))}
      </div>
      <div className="entity-picker-input-wrap">
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          className="form-input entity-picker-input"
        />
        {open && (
          <div className="entity-picker-dropdown relationship-picker-dropdown">
            {filtered.length === 0 ? (
              <div className="entity-picker-empty">No relationships</div>
            ) : (
              filtered.slice(0, 20).map((r) => (
                <button
                  key={r.id}
                  type="button"
                  className={`entity-picker-option ${selectedIds.includes(r.id) ? 'selected' : ''}`}
                  onClick={() => select(r)}
                  disabled={multiple && selectedIds.includes(r.id)}
                >
                  <span className="relationship-picker-line">
                    {r.fromName} <em>{r.relationType.replace(/_/g, ' ')}</em> {r.toName}
                  </span>
                  {r.certainty !== 'direct' && (
                    <span className="entity-picker-option-meta">{r.certainty}</span>
                  )}
                </button>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}
