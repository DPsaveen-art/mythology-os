import { useParams, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { RelationshipForm } from '../components/forms/RelationshipForm'
import { mythoDb } from '../services/db'
import type { Relationship } from '../types'

export function RelationshipFormPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [relationship, setRelationship] = useState<Relationship | null | undefined>(undefined)

  const isNew = !id || id === 'new'

  useEffect(() => {
    if (isNew) {
      setRelationship(null)
    } else {
      mythoDb.relationships.getById(id!).then((r) => setRelationship(r ?? null))
    }
  }, [id, isNew])

  const handleSubmit = async (r: Relationship) => {
    await mythoDb.relationships.put(r)
    navigate('/connections')
  }

  const handleCancel = () => {
    navigate('/connections')
  }

  if (!isNew && relationship === undefined) return <div>Loading…</div>
  if (!isNew && relationship === null) return <div>Relationship not found</div>

  return (
    <div>
      <h1>{isNew ? 'New relationship' : 'Edit relationship'}</h1>
      <RelationshipForm initial={relationship ?? undefined} onSubmit={handleSubmit} onCancel={handleCancel} />
    </div>
  )
}
