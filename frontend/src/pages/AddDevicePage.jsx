// File to handle the add device page.
// NOTE: Copilot wrote most ofthe HTML for this page.

import { useState } from 'react'
import { runDemoFetch, withQuery } from '../api/client'
import { useAuth } from '../auth/useAuth.js'

// Default components text to sho wthe user what to enter.
const defaultComponentsText = `[
  ["Your CPU model", "CPU", "4.0GHz"],
  ["Your GPU model", "GPU", "8GB"],
  ["Your RAM", "RAM", "32GB"]
]`


export default function AddDevicePage() {
  const { username, setUsername } = useAuth()
  const [deviceName, setDeviceName] = useState('')
  const [deviceOs, setDeviceOs] = useState('')
  const [deviceComponentsText, setDeviceComponentsText] = useState(defaultComponentsText)
  const [message, setMessage] = useState('')

  async function handleRun() {
    setMessage('Calling Add Device...')

    let device_components
    try {
      device_components = JSON.parse(deviceComponentsText)
    } catch {
      setMessage('Add Device failed: device components must be valid JSON (array of [model, category, max value] rows).')
      return
    }

    try {
      const text = await runDemoFetch(
        withQuery('/api/add-device', {
          username,
          device_name: deviceName,
          device_os: deviceOs,
          device_components: JSON.stringify(device_components),
        }),
        'Add Device result',
      )
      setMessage(text)
    } catch (error) {
      setMessage(`Add Device failed: ${error.message}`)
    }
  }

  return (
    <section className="menu-screen">
      <h2>Add Device</h2>
      <form className="menu-form" onSubmit={(e) => e.preventDefault()}>
        <div className="form-field">
          <label htmlFor="add-dev-user">Username</label>
          <input
            id="add-dev-user"
            name="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
          />
        </div>
        <div className="form-field">
          <label htmlFor="add-dev-name">Device name</label>
          <input
            id="add-dev-name"
            name="device_name"
            value={deviceName}
            onChange={(e) => setDeviceName(e.target.value)}
          />
        </div>
        <div className="form-field">
          <label htmlFor="add-dev-os">Device OS</label>
          <input
            id="add-dev-os"
            name="device_os"
            value={deviceOs}
            onChange={(e) => setDeviceOs(e.target.value)}
          />
        </div>
        <div className="form-field">
          <label htmlFor="add-dev-components">Device components (JSON array)</label>
          <textarea
            id="add-dev-components"
            name="device_components"
            value={deviceComponentsText}
            onChange={(e) => setDeviceComponentsText(e.target.value)}
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
