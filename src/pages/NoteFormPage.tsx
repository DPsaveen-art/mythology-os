import { useParams, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { NoteForm } from '../components/forms/NoteForm'
import { mythoDb } from '../services/db'
import type { Note } from '../types'

export function NoteFormPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [note, setNote] = useState<Note | null | undefined>(undefined)

  const isNew = !id || id === 'new'

  useEffect(() => {
    if (isNew) {
      setNote(null)
    } else {
      mythoDb.notes.getById(id!).then((n) => setNote(n ?? null))
    }
  }, [id, isNew])

  const handleSubmit = async (n: Note) => {
    await mythoDb.notes.put(n)
    navigate(`/notes/${n.id}`)
  }

  const handleCancel = () => {
    navigate(isNew ? '/notes' : `/notes/${id}`)
  }

  if (!isNew && note === undefined) return <div>Loading…</div>
  if (!isNew && note === null) return <div>Note not found</div>

  return (
    <div>
      <h1>{isNew ? 'New note' : 'Edit note'}</h1>
      <NoteForm initial={note ?? undefined} onSubmit={handleSubmit} onCancel={handleCancel} />
    </div>
  )
}
