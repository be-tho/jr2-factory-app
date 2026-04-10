import { Link } from 'react-router-dom'
import type { Product } from '../../../types/database'

type ArticuloCardProps = {
  product: Product
}

export function ArticuloCard({ product }: ArticuloCardProps) {
  return (
    <Link
      to={`/inventario/articulos/${product.id}`}
      className="group flex flex-col rounded-xl border border-brand-border bg-brand-surface p-4 shadow-sm shadow-brand-ink/5 ring-1 ring-brand-border-subtle transition hover:border-brand-border-strong hover:shadow-md hover:ring-brand-blush/40"
    >
      <p className="text-xs font-medium uppercase tracking-wide text-brand-ink-faint">
        {[product.category, product.temporada].filter(Boolean).join(' · ') || '—'}
      </p>
      <h3 className="mt-1 line-clamp-2 text-base font-semibold text-brand-ink group-hover:text-brand-primary-hover">
        {product.name}
      </h3>
      <p className="mt-2 font-mono text-sm text-brand-ink-muted">{product.sku}</p>
      <p className="mt-2 text-sm text-brand-ink-muted">
        Stock {product.stock_actual}
        {product.precio_promocional != null ? (
          <>
            {' · '}
            <span className="line-through opacity-70">${product.precio_lista.toLocaleString('es-AR')}</span>{' '}
            <span className="font-medium text-brand-ink">${product.precio_promocional.toLocaleString('es-AR')}</span>
          </>
        ) : (
          <>
            {' · '}
            <span className="font-medium text-brand-ink">${product.precio_lista.toLocaleString('es-AR')}</span>
          </>
        )}
      </p>
      <p className="mt-auto pt-3 text-xs text-brand-ink-faint">
        Alta{' '}
        {new Date(product.created_at).toLocaleDateString('es-AR', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        })}
      </p>
    </Link>
  )
}
