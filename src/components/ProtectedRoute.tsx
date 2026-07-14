import { Navigate, Outlet } from 'react-router-dom'

function hasValidSession() {
  if (typeof window === 'undefined') return false

  try {
    const session = localStorage.getItem('sentinel_session')
    if (!session) return false

    const parsed = JSON.parse(session)
    return Boolean(parsed?.token || parsed?.id || parsed?.email)
  } catch {
    return false
  }
}

export default function ProtectedRoute() {
  return hasValidSession() ? <Outlet /> : <Navigate to="/login" replace />
}
