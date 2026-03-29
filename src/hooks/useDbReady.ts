/**
 * Ensures DB is ready and optionally seeded
 */

import { useEffect, useState } from 'react'
import { openDB } from '../db/init'
import { seedDatabase } from '../db/seed'

const SEEDED_KEY = 'mythology-os-seeded-v2'

export function useDbReady(): { ready: boolean; error: string | null } {
  const [ready, setReady] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    const init = async () => {
      try {
        await openDB()
        const seeded = localStorage.getItem(SEEDED_KEY)
        if (!seeded) {
          await seedDatabase()
          localStorage.setItem(SEEDED_KEY, '1')
        }
        if (!cancelled) setReady(true)
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to init DB')
      }
    }
    init()
    return () => {
      cancelled = true
    }
  }, [])

  return { ready, error }
}

export async function resetAndReseed(): Promise<void> {
  const { clearAllStores } = await import('../db/init')
  await clearAllStores()
  await seedDatabase()
}

export async function resetDb(): Promise<void> {
  const { deleteDB } = await import('../db/init')
  await deleteDB()
  localStorage.removeItem(SEEDED_KEY)
  window.location.reload()
}
