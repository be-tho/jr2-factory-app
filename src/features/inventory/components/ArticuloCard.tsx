import { Link } from 'react-router-dom'
import {
  DEFAULT_ARTICLE_IMAGE_PUBLIC_URL,
  hasStorageCoverImage,
} from '../../../constants/defaultArticleImage'
import { getProductImagePublicUrl } from '../../media/services/storage.service'
import type { Product } from '../../../types/database'

type ArticuloCardProps = {
  product: Product
}

export function ArticuloCard({ product }: ArticuloCardProps) {
  const storagePath = product.cover_image_path
  const hasFile = hasStorageCoverImage(storagePath)
  const coverSrc = hasFile ? getProductImagePublicUrl(storagePath) : DEFAULT_ARTICLE_IMAGE_PUBLIC_URL

  return (
    <Link
      to={`/inventario/articulos/${product.id}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-brand-border bg-brand-surface shadow-sm shadow-brand-ink/5 ring-1 ring-brand-border-subtle transition hover:border-brand-border-strong hover:shadow-md hover:ring-brand-blush/40"
    >
      <div
        className={`aspect-[4/3] w-full shrink-0 overflow-hidden ${
          hasFile ? 'bg-brand-canvas' : 'bg-white'
        }`}
      >
        <img
          src={coverSrc}
          alt=""
          loading="lazy"
          decoding="async"
          className={`h-full w-full transition duration-300 group-hover:scale-[1.02] ${
            hasFile ? 'object-cover' : 'object-contain p-2'
          }`}
        />
      </div>
      <div className="flex flex-col p-4">
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
      </div>
    </Link>
  )
}
