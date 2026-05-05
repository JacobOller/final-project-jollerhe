// File to handle the read device page.
// NOTE: Copilot wrote most ofthe HTML for this page.

import { useState } from 'react'
import { getJson, withQuery } from '../api/client.js'
import { useAuth } from '../auth/useAuth.js'

/**
 * @param {Record<string, unknown>[]} rows
 */
function columnsForRows(rows) {
  const preferred = ['Category', 'Device_Name', 'Model_Name', 'Max_Value', 'OS_Type']
  const present = new Set()
  for (const row of rows) {
    for (const key of Object.keys(row)) present.add(key)
  }
  const ordered = preferred.filter((k) => present.has(k))
  const extra = [...present].filter((k) => !preferred.includes(k)).sort()
  return [...ordered, ...extra]
}

/**
 * @param {string} key
 */
function headerLabel(key) {
  return key.replace(/_/g, ' ')
}

export default function ReadDevicePage() {
  const { username, setUsername } = useAuth()
  const [status, setStatus] = useState(
    /** @type {{ kind: 'idle' } | { kind: 'loading' } | { kind: 'error', text: string } | { kind: 'ok', rows: Record<string, unknown>[] }} */ ({
      kind: 'idle',
    }),
  )

  async function handleRun() {
    setStatus({ kind: 'loading' })

    try {
      const data = await getJson(withQuery('/api/read-device-info', { username }))
      if (!Array.isArray(data)) {
        setStatus({
          kind: 'error',
          text: 'Read Device Info failed: server returned an unexpected response.',
        })
        return
      }
      setStatus({ kind: 'ok', rows: data })
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error)
      setStatus({ kind: 'error', text: `Read Device Info failed: ${msg}` })
    }
  }

  const showTable = status.kind === 'ok'
  const columns = showTable ? columnsForRows(status.rows) : []

  return (
    <section className="menu-screen read-device-screen">
      <h2>Read Device Info</h2>
      <form className="menu-form" onSubmit={(e) => e.preventDefault()}>
        <div className="form-field">
          <label htmlFor="read-dev-user">Username</label>
          <input
            id="read-dev-user"
            name="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
          />
        </div>
      </form>
      <button type="button" className="counter" onClick={handleRun}>
        Run Selected Option
      </button>

      {status.kind === 'loading' ? (
        <p className="menu-message">Calling Read Device Info...</p>
      ) : null}
      {status.kind === 'error' ? <p className="menu-message">{status.text}</p> : null}
      {showTable ? (
        <div className="read-device-output">
          <p className="read-device-result-label">Device components</p>
          {status.rows.length === 0 ? (
            <p className="menu-message">No device components found.</p>
          ) : (
            <div className="read-device-scroll" tabIndex={0}>
              <table className="read-device-table">
                <thead>
                  <tr>
                    {columns.map((col) => (
                      <th key={col} scope="col">
                        {headerLabel(col)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {status.rows.map((row, i) => (
                    <tr key={i}>
                      {columns.map((col) => (
                        <td key={col}>{row[col] != null ? String(row[col]) : '—'}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : null}
    </section>
  )
}
