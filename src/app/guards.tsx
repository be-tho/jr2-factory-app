import { useEffect } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useSession } from '../hooks/useSession'
import { useProfileQuery } from '../features/account/hooks/useProfile'
import { supabase } from '../lib/supabase/client'

export function ProtectedRoute() {
  const { session, loading } = useSession()
  const { data: profile } = useProfileQuery()

  useEffect(() => {
    if (profile && profile.is_active === false) {
      void supabase.auth.signOut()
    }
  }, [profile])

  if (loading) {
    return (
      <p className="bg-brand-canvas p-6 text-sm text-brand-ink-muted">Cargando sesion...</p>
    )
  }

  if (!session) {
    return <Navigate to="/login" replace />
  }

  if (profile?.is_active === false) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}

export function AdminRoute() {
  const { data: profile, isPending } = useProfileQuery()

  if (isPending) {
    return (
      <p className="bg-brand-canvas p-6 text-sm text-brand-ink-muted">Cargando...</p>
    )
  }

  if (profile?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />
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
