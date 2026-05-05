// File to handle the layout of the app.
// NOTE: Copilot wrote most of the HTML for this file.
// I added the logic for the logout button and the navigation links.

import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from './auth/useAuth.js'
import './App.css'

const navLinks = [
  { to: '/user/read', label: 'Read User Info' },
  { to: '/user/update', label: 'Update User Info' },
  { to: '/user/delete', label: 'Delete User Account' },
  { to: '/device/add', label: 'Add Device' },
  { to: '/device/read', label: 'Read Device Info' },
  { to: '/device/update', label: 'Update Device Info' },
  { to: '/device/delete', label: 'Delete Device' },
  { to: '/goodbye', label: 'Exit' },
]

export default function Layout() {
  const { username, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/welcome', { replace: true })
  }

  return (
    <main className="layout-root">
      <h1>Hardware Program Menu</h1>
      <p className="layout-signed-in">
        Signed in as <strong>{username}</strong>
        {' · '}
        <button type="button" className="layout-logout" onClick={handleLogout}>
          Log out
        </button>
      </p>
      <p className="layout-subtitle">Pick an action below to manage your profile or hardware.</p>

      <nav className="layout-nav" aria-label="Primary">
        <ul className="layout-nav-list">
          {navLinks.map(({ to, label }) => (
            <li key={to}>
              <NavLink
                to={to}
                end
                className={({ isActive }) =>
                  ['layout-nav-link', isActive ? 'layout-nav-link--active' : ''].join(' ')
                }
              >
                {label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="layout-outlet-wrap">
        <Outlet />
      </div>
    </main>
  )
}
