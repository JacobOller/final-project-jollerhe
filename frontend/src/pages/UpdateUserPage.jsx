// File to handle the update user page.
// NOTE: Copilot wrote most ofthe HTML for this page.

import { useState } from 'react'
import { runDemoFetch, withQuery } from '../api/client'
import { useAuth } from '../auth/useAuth.js'

export default function UpdateUserPage() {
  const { username, setUsername } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')

  async function handleRun() {
    setMessage('Calling Update User Info...')

    try {
      const text = await runDemoFetch(
        withQuery('/api/update-user-info', {
          username,
          email,
          password,
        }),
        'Update User Info result',
      )
      setMessage(text)
    } catch (error) {
      setMessage(`Update User Info failed: ${error.message}`)
    }
  }

  return (
    <section className="menu-screen">
      <h2>Update User Info</h2>
      <form className="menu-form" onSubmit={(e) => e.preventDefault()}>
        <div className="form-field">
          <label htmlFor="upd-user-username">Username</label>
          <input
            id="upd-user-username"
            name="username"
            autoComplete="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <div className="form-field">
          <label htmlFor="upd-user-email">New email (optional)</label>
          <input
            id="upd-user-email"
            name="email"
            type="text"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="form-field">
          <label htmlFor="upd-user-password">New password (optional)</label>
          <input
            id="upd-user-password"
            name="password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <p className="form-hint">
          Provide your username and at least one of email or password to update. The username stays in sync with your
          session across menu pages.
        </p>
      </form>
      <button type="button" className="counter" onClick={handleRun}>
        Run Selected Option
      </button>
      <p className="menu-message">{message}</p>
    </section>
  )
}
