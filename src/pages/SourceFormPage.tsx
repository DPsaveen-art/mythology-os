import { useParams, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { SourceForm } from '../components/forms/SourceForm'
import { mythoDb } from '../services/db'
import type { SourceRef } from '../types'

export function SourceFormPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [source, setSource] = useState<SourceRef | null | undefined>(undefined)

  const isNew = !id || id === 'new'

  useEffect(() => {
    if (isNew) {
      setSource(null)
    } else {
      mythoDb.sources.getById(id!).then((s) => setSource(s ?? null))
    }
  }, [id, isNew])

  const handleSubmit = async (s: SourceRef) => {
    await mythoDb.sources.put(s)
    navigate(`/sources/${s.id}`)
  }

  const handleCancel = () => {
    navigate(isNew ? '/sources' : `/sources/${id}`)
  }

  if (!isNew && source === undefined) return <div>Loading…</div>
  if (!isNew && source === null) return <div>Source not found</div>

  return (
    <div>
      <h1>{isNew ? 'New source' : 'Edit source'}</h1>
      <SourceForm initial={source ?? undefined} onSubmit={handleSubmit} onCancel={handleCancel} />
    </div>
  )
}
