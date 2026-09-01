import { useSearchParams } from 'react-router-dom'

interface UseListFiltersOptions {
  maxPage?: number
  resetPageOnSearch?: boolean
}

interface UseListFiltersReturn {
  search: string
  page: number
  updateFilters: (next: Partial<{ q: string; page: number }>) => void
  clearFilters: () => void
}

/**
 * Hook reutilizable para sincronizar filtros y paginación con la URL.
 * Maneja automáticamente:
 * - Lectura/escritura de parámetros q (búsqueda) y page (paginación)
 * - Validación de página dentro del rango válido
 * - Reset de página cuando se cambia la búsqueda
 *
 * @example
 * const { search, page, updateFilters } = useListFilters({ maxPage: 5 })
 * const updateFilters({ q: 'nuevo' }) // setea ?q=nuevo&page=1
 */
export function useListFilters({
  maxPage = Infinity,
  resetPageOnSearch = true,
}: UseListFiltersOptions = {}): UseListFiltersReturn {
  const [searchParams, setSearchParams] = useSearchParams()

  const search = searchParams.get('q') ?? ''
  let page = Number(searchParams.get('page') ?? '1')

  // Validar que page esté en rango
  if (page < 1 || page > maxPage) {
    page = 1
  }

  const updateFilters = (next: Partial<{ q: string; page: number }>) => {
    const params = new URLSearchParams(searchParams)
    const nextSearch = next.q !== undefined ? next.q : search
    const nextPage = next.page !== undefined ? next.page : page

    // Manejar búsqueda
    if (nextSearch.trim()) {
      params.set('q', nextSearch.trim())
    } else {
      params.delete('q')
    }

    // Si la búsqueda cambió y resetPageOnSearch es true, reset a página 1
    if (resetPageOnSearch && next.q !== undefined && next.q !== search) {
      params.delete('page')
    } else if (nextPage > 1) {
      params.set('page', String(nextPage))
    } else {
      params.delete('page')
    }

    setSearchParams(params, { replace: true })
  }

  const clearFilters = () => {
    setSearchParams({}, { replace: true })
  }

  return {
    search,
    page,
    updateFilters,
    clearFilters,
  }
}
