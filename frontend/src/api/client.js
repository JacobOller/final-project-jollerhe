/**
 * File to handle the API requests.
 * This file is used to handle the API requests and return the data in a readable format.
 * NOTE: This file was written with great help of AI, as it handled 
 * how the output results should be formatted and displayed.
 */

/**
 * @typedef {globalThis.RequestInit} RequestInit
 */

export class ApiError extends Error {
  /**
   * @param {string} message
   * @param {{ status?: number, body?: unknown }} [details]
   */
  constructor(message, details = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = details.status
    this.body = details.body
  }
}

/**
 * Function to encode the query parameters.
 * I wrote this function myself.
 * @param {Record<string, string | number | boolean | null | undefined>} params
 */
export function encodeQuery(params) {
  const searchParams = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) continue
    searchParams.append(key, String(value))
  }
  return searchParams.toString()
}

/**
 * Function to append the query parameters to the base path.
 * I wrote this function myself with help of Gemini Pro.
 * @param {string} basePath Path starting with "/", no query string
 * @param {Record<string, string | number | boolean | null | undefined>} params
 */
export function withQuery(basePath, params) {
  const qs = encodeQuery(params)
  return qs ? `${basePath}?${qs}` : basePath
}

/**
 * Function to get the JSON data from the API.
 * I wrote this function myself.
 * @param {string} url Absolute path (with optional query string)
 * @param {RequestInit} [init] 
 */
export async function getJson(url, init) {
  let response
  try {
    response = await fetch(url, init)
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    throw new ApiError(msg)
  }

  let data = null
  try {
    data = await response.json()
  } catch {
    // not a valid JSON body, so we throw an error.
    throw new ApiError('Invalid JSON body')
  }

  // If the response is not OK, then we format the error body and throw an error.
  if (!response.ok) {
    // Format the error body (note: Gemini Pro helped with this).
    const detail = formatApiErrorBody(data)
    throw new ApiError(detail ? `${response.status}: ${detail}` : String(response.status), {
      status: response.status,
      body: data,
    })
  }

  return data
}

/**
 * Human-readable label for a JSON key (e.g. Device_Name → Device Name).
 * @param {string} key
 */
function humanizeKey(key) {
  return String(key).replace(/_/g, ' ')
}

/**
 * @param {string} text
 * @param {number} spaces
 */
function indentLines(text, spaces) {
  const pad = ' '.repeat(spaces)
  return text
    .split('\n')
    .map((line) => pad + line)
    .join('\n')
}

/**
 * Format a plain value for display (not JSON).
 * @param {unknown} value
 */
function formatPrimitive(value) {
  if (value === null || value === undefined) return '—'
  if (typeof value === 'number' || typeof value === 'boolean') return String(value)
  return String(value)
}

/**
 * Convert API JSON payload to readable multi-line text (no JSON.stringify).
 * @param {unknown} data
 * @param {number} [depth] recursion guard for nested structures
 * @returns {string}
 */
export function formatApiResponseBody(data, depth = 0) {
  if (depth > 8) return '…'
  if (data === null || data === undefined) return '—'
  if (typeof data === 'string') return data
  if (typeof data === 'number' || typeof data === 'boolean') return String(data)

  if (Array.isArray(data)) {
    if (data.length === 0) return '(none)'
    const allObjects = data.every(
      (x) => x !== null && typeof x === 'object' && !Array.isArray(x),
    )
    if (allObjects) {
      return data
        .map((row, i) => {
          const block = formatApiResponseBody(row, depth + 1)
          const lines = block.includes('\n') ? `\n${indentLines(block, 2)}` : ` ${block}`
          return `${i + 1}.${lines}`
        })
        .join('\n\n')
    }
    return data.map((x, i) => `${i + 1}. ${formatApiResponseBody(x, depth + 1)}`).join('\n')
  }

  if (typeof data === 'object') {
    const o = /** @type {Record<string, unknown>} */ (data)
    const keys = Object.keys(o)
    if (keys.length === 0) return '(empty)'
    if (keys.length === 1 && keys[0] === 'message' && typeof o.message === 'string') {
      return o.message
    }
    return keys
      .map((k) => {
        const v = o[k]
        if (v !== null && typeof v === 'object') {
          const inner = formatApiResponseBody(v, depth + 1)
          return `${humanizeKey(k)}:\n${indentLines(inner, 2)}`
        }
        return `${humanizeKey(k)}: ${formatPrimitive(v)}`
      })
      .join('\n')
  }

  return String(data)
}

/**
 * Format error JSON bodies; prefers `error` string when present.
 * @param {unknown} data
 */
export function formatApiErrorBody(data) {
  if (data && typeof data === 'object' && !Array.isArray(data)) {
    const o = /** @type {Record<string, unknown>} */ (data)
    if (typeof o.error === 'string') return o.error
  }
  return formatApiResponseBody(data)
}

/**
 * POST JSON body and parse JSON response (same error handling as {@link getJson}).
 *
 * @param {string} url Absolute path (with optional query string) for same-origin fetch
 * @param {unknown} body Value passed to JSON.stringify
 * @param {Omit<RequestInit, 'body' | 'method'>} [init] Extra fetch options (merged; method and body are fixed)
 */
export async function postJson(url, body, init) {
  let response
  try {
    response = await fetch(url, {
      ...init,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(init?.headers && typeof init.headers === 'object' && !(init.headers instanceof Headers)
          ? /** @type {Record<string, string>} */ (init.headers)
          : {}),
      },
      body: JSON.stringify(body),
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    throw new ApiError(msg)
  }

  let data = null
  try {
    data = await response.json()
  } catch {
    // non-JSON body
  }

  if (!response.ok) {
    const detail = formatApiErrorBody(data)
    throw new ApiError(detail ? `${response.status}: ${detail}` : String(response.status), {
      status: response.status,
      body: data,
    })
  }

  return data
}

/**
 * Fetch JSON and return a labeled, human-readable result string for menu pages.
 * @param {string} url
 * @param {string} successLabel
 */
export async function runDemoFetch(url, successLabel) {
  const data = await getJson(url)
  const formatted = formatApiResponseBody(data)
  if (formatted.includes('\n')) {
    return `${successLabel}:\n${formatted}`
  }
  return `${successLabel}: ${formatted}`
}
