import { useState, useEffect, useRef } from 'react'
import { searchSources, getSourcesByIds } from '../../services/sourceSearch'
import type { SourceRef } from '../../types'

const SOURCE_TYPE_LABELS: Record<string, string> = {
  primary: 'Primary',
  secondary: 'Secondary',
  scholarly: 'Scholarly',
  oral: 'Oral',
  translation: 'Translation',
  other: 'Other',
}

const RELIABILITY_LABELS: Record<string, string> = {
  high: 'High',
  medium: 'Medium',
  low: 'Low',
  variable: 'Variable',
}

interface SourceRefPickerProps {
  selectedIds: string[]
  onChange: (ids: string[]) => void
  placeholder?: string
  multiple?: boolean
}

export function SourceRefPicker({
  selectedIds,
  onChange,
  placeholder = 'Search sources…',
  multiple = true,
}: SourceRefPickerProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SourceRef[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState<SourceRef[]>([])
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      const res = await searchSources(query)
      setResults(query.trim() ? res : res.slice(0, 30))
      setLoading(false)
    }
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(load, 200)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [query])

  useEffect(() => {
    const loadSelected = async () => {
      if (selectedIds.length === 0) {
        setSelected([])
        return
      }
      const resolved = await getSourcesByIds(selectedIds)
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

  const add = (s: SourceRef) => {
    if (multiple) {
      if (!selectedIds.includes(s.id)) {
        onChange([...selectedIds, s.id])
      }
      setQuery('')
      setResults([])
    } else {
      onChange([s.id])
      setOpen(false)
      setQuery('')
    }
  }

  const remove = (id: string) => {
    onChange(selectedIds.filter((i) => i !== id))
  }

  return (
    <div ref={containerRef} className="entity-picker source-ref-picker">
      <div className="entity-picker-selected">
        {selected.map((s) => (
          <span key={s.id} className="entity-picker-chip">
            {s.title}
            <span className="entity-picker-chip-meta">
              {SOURCE_TYPE_LABELS[s.sourceType] ?? s.sourceType} · {RELIABILITY_LABELS[s.reliability ?? ''] ?? s.reliability ?? '—'}
            </span>
            <button
              type="button"
              className="entity-picker-chip-remove"
              onClick={() => remove(s.id)}
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
          <div className="entity-picker-dropdown">
            {loading ? (
              <div className="entity-picker-loading">Searching…</div>
            ) : results.length === 0 ? (
              <div className="entity-picker-empty">No sources. Add sources first.</div>
            ) : (
              results.slice(0, 15).map((s) => (
                <button
                  key={s.id}
                  type="button"
                  className={`entity-picker-option ${selectedIds.includes(s.id) ? 'selected' : ''}`}
                  onClick={() => add(s)}
                  disabled={multiple && selectedIds.includes(s.id)}
                >
                  <span className="entity-picker-option-name">{s.title}</span>
                  <span className="entity-picker-option-meta">
                    {SOURCE_TYPE_LABELS[s.sourceType] ?? s.sourceType} · {RELIABILITY_LABELS[s.reliability ?? ''] ?? s.reliability ?? '—'}
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
