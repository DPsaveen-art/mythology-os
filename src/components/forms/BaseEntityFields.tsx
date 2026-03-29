import { EntityPicker } from '../pickers/EntityPicker'

export interface BaseEntityFormState {
  name: string
  alternateNames: string
  slug: string
  mythologyIds: string[]
  summary: string
  description: string
  tags: string
  status: 'draft' | 'active' | 'archived'
  confidence: 'certain' | 'probable' | 'tentative' | 'disputed'
}

interface BaseEntityFieldsProps {
  state: BaseEntityFormState
  onChange: (updates: Partial<BaseEntityFormState>) => void
  mythologyNames: Record<string, string>
  errors?: string[]
}

export function BaseEntityFields({ state, onChange, mythologyNames, errors = [] }: BaseEntityFieldsProps) {
  const showFieldErrors = errors.length > 0
  const nameInvalid = showFieldErrors && !state.name.trim()
  const mythInvalid = showFieldErrors && state.mythologyIds.length === 0

  return (
    <>
      {errors.length > 0 && (
        <div className="form-message form-error" role="alert">
          <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
            {errors.map((e, i) => (
              <li key={i}>{e}</li>
            ))}
          </ul>
        </div>
      )}
      <div className={`form-group ${nameInvalid ? 'form-group-invalid' : ''}`}>
        <label>Name *</label>
        <input
          type="text"
          value={state.name}
          onChange={(e) => onChange({ name: e.target.value })}
          required
          className="form-input"
          aria-invalid={nameInvalid || undefined}
          aria-describedby={nameInvalid ? 'name-error' : undefined}
        />
        {nameInvalid && <span id="name-error" className="form-field-error">Name is required</span>}
      </div>
      <div className="form-group">
        <label>Alternate names (comma-separated)</label>
        <input
          type="text"
          value={state.alternateNames}
          onChange={(e) => onChange({ alternateNames: e.target.value })}
          placeholder="e.g. Jupiter, Jove"
          className="form-input"
        />
      </div>
      <div className="form-group">
        <label>Slug (URL-friendly identifier)</label>
        <input
          type="text"
          value={state.slug}
          onChange={(e) => onChange({ slug: e.target.value })}
          placeholder="auto-generated from name if empty"
          className="form-input"
        />
      </div>
      <div className={`form-group ${mythInvalid ? 'form-group-invalid' : ''}`}>
        <label>Mythologies *</label>
        <EntityPicker
          selectedIds={state.mythologyIds}
          onChange={(ids) => onChange({ mythologyIds: ids })}
          mythologyNames={mythologyNames}
          filterTypes={['mythology']}
          placeholder="Select mythologies…"
          multiple
        />
        {mythInvalid && <span className="form-field-error">Select at least one mythology</span>}
      </div>
      <div className="form-group">
        <label>Summary</label>
        <input
          type="text"
          value={state.summary}
          onChange={(e) => onChange({ summary: e.target.value })}
          className="form-input"
        />
      </div>
      <div className="form-group">
        <label>Description</label>
        <textarea
          value={state.description}
          onChange={(e) => onChange({ description: e.target.value })}
          rows={4}
          className="form-input"
        />
      </div>
      <div className="form-row">
        <div className="form-group">
          <label>Status</label>
          <select
            value={state.status}
            onChange={(e) => onChange({ status: e.target.value as BaseEntityFormState['status'] })}
            className="form-input"
          >
            <option value="draft">draft</option>
            <option value="active">active</option>
            <option value="archived">archived</option>
          </select>
        </div>
        <div className="form-group">
          <label>Confidence</label>
          <select
            value={state.confidence}
            onChange={(e) => onChange({ confidence: e.target.value as BaseEntityFormState['confidence'] })}
            className="form-input"
          >
            <option value="certain">certain</option>
            <option value="probable">probable</option>
            <option value="tentative">tentative</option>
            <option value="disputed">disputed</option>
          </select>
        </div>
      </div>
      <div className="form-group">
        <label>Tags (comma-separated)</label>
        <input
          type="text"
          value={state.tags}
          onChange={(e) => onChange({ tags: e.target.value })}
          placeholder="e.g. olympian, sky-god"
          className="form-input"
        />
      </div>
    </>
  )
}
