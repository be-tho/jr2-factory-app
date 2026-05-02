import { QueryClientProvider } from '@tanstack/react-query'
import { useEffect, useRef } from 'react'
import type { PropsWithChildren } from 'react'
import { Toaster, toast } from 'sonner'
import { useIdleSessionTimeout } from '../hooks/useIdleSessionTimeout'
import { consumeSessionSignOutReason } from '../lib/auth/sessionSignOutReason'
import { clearQueryCacheOnLogout, queryClient } from '../lib/queryClient'
import { supabase } from '../lib/supabase/client'
import { useSessionStore } from '../stores/session.store'

function IdleSessionWatcher() {
  const session = useSessionStore((state) => state.session)
  useIdleSessionTimeout(Boolean(session))
  return null
}

export function AppProviders({ children }: PropsWithChildren) {
  const setSession = useSessionStore((state) => state.setSession)
  const setLoading = useSessionStore((state) => state.setLoading)
  const hadSessionRef = useRef(false)

  useEffect(() => {
    let mounted = true

    void supabase.auth.getSession().then(({ data }) => {
      if (!mounted) {
        return
      }

      hadSessionRef.current = !!data.session
      setSession(data.session)
      setLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, nextSession) => {
      const hadSessionBeforeSignOut = hadSessionRef.current

      setSession(nextSession)
      setLoading(false)

      if (nextSession) {
        hadSessionRef.current = true
      }

      if (event === 'SIGNED_OUT') {
        clearQueryCacheOnLogout()
        const reason = consumeSessionSignOutReason()
        if (!reason && hadSessionBeforeSignOut) {
          toast.info('Sesión cerrada', {
            description:
              'Iniciaste sesión en otro dispositivo o navegador. Solo puede haber una sesión activa.',
            duration: 6500,
          })
        }
        hadSessionRef.current = false
        return
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [setLoading, setSession])

  return (
    <QueryClientProvider client={queryClient}>
      <IdleSessionWatcher />
      {children}
      <Toaster
        position="top-right"
        richColors
        duration={4000}
        closeButton
        style={{ '--width': '400px', '--font-size': '14px' } as React.CSSProperties}
        toastOptions={{
          style: { padding: '14px 16px', gap: '10px' },
          classNames: { title: 'text-sm font-semibold', description: 'text-xs' },
        }}
      />
    </QueryClientProvider>
  )
}
