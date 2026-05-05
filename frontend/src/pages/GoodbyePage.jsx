// File to handle the goodbye page.
// NOTE: Copilot wrote most ofthe HTML for this page.

import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../auth/useAuth.js'

export default function GoodbyePage() {
  const { logout } = useAuth()

  useEffect(() => {
    logout()
  }, [logout])

  return (
    <section className="menu-screen goodbye-screen">
      <h2>Exit</h2>
      <p className="menu-message">You have been signed out.</p>
      <p className="goodbye-actions">
        <Link to="/welcome" replace>
          Back to welcome
        </Link>
      </p>
    </section>
  )
}
