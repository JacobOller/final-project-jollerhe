// File to handle the delete device page.
// NOTE: Copilot wrote most ofthe HTML for this page.

import { useState } from 'react'
import { runDemoFetch, withQuery } from '../api/client'
import { useAuth } from '../auth/useAuth.js'

export default function DeleteDevicePage() {
  const { username, setUsername } = useAuth()
  const [deviceName, setDeviceName] = useState('')
  const [confirmed, setConfirmed] = useState(false)
  const [message, setMessage] = useState('')

  async function handleRun() {
    if (!confirmed) {
      setMessage('Check "Confirm delete" before running.')
      return
    }

    setMessage('Calling Delete Device...')

    try {
      const text = await runDemoFetch(
        withQuery('/api/delete-device', {
          username,
          device_name: deviceName,
          confirmation: true,
        }),
        'Delete Device result',
      )
      setMessage(text)
    } catch (error) {
      setMessage(`Delete Device failed: ${error.message}`)
    }
  }

  return (
    <section className="menu-screen">
      <h2>Delete Device</h2>
      <form className="menu-form" onSubmit={(e) => e.preventDefault()}>
        <div className="form-field">
          <label htmlFor="del-dev-user">Username</label>
          <input
            id="del-dev-user"
            name="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
          />
        </div>
        <div className="form-field">
          <label htmlFor="del-dev-name">Device name</label>
          <input
            id="del-dev-name"
            name="device_name"
            value={deviceName}
            onChange={(e) => setDeviceName(e.target.value)}
          />
        </div>
        <div className="form-check">
          <input
            id="del-dev-confirm"
            name="confirmation"
            type="checkbox"
            checked={confirmed}
            onChange={(e) => setConfirmed(e.target.checked)}
          />
          <label htmlFor="del-dev-confirm">Confirm delete (required by the API)</label>
        </div>
      </form>
      <button type="button" className="counter" onClick={handleRun}>
        Run Selected Option
      </button>
      <p className="menu-message">{message}</p>
    </section>
  )
}
