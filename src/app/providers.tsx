import { QueryClientProvider } from '@tanstack/react-query'
import { useEffect } from 'react'
import type { PropsWithChildren } from 'react'
import { Toaster } from 'sonner'
import { queryClient } from '../lib/queryClient'
import { supabase } from '../lib/supabase/client'
import { useSessionStore } from '../stores/session.store'

export function AppProviders({ children }: PropsWithChildren) {
  const setSession = useSessionStore((state) => state.setSession)
  const setLoading = useSessionStore((state) => state.setLoading)

  useEffect(() => {
    let mounted = true

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) {
        return
      }

      setSession(data.session)
      setLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
      setLoading(false)
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [setLoading, setSession])

  return (
    <QueryClientProvider client={queryClient}>
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
