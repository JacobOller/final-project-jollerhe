// File to provide the authentication context to the children components.
// Note: This file was written with great help of Gemini Pro.

import { useCallback, useMemo, useState } from 'react'
import { postJson } from '../api/client.js'
import { AuthContext } from './authContext.js'
import { readStoredUsername, writeStoredUsername } from './authStorage.js'

export function AuthProvider({ children }) {
  const [username, setUsernameState] = useState(readStoredUsername)

  const setUsername = useCallback((value) => {
    setUsernameState(value)
    writeStoredUsername(value)
  }, [])

  const isAuthenticated = Boolean(String(username).trim())

  const login = useCallback(async (usernameInput, password) => {
    const data = await postJson('/api/login', {
      username: usernameInput,
      password,
    })
    const u = data && typeof data.username === 'string' ? data.username : usernameInput
    setUsernameState(u)
    writeStoredUsername(u)
    return data
  }, [])

  const register = useCallback(async (email, usernameInput, password, hardwarePayload) => {
    const body = {
      email,
      username: usernameInput,
      password,
    }
    if (hardwarePayload !== undefined && hardwarePayload !== null) {
      body.hardware = hardwarePayload
    }
    const data = await postJson('/api/create-account', body)
    const u = data && typeof data.username === 'string' ? data.username : usernameInput
    setUsernameState(u)
    writeStoredUsername(u)
    return data
  }, [])

  const logout = useCallback(() => {
    setUsernameState('')
    writeStoredUsername('')
  }, [])

  const value = useMemo(
    () => ({
      username,
      setUsername,
      isAuthenticated,
      login,
      register,
      logout,
    }),
    [username, setUsername, isAuthenticated, login, register, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
