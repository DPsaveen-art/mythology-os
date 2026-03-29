import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useState } from 'react'

export function AppLayout() {
  const [search, setSearch] = useState('')
  const navigate = useNavigate()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (search.trim()) {
      navigate(`/explorer?q=${encodeURIComponent(search.trim())}`)
    }
  }

  const navItems = [
    { to: '/', label: 'Archive' },
    { to: '/mythologies', label: 'Mythologies' },
    { to: '/explorer', label: 'Codex' },
    { to: '/connections', label: 'Web of Relations' },
    { to: '/comparisons', label: 'Parallels' },
    { to: '/notes', label: 'Interpretations' },
    { to: '/sources', label: 'Canon' },
    { to: '/settings', label: 'System' },
  ]

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <nav>
          {navItems.map(({ to, label }) => (
            <NavLink key={to} to={to} end={to === '/'}>
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <div className="main-area">
        <header className="topbar">
          <form onSubmit={handleSearch} style={{ flex: 1, maxWidth: 400, display: 'flex' }}>
            <input
              type="search"
              className="search-input"
              placeholder="Search codex, interpretations, canon…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Global search"
            />
          </form>
        </header>
        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
