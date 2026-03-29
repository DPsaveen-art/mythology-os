import { useState, useEffect, useRef } from 'react'
import { searchEntities, getEntitiesByIds, type EntitySearchResult } from '../../services/entitySearch'
import { getEntityTypeLabel } from '../../types/entity'
import type { EntityType } from '../../types'

interface EntityPickerProps {
  selectedIds: string[]
  onChange: (ids: string[]) => void
  mythologyNames: Record<string, string>
  filterTypes?: EntityType[]
  placeholder?: string
  multiple?: boolean
}

export function EntityPicker({
  selectedIds,
  onChange,
  mythologyNames,
  filterTypes,
  placeholder = 'Search entities…',
  multiple = true,
}: EntityPickerProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<EntitySearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState<EntitySearchResult[]>([])
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const load = async () => {
      if (!query.trim()) {
        setResults([])
        return
      }
      setLoading(true)
      const res = await searchEntities(query)
      const filtered = filterTypes
        ? res.filter((e) => filterTypes.includes(e.entityType))
        : res
      setResults(filtered)
      setLoading(false)
    }
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(load, 200)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [query, filterTypes])

  useEffect(() => {
    const loadSelected = async () => {
      if (selectedIds.length === 0) {
        setSelected([])
        return
      }
      const resolved = await getEntitiesByIds(selectedIds)
      setSelected(resolved)
    }
    loadSelected()
  }, [selectedIds.join(',')])

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [])

  const add = (e: EntitySearchResult) => {
    if (multiple) {
      if (!selectedIds.includes(e.id)) {
        onChange([...selectedIds, e.id])
      }
      setQuery('')
      setResults([])
    } else {
      onChange([e.id])
      setOpen(false)
      setQuery('')
    }
  }

  const remove = (id: string) => {
    onChange(selectedIds.filter((i) => i !== id))
  }

  const mythLabel = (ids: string[]) =>
    ids.map((mid) => mythologyNames[mid] ?? mid).join(', ') || '—'

  return (
    <div ref={containerRef} className="entity-picker">
      <div className="entity-picker-selected">
        {selected.map((e) => (
          <span key={e.id} className="entity-picker-chip">
            {e.name}
            <span className="entity-picker-chip-meta">
              {getEntityTypeLabel(e.entityType)} · {mythLabel(e.mythologyIds)}
            </span>
            <button
              type="button"
              className="entity-picker-chip-remove"
              onClick={() => remove(e.id)}
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
        {open && (query || results.length > 0) && (
          <div className="entity-picker-dropdown">
            {loading ? (
              <div className="entity-picker-loading">Searching…</div>
            ) : results.length === 0 && query ? (
              <div className="entity-picker-empty">No matches</div>
            ) : (
              results.slice(0, 15).map((e) => (
                <button
                  key={e.id}
                  type="button"
                  className={`entity-picker-option ${selectedIds.includes(e.id) ? 'selected' : ''}`}
                  onClick={() => add(e)}
                  disabled={multiple && selectedIds.includes(e.id)}
                >
                  <span className="entity-picker-option-name">{e.name}</span>
                  <span className="entity-picker-option-meta">
                    {getEntityTypeLabel(e.entityType)} · {mythLabel(e.mythologyIds)}
                  </span>
                </button>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}
