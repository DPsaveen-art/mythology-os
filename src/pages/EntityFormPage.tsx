import { useParams, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { mythoDb } from '../services/db'
import { BeingForm } from '../components/forms/BeingForm'
import { StoryForm } from '../components/forms/StoryForm'
import { PlaceForm } from '../components/forms/PlaceForm'
import { MotifForm } from '../components/forms/MotifForm'
import { GroupForm } from '../components/forms/GroupForm'
import { ObjectForm } from '../components/forms/ObjectForm'
import { getEntityTypeLabel } from '../types/entity'
import type { EntityType, Being, Story, Place, Motif, Group, ObjectEntity } from '../types'

type FormEntity = Being | Story | Place | Motif | Group | ObjectEntity
const STORE_MAP: Record<string, { getById: (id: string) => Promise<unknown>; put: (item: FormEntity) => Promise<void> }> = {
  being: mythoDb.beings as { getById: (id: string) => Promise<unknown>; put: (item: FormEntity) => Promise<void> },
  story: mythoDb.stories as { getById: (id: string) => Promise<unknown>; put: (item: FormEntity) => Promise<void> },
  place: mythoDb.places as { getById: (id: string) => Promise<unknown>; put: (item: FormEntity) => Promise<void> },
  motif: mythoDb.motifs as { getById: (id: string) => Promise<unknown>; put: (item: FormEntity) => Promise<void> },
  group: mythoDb.groups as { getById: (id: string) => Promise<unknown>; put: (item: FormEntity) => Promise<void> },
  object: mythoDb.objects as { getById: (id: string) => Promise<unknown>; put: (item: FormEntity) => Promise<void> },
}

export function EntityFormPage() {
  const { entityType, id } = useParams<{ entityType: EntityType; id: string }>()
  const navigate = useNavigate()
  const [entity, setEntity] = useState<unknown>(null)
  const [loading, setLoading] = useState(true)

  const type = entityType as keyof typeof STORE_MAP
  const isNew = !id || id === 'new'
  const store = STORE_MAP[type]

  useEffect(() => {
    if (!store) {
      setLoading(false)
      return
    }
    if (isNew) {
      setEntity(null)
      setLoading(false)
    } else {
      store.getById(id!).then((e) => {
        setEntity(e ?? null)
        setLoading(false)
      })
    }
  }, [type, id, isNew])

  const handleSubmit = async (item: Being | Story | Place | Motif | Group | ObjectEntity) => {
    if (!store) return
    await store.put(item)
    navigate(`/entities/${item.entityType}/${item.id}`)
  }

  const handleCancel = () => {
    if (isNew) {
      navigate('/explorer')
    } else {
      navigate(`/entities/${type}/${id}`)
    }
  }

  if (!store || loading) return <div>Loading…</div>

  const formProps = { initial: entity as never, onSubmit: handleSubmit, onCancel: handleCancel }

  return (
    <div>
      <h1>{isNew ? `New ${getEntityTypeLabel(type as EntityType)}` : `Edit ${getEntityTypeLabel(type as EntityType)}`}</h1>
      {type === 'being' && <BeingForm {...formProps} />}
      {type === 'story' && <StoryForm {...formProps} />}
      {type === 'place' && <PlaceForm {...formProps} />}
      {type === 'motif' && <MotifForm {...formProps} />}
      {type === 'group' && <GroupForm {...formProps} />}
      {type === 'object' && <ObjectForm {...formProps} />}
    </div>
  )
}
