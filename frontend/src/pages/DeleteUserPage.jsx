// File to handle the delete user page.
// NOTE: Copilot wrote most ofthe HTML for this page.

import { useState } from 'react'
import { runDemoFetch, withQuery } from '../api/client'
import { useAuth } from '../auth/useAuth.js'

export default function DeleteUserPage() {
  const { username, setUsername } = useAuth()
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')

  async function handleRun() {
    setMessage('Calling Delete User Account...')

    try {
      const text = await runDemoFetch(
        withQuery('/api/delete-user-account', {
          username,
          password,
          confirmation: true,
        }),
        'Delete User Account result',
      )
      setMessage(text)
    } catch (error) {
      setMessage(`Delete User Account failed: ${error.message}`)
    }
  }

  return (
    <section className="menu-screen">
      <h2>Delete User Account</h2>
      <form className="menu-form" onSubmit={(e) => e.preventDefault()}>
        <div className="form-field">
          <label htmlFor="del-user-username">Username</label>
          <input
            id="del-user-username"
            name="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
          />
        </div>
        <div className="form-field">
          <label htmlFor="del-user-password">Password</label>
          <input
            id="del-user-password"
            name="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
      </form>
      <button type="button" className="counter" onClick={handleRun}>
        Run Selected Option
      </button>
      <p className="menu-message">{message}</p>
    </section>
  )
}
