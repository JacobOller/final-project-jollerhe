// File to handle the register page.
// NOTE: Copilot wrote most ofthe HTML for this page.

import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ApiError } from '../api/client.js'
import { useAuth } from '../auth/useAuth.js'

export default function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [wmiJson, setWmiJson] = useState('')
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    let hardwarePayload
    const trimmed = wmiJson.trim()
    if (trimmed) {
      try {
        hardwarePayload = JSON.parse(trimmed)
      } catch {
        setError('WMI JSON must be valid JSON (run the C++ tool with --json and paste output).')
        return
      }
    }
    try {
      await register(email, username, password, hardwarePayload)
      navigate('/user/read', { replace: true })
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : String(err)
      setError(msg)
    }
  }

  return (
    <section className="menu-screen auth-flow-screen">
      <h2>Create account</h2>
      <form className="menu-form" onSubmit={handleSubmit}>
        <div className="form-field">
          <label htmlFor="register-email">Email</label>
          <input
            id="register-email"
            name="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
        </div>
        <div className="form-field">
          <label htmlFor="register-username">Username</label>
          <input
            id="register-username"
            name="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            required
          />
        </div>
        <div className="form-field">
          <label htmlFor="register-password">Password</label>
          <input
            id="register-password"
            name="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            required
          />
        </div>
        <div className="form-field">
          <label htmlFor="register-wmi">PC hardware snapshot (once, optional)</label>
          <textarea
            id="register-wmi"
            name="wmi_json"
            rows={6}
            placeholder='Run final_project_jollerhe1.exe --json, copy the one-line output, paste here — only saved when you create this account.'
            value={wmiJson}
            onChange={(e) => setWmiJson(e.target.value)}
            spellCheck={false}
          />
          <small className="form-hint">Login alone does not run this step</small>
        </div>
        {error ? <p className="menu-message">{error}</p> : null}
        <button type="submit" className="counter">
          Create account
        </button>
      </form>
      <p>
        <Link to="/welcome">Back</Link>
      </p>
    </section>
  )
}
