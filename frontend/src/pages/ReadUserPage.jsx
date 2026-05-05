// File to handle the read user page.
// NOTE: Copilot wrote most ofthe HTML for this page.

import { useState } from 'react'
import { runDemoFetch, withQuery } from '../api/client'
import { useAuth } from '../auth/useAuth.js'

export default function ReadUserPage() {
  const { username, setUsername } = useAuth()
  const [message, setMessage] = useState('')

  async function handleRun() {
    setMessage('Calling Read User Info...')

    try {
      const text = await runDemoFetch(withQuery('/api/read-user-info', { username }), 'Read User Info result')
      setMessage(text)
    } catch (error) {
      setMessage(`Read User Info failed: ${error.message}`)
    }
  }

  return (
    <section className="menu-screen">
      <h2>Read User Info</h2>
      <form className="menu-form" onSubmit={(e) => e.preventDefault()}>
        <div className="form-field">
          <label htmlFor="read-user-username">Username</label>
          <input
            id="read-user-username"
            name="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
          />
        </div>
        <p className="form-hint">Username comes from your session; you can change it here for API calls if needed.</p>
      </form>
      <button type="button" className="counter" onClick={handleRun}>
        Run Selected Option
      </button>
      <p className="menu-message">{message}</p>
    </section>
  )
}
