import { useState, useRef } from 'react'
import { resetAndReseed, resetDb } from '../hooks/useDbReady'
import { exportAllData, downloadExport, importData, validateImportData, getExistingIds, type ExportData } from '../services/exportImport'
import {
  validateAndPreviewPack,
  packToExportFormat,
  type PackPreview,
  type MythologyPack,
} from '../services/mythologyPack'

const BUILT_IN_PACKS = [
  { id: 'greek-expanded', name: 'Greek Mythology (Expanded)', url: '/packs/greek-expanded.json' },
  { id: 'norse-expanded', name: 'Norse Mythology (Expanded)', url: '/packs/norse-expanded.json' },
  { id: 'egyptian-starter', name: 'Egyptian Mythology (Starter)', url: '/packs/egyptian-starter.json' },
  { id: 'mesopotamian-starter', name: 'Mesopotamian Mythology (Starter)', url: '/packs/mesopotamian-starter.json' },
] as const

export function Settings() {
  const [resetting, setResetting] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [importing, setImporting] = useState(false)
  const [importMode, setImportMode] = useState<'replace' | 'merge'>('replace')
  const [importError, setImportError] = useState<string | null>(null)
  const [importSuccess, setImportSuccess] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [packPreview, setPackPreview] = useState<PackPreview | null>(null)
  const [packData, setPackData] = useState<MythologyPack | null>(null)
  const [packLoading, setPackLoading] = useState(false)
  const [packImporting, setPackImporting] = useState(false)
  const [packError, setPackError] = useState<string | null>(null)
  const packFileInputRef = useRef<HTMLInputElement>(null)

  const handleReseed = async () => {
    setResetting(true)
    try {
      await resetAndReseed()
      alert('Database reseeded successfully.')
    } catch (e) {
      alert('Error: ' + (e instanceof Error ? e.message : 'Unknown'))
    } finally {
      setResetting(false)
    }
  }

  const handleReset = async () => {
    if (!confirm('Delete all data and reload? This cannot be undone.')) return
    setResetting(true)
    try {
      await resetDb()
    } catch (e) {
      alert('Error: ' + (e instanceof Error ? e.message : 'Unknown'))
      setResetting(false)
    }
  }

  const handleExport = async () => {
    setExporting(true)
    setImportError(null)
    setImportSuccess(null)
    try {
      const data = await exportAllData()
      downloadExport(data)
      setImportSuccess('Export downloaded.')
    } catch (e) {
      setImportError(e instanceof Error ? e.message : 'Export failed')
    } finally {
      setExporting(false)
    }
  }

  const handleImportClick = () => {
    setImportError(null)
    setImportSuccess(null)
    fileInputRef.current?.click()
  }

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setImporting(true)
    setImportError(null)
    setImportSuccess(null)
    try {
      const text = await file.text()
      const parsed: unknown = JSON.parse(text)
      const validation = validateImportData(parsed)
      if (!validation.ok) {
        setImportError(validation.errors.join('. '))
        return
      }
      if (importMode === 'replace' && !confirm('Replace mode will clear all existing data. Continue?')) {
        setImporting(false)
        return
      }
      const result = await importData(parsed as ExportData, importMode)
      if (result.ok) {
        if (result.errors.length > 0) {
          setImportSuccess('Import complete.')
          setImportError(result.errors.join('. '))
        } else {
          window.location.reload()
        }
      } else {
        setImportError(result.errors.join('. '))
      }
    } catch (err) {
      setImportError(err instanceof Error ? err.message : 'Invalid file or JSON')
    } finally {
      setImporting(false)
    }
  }

  const loadAndPreviewPack = async (data: MythologyPack) => {
    setPackLoading(true)
    setPackError(null)
    setPackPreview(null)
    setPackData(null)
    try {
      const existingIds = await getExistingIds()
      const result = validateAndPreviewPack(data, existingIds)
      if ('error' in result) {
        setPackError(result.error)
        return
      }
      setPackPreview(result)
      setPackData(data)
    } catch (err) {
      setPackError(err instanceof Error ? err.message : 'Preview failed')
    } finally {
      setPackLoading(false)
    }
  }

  const handlePackSelect = async (url: string) => {
    setPackError(null)
    setPackPreview(null)
    setPackData(null)
    setPackLoading(true)
    try {
      const res = await fetch(url)
      if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`)
      const data: unknown = await res.json()
      if (!data || typeof data !== 'object') throw new Error('Invalid pack format')
      await loadAndPreviewPack(data as MythologyPack)
    } catch (err) {
      setPackError(err instanceof Error ? err.message : 'Failed to load pack')
    } finally {
      setPackLoading(false)
    }
  }

  const handlePackFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setPackLoading(true)
    setPackError(null)
    setPackPreview(null)
    setPackData(null)
    try {
      const text = await file.text()
      const data: unknown = JSON.parse(text)
      await loadAndPreviewPack(data as MythologyPack)
    } catch (err) {
      setPackError(err instanceof Error ? err.message : 'Invalid file or JSON')
    } finally {
      setPackLoading(false)
    }
  }

  const handlePackImport = async () => {
    if (!packData) return
    if (packPreview?.errors && packPreview.errors.length > 0) return
    setPackImporting(true)
    setPackError(null)
    try {
      const exportData = packToExportFormat(packData)
      const result = await importData(exportData, 'merge')
      if (result.ok) {
        setPackPreview(null)
        setPackData(null)
        window.location.reload()
      } else {
        setPackError(result.errors.join('. '))
      }
    } catch (err) {
      setPackError(err instanceof Error ? err.message : 'Import failed')
    } finally {
      setPackImporting(false)
    }
  }

  const clearPackPreview = () => {
    setPackPreview(null)
    setPackData(null)
    setPackError(null)
  }

  return (
    <div>
      <h1>System</h1>
      <p className="muted">Backup, restore, and database management</p>

      <section className="section" style={{ marginTop: '1.5rem' }}>
        <h2 className="section-title">Backup & restore</h2>
        <div className="settings-actions">
          <div className="form-group">
            <label>Export</label>
            <p className="muted small">Download all data as JSON for backup.</p>
            <button className="btn" onClick={handleExport} disabled={exporting}>
              {exporting ? 'Exporting…' : 'Export all data'}
            </button>
          </div>
          <div className="form-group">
            <label>Import</label>
            <p className="muted small">Restore from a previously exported JSON file.</p>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <select
                value={importMode}
                onChange={(e) => setImportMode(e.target.value as 'replace' | 'merge')}
                className="form-input"
                style={{ width: 'auto' }}
              >
                <option value="replace">Replace (clear then import)</option>
                <option value="merge">Merge (add/update, keep existing)</option>
              </select>
              <button className="btn" onClick={handleImportClick} disabled={importing}>
                {importing ? 'Importing…' : 'Choose file…'}
              </button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,application/json"
              onChange={handleImportFile}
              style={{ display: 'none' }}
            />
          </div>
        </div>
        {(importError || importSuccess) && (
          <div className="form-messages">
            {importSuccess && <div className="form-message form-success" role="status">{importSuccess}</div>}
            {importError && <div className="form-message form-error" role="alert">{importError}</div>}
          </div>
        )}
      </section>

      <section className="section">
        <h2 className="section-title">Mythology packs</h2>
        <p className="muted small" style={{ marginBottom: '1rem' }}>
          Import one mythology pack at a time. Packs are merged with existing data (duplicate IDs overwritten).
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
            {BUILT_IN_PACKS.map((p) => (
              <button
                key={p.id}
                className="btn"
                onClick={() => handlePackSelect(p.url)}
                disabled={packLoading}
              >
                {p.name}
              </button>
            ))}
            <button
              className="btn"
              onClick={() => packFileInputRef.current?.click()}
              disabled={packLoading}
            >
              Choose file…
            </button>
            <input
              ref={packFileInputRef}
              type="file"
              accept=".json,application/json"
              onChange={handlePackFile}
              style={{ display: 'none' }}
            />
          </div>
          {packError && (
            <div className="form-message form-error" role="alert">{packError}</div>
          )}
          {packLoading && (
            <p className="muted small">Loading and validating pack…</p>
          )}
          {packPreview && (
            <div className="section" style={{ border: '1px solid var(--border)', borderRadius: '6px', padding: '1rem', backgroundColor: 'var(--bg-subtle)' }}>
              <h3 style={{ marginTop: 0 }}>Import preview</h3>
              <p className="muted small">{packPreview.packName} v{packPreview.packVersion}</p>
              {packPreview.description && <p className="muted small">{packPreview.description}</p>}
              <dl style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '0.25rem 1.5rem', marginTop: '0.75rem' }}>
                <dt>Mythologies</dt>
                <dd>{packPreview.mythologies.map((m) => m.name).join(', ') || '—'}</dd>
                <dt>Records</dt>
                <dd>
                  {Object.entries(packPreview.counts)
                    .filter(([, n]) => n > 0)
                    .map(([k, n]) => `${k}: ${n}`)
                    .join(' · ')}
                </dd>
              </dl>
              {packPreview.warnings.length > 0 && (
                <div style={{ marginTop: '0.75rem' }}>
                  <strong>Warnings</strong>
                  <ul style={{ margin: '0.25rem 0 0', paddingLeft: '1.25rem' }}>
                    {packPreview.warnings.map((w, i) => (
                      <li key={i} className="muted small">{w}</li>
                    ))}
                  </ul>
                </div>
              )}
              {packPreview.errors.length > 0 && (
                <div style={{ marginTop: '0.75rem' }}>
                  <strong className="form-error">Errors (import blocked)</strong>
                  <ul style={{ margin: '0.25rem 0 0', paddingLeft: '1.25rem' }} className="form-error">
                    {packPreview.errors.map((e, i) => (
                      <li key={i} className="small">{e}</li>
                    ))}
                  </ul>
                </div>
              )}
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                <button
                  className="btn"
                  onClick={handlePackImport}
                  disabled={packImporting || (packPreview.errors?.length ?? 0) > 0}
                >
                  {packImporting ? 'Importing…' : 'Import (merge)'}
                </button>
                <button className="btn" onClick={clearPackPreview} disabled={packImporting}>
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="section">
        <h2 className="section-title">Database</h2>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <button className="btn" onClick={handleReseed} disabled={resetting}>
            Reseed database
          </button>
          <button className="btn" onClick={handleReset} disabled={resetting}>
            Reset and reload
          </button>
        </div>
        <p className="muted small" style={{ marginTop: '0.5rem' }}>
          Reseed: replace data with seed. Reset: clear IndexedDB and reload.
        </p>
      </section>
    </div>
  )
}
