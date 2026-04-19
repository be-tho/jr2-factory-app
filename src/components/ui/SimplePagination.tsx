import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react'

export type SimplePaginationProps = {
  page: number
  totalPages: number
  totalItems: number
  pageSize: number
  onPageChange: (page: number) => void
  /** Para accesibilidad del `<nav>` */
  ariaLabel?: string
}

export function SimplePagination({
  page,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  ariaLabel = 'Paginación',
}: SimplePaginationProps) {
  const start = totalItems === 0 ? 0 : (page - 1) * pageSize + 1
  const end = Math.min(page * pageSize, totalItems)

  return (
    <nav
      className="flex flex-col gap-4 border-t border-brand-border-subtle pt-6 sm:flex-row sm:items-center sm:justify-between"
      aria-label={ariaLabel}
    >
      <p className="text-center text-sm text-brand-ink-muted sm:text-left">
        {totalItems === 0 ? (
          'Sin resultados'
        ) : (
          <>
            Mostrando{' '}
            <span className="font-semibold tabular-nums text-brand-ink">
              {start}–{end}
            </span>{' '}
            de <span className="font-semibold tabular-nums text-brand-ink">{totalItems}</span>
          </>
        )}
      </p>

      <div className="flex items-center justify-center gap-2 sm:justify-end">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="inline-flex cursor-pointer items-center gap-1 rounded-xl border border-brand-border bg-brand-surface px-3 py-2 text-sm font-semibold text-brand-ink shadow-sm transition hover:border-brand-border-strong hover:bg-brand-canvas disabled:cursor-not-allowed disabled:opacity-40"
        >
          <IconChevronLeft size={18} stroke={2} aria-hidden />
          Anterior
        </button>

        <span className="min-w-28 text-center text-sm tabular-nums text-brand-ink-muted">
          Página <span className="font-semibold text-brand-ink">{page}</span> / {totalPages}
        </span>

        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className="inline-flex cursor-pointer items-center gap-1 rounded-xl border border-brand-border bg-brand-surface px-3 py-2 text-sm font-semibold text-brand-ink shadow-sm transition hover:border-brand-border-strong hover:bg-brand-canvas disabled:cursor-not-allowed disabled:opacity-40"
        >
          Siguiente
          <IconChevronRight size={18} stroke={2} aria-hidden />
        </button>
      </div>
    </nav>
  )
}
