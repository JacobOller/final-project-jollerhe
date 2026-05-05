// File to handle the update device page.
// NOTE: Copilot wrote most ofthe HTML for this page.

import { useState } from 'react'
import { runDemoFetch, withQuery } from '../api/client'
import { useAuth } from '../auth/useAuth.js'

const defaultNewComponentsText = `[
  ["Updated CPU model", "CPU", "4.8GHz"],
  ["Updated GPU model", "GPU", "10GB"],
  ["Updated RAM", "RAM", "32GB"]
]`

export default function UpdateDevicePage() {
  const { username, setUsername } = useAuth()
  const [deviceName, setDeviceName] = useState('')
  const [newDeviceName, setNewDeviceName] = useState('')
  const [newDeviceOs, setNewDeviceOs] = useState('')
  const [newComponentsText, setNewComponentsText] = useState(defaultNewComponentsText)
  const [message, setMessage] = useState('')

  async function handleRun() {
    setMessage('Calling Update Device Info...')

    let new_device_components
    try {
      new_device_components = JSON.parse(newComponentsText)
    } catch {
      setMessage(
        'Update Device Info failed: new device components must be valid JSON (array of [model, category, max value] rows).',
      )
      return
    }

    try {
      const text = await runDemoFetch(
        withQuery('/api/update-device-info', {
          username,
          device_name: deviceName,
          new_device_name: newDeviceName,
          new_device_os: newDeviceOs,
          new_device_components: JSON.stringify(new_device_components),
        }),
        'Update Device Info result',
      )
      setMessage(text)
    } catch (error) {
      setMessage(`Update Device Info failed: ${error.message}`)
    }
  }

  return (
    <section className="menu-screen">
      <h2>Update Device Info</h2>
      <form className="menu-form" onSubmit={(e) => e.preventDefault()}>
        <div className="form-field">
          <label htmlFor="upd-dev-user">Username</label>
          <input
            id="upd-dev-user"
            name="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
          />
        </div>
        <div className="form-field">
          <label htmlFor="upd-dev-current">Current device name</label>
          <input
            id="upd-dev-current"
            name="device_name"
            value={deviceName}
            onChange={(e) => setDeviceName(e.target.value)}
          />
        </div>
        <div className="form-field">
          <label htmlFor="upd-dev-new-name">New device name</label>
          <input
            id="upd-dev-new-name"
            name="new_device_name"
            value={newDeviceName}
            onChange={(e) => setNewDeviceName(e.target.value)}
          />
        </div>
        <div className="form-field">
          <label htmlFor="upd-dev-new-os">New device OS</label>
          <input
            id="upd-dev-new-os"
            name="new_device_os"
            value={newDeviceOs}
            onChange={(e) => setNewDeviceOs(e.target.value)}
          />
        </div>
        <div className="form-field">
          <label htmlFor="upd-dev-components">New device components (JSON)</label>
          <textarea
            id="upd-dev-components"
            name="new_device_components"
            value={newComponentsText}
            onChange={(e) => setNewComponentsText(e.target.value)}
            spellCheck={false}
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
