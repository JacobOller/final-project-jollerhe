// File to handle the login page.
// NOTE: Copilot wrote most ofthe HTML for this page.

import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ApiError } from '../api/client.js'
import { useAuth } from '../auth/useAuth.js'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    try {
      await login(username, password)
      navigate('/user/read', { replace: true })
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : String(err)
      setError(msg)
    }
  }

  return (
    <section className="menu-screen auth-flow-screen">
      <h2>Log in</h2>
      <form className="menu-form" onSubmit={handleSubmit}>
        <div className="form-field">
          <label htmlFor="login-username">Username</label>
          <input
            id="login-username"
            name="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            required
          />
        </div>
        <div className="form-field">
          <label htmlFor="login-password">Password</label>
          <input
            id="login-password"
            name="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
        </div>
        {error ? <p className="menu-message">{error}</p> : null}
        <button type="submit" className="counter">
          Log in
        </button>
      </form>
      <p>
        <Link to="/welcome">Back</Link>
      </p>
    </section>
  )
}
