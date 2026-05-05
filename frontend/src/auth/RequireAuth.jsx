// File to require the authentication for the children components.

import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from './useAuth.js'

export default function RequireAuth() {
  const { isAuthenticated } = useAuth()
  if (!isAuthenticated) {
    return <Navigate to="/welcome" replace />
  }
  return <Outlet />
}
