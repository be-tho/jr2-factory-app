import { Navigate, Outlet } from 'react-router-dom'
import { useSession } from '../hooks/useSession'

export function ProtectedRoute() {
  const { session, loading } = useSession()

  if (loading) {
    return (
      <p className="bg-brand-canvas p-6 text-sm text-brand-ink-muted">Cargando sesion...</p>
    )
  }

  if (!session) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}

export function PublicRoute() {
  const { session, loading } = useSession()

  if (loading) {
    return (
      <p className="bg-brand-canvas p-6 text-sm text-brand-ink-muted">Cargando sesion...</p>
    )
  }

  if (session) {
    return <Navigate to="/dashboard" replace />
  }

  return <Outlet />
}
