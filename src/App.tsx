import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useDbReady } from './hooks/useDbReady'
import { AppLayout } from './components/layout/AppLayout'
import { Dashboard } from './pages/Dashboard'
import { MythologyList } from './pages/MythologyList'
import { MythologyDetail } from './pages/MythologyDetail'
import { Explorer } from './pages/Explorer'
import { EntityDetail } from './pages/EntityDetail'
import { EntityFormPage } from './pages/EntityFormPage'
import { Connections } from './pages/Connections'
import { RelationshipFormPage } from './pages/RelationshipFormPage'
import { Comparisons } from './pages/Comparisons'
import { NotesList } from './pages/NotesList'
import { NoteDetail } from './pages/NoteDetail'
import { NoteFormPage } from './pages/NoteFormPage'
import { SourcesList } from './pages/SourcesList'
import { SourceDetail } from './pages/SourceDetail'
import { SourceFormPage } from './pages/SourceFormPage'
import { Settings } from './pages/Settings'
import './styles/index.css'

function App() {
  const { ready, error } = useDbReady()

  if (error) {
    return (
      <div style={{ padding: '2rem', maxWidth: 600 }}>
        <h1>Mythology OS</h1>
        <p style={{ color: 'crimson' }}>Failed to initialize: {error}</p>
      </div>
    )
  }

  if (!ready) {
    return (
      <div style={{ padding: '2rem' }}>
        <h1>Mythology OS</h1>
        <p className="muted">Loading…</p>
      </div>
    )
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="mythologies" element={<MythologyList />} />
          <Route path="mythologies/:id" element={<MythologyDetail />} />
          <Route path="explorer" element={<Explorer />} />
          <Route path="entities/:entityType/new" element={<EntityFormPage />} />
          <Route path="entities/:entityType/:id/edit" element={<EntityFormPage />} />
          <Route path="entities/:entityType/:id" element={<EntityDetail />} />
          <Route path="connections" element={<Connections />} />
          <Route path="connections/new" element={<RelationshipFormPage />} />
          <Route path="relationships/:id/edit" element={<RelationshipFormPage />} />
          <Route path="comparisons" element={<Comparisons />} />
          <Route path="notes" element={<NotesList />} />
          <Route path="notes/new" element={<NoteFormPage />} />
          <Route path="notes/:id/edit" element={<NoteFormPage />} />
          <Route path="notes/:id" element={<NoteDetail />} />
          <Route path="sources" element={<SourcesList />} />
          <Route path="sources/new" element={<SourceFormPage />} />
          <Route path="sources/:id/edit" element={<SourceFormPage />} />
          <Route path="sources/:id" element={<SourceDetail />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
