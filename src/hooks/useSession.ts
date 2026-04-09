import { useSessionStore } from '../stores/session.store'

export function useSession() {
  const session = useSessionStore((state) => state.session)
  const loading = useSessionStore((state) => state.loading)

  return { session, loading }
}
