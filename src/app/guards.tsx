import { useEffect } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useSession } from '../hooks/useSession'
import { useProfileQuery } from '../features/account/hooks/useProfile'
import { supabase } from '../lib/supabase/client'

export function ProtectedRoute() {
  const { session, loading } = useSession()
  const { data: profile } = useProfileQuery()

  // Solo es inactivo cuando el perfil ya cargó (no undefined) y is_active es false
  const isInactive = profile !== undefined && profile?.is_active === false

  useEffect(() => {
    if (isInactive) {
      void supabase.auth.signOut()
    }
  }, [isInactive])

  if (loading) {
    return (
      <p className="bg-brand-canvas p-6 text-sm text-brand-ink-muted">Cargando sesion...</p>
    )
  }

  // Sesión limpia: redirigir al login.
  // Si isInactive es true (perfil en caché aún con is_active=false), pasamos el state
  // para que LoginPage muestre el mensaje de cuenta pendiente.
  if (!session) {
    return (
      <Navigate
        to="/login"
        replace
        state={isInactive ? { pendingActivation: true } : undefined}
      />
    )
  }

  // Sesión aún activa pero cuenta inactiva: mostrar pantalla de espera
  // mientras el signOut (del efecto) se procesa y limpia la sesión.
  if (isInactive) {
    return (
      <p className="bg-brand-canvas p-6 text-sm text-brand-ink-muted">Verificando cuenta...</p>
    )
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
