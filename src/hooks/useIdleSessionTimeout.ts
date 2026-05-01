import { useEffect, useRef } from 'react'
import { toast } from 'sonner'
import { markSessionSignOutReason } from '../lib/auth/sessionSignOutReason'
import { supabase } from '../lib/supabase/client'

/** Milisegundos sin actividad antes de cerrar sesión en este equipo. `0` desactiva. */
function readIdleSessionMs(): number {
  const raw = import.meta.env.VITE_IDLE_SESSION_MS as string | undefined
  if (raw === '0') {
    return 0
  }
  const n = Number(raw)
  if (Number.isFinite(n) && n > 0) {
    return n
  }
  return 30 * 60 * 1000
}

/**
 * Cierra solo la sesión local tras un período sin interacción (útil en PCs compartidos).
 * Configuración: `VITE_IDLE_SESSION_MS` (ej. `900000` = 15 min). `0` desactiva.
 */
export function useIdleSessionTimeout(enabled: boolean): void {
  const idleMs = readIdleSessionMs()
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!enabled || idleMs <= 0) {
      return
    }

    function clearTimer() {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current)
        timerRef.current = null
      }
    }

    function schedule() {
      clearTimer()
      timerRef.current = setTimeout(() => {
        markSessionSignOutReason('idle')
        toast.info('Sesión cerrada por inactividad', {
          description:
            'Por seguridad cerramos tu sesión en este equipo. Volvé a iniciar sesión cuando estés.',
          duration: 6500,
        })
        void supabase.auth.signOut({ scope: 'local' })
      }, idleMs)
    }

    function onActivity() {
      schedule()
    }

    function onVisibilityChange() {
      if (document.visibilityState === 'visible') {
        schedule()
      }
    }

    schedule()

    const passive = { passive: true } as const
    window.addEventListener('mousedown', onActivity, passive)
    window.addEventListener('keydown', onActivity)
    window.addEventListener('touchstart', onActivity, passive)
    window.addEventListener('visibilitychange', onVisibilityChange)

    return () => {
      clearTimer()
      window.removeEventListener('mousedown', onActivity)
      window.removeEventListener('keydown', onActivity)
      window.removeEventListener('touchstart', onActivity)
      window.removeEventListener('visibilitychange', onVisibilityChange)
    }
  }, [enabled, idleMs])
}
