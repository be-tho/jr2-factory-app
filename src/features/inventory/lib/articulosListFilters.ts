export type EstadoFilter = 'todos' | 'activo' | 'inactivo'

export type ArticulosListFilters = {
  query: string
  categoria: string
  estado: EstadoFilter
  page: number
}

export function parseArticulosListSearch(search: string): ArticulosListFilters {
  const params = new URLSearchParams(search)
  const estado = params.get('estado')
  const pageRaw = Number.parseInt(params.get('page') ?? '1', 10)

  return {
    query: params.get('q') ?? '',
    categoria: params.get('categoria') ?? '',
    estado: estado === 'activo' || estado === 'inactivo' ? estado : 'todos',
    page: Number.isFinite(pageRaw) && pageRaw > 0 ? pageRaw : 1,
  }
}

export function buildArticulosListSearch(filters: ArticulosListFilters): string {
  const params = new URLSearchParams()
  const trimmedQuery = filters.query.trim()

  if (trimmedQuery) params.set('q', trimmedQuery)
  if (filters.categoria) params.set('categoria', filters.categoria)
  if (filters.estado !== 'todos') params.set('estado', filters.estado)
  if (filters.page > 1) params.set('page', String(filters.page))

  return params.toString()
}

export const ARTICULOS_LIST_PATH = '/inventario/articulos'

export function articulosListPath(search?: string): string {
  return search ? `${ARTICULOS_LIST_PATH}?${search}` : ARTICULOS_LIST_PATH
}
