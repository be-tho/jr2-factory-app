import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60,
      retry: 1,
    },
  },
})

/** Limpiar todo el caché al hacer logout para evitar datos stale entre sesiones. */
export function clearQueryCacheOnLogout() {
  queryClient.clear()
}
