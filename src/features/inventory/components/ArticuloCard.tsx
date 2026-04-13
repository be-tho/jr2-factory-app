import { IconArrowUpRight } from '@tabler/icons-react'
import { useEffect, useRef, useState } from 'react'
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

type StockLevel = 'sin-stock' | 'bajo' | 'ok'

function getStockLevel(stock: number): StockLevel {
  if (stock === 0) return 'sin-stock'
  if (stock <= 5) return 'bajo'
  return 'ok'
}

const stockConfig: Record<StockLevel, { label: string; dot: string; text: string; bg: string }> = {
  'sin-stock': {
    label: 'Sin stock',
    dot: 'bg-red-400',
    text: 'text-red-700',
    bg: 'bg-red-50 ring-1 ring-red-200',
  },
  bajo: {
    label: 'Stock bajo',
    dot: 'bg-amber-400',
    text: 'text-amber-700',
    bg: 'bg-amber-50 ring-1 ring-amber-200',
  },
  ok: {
    label: '',
    dot: 'bg-brand-mint',
    text: 'text-brand-ink-muted',
    bg: '',
  },
}

export function ArticuloCard({ product }: ArticuloCardProps) {
  const storagePath = product.cover_image_path
  const hasFile = hasStorageCoverImage(storagePath)
  const coverSrc = hasFile
    ? getProductImagePublicUrl(storagePath)
    : DEFAULT_ARTICLE_IMAGE_PUBLIC_URL

  const imgRef = useRef<HTMLImageElement>(null)
  const [imgLoaded, setImgLoaded] = useState(false)

  useEffect(() => {
    if (imgRef.current?.complete) setImgLoaded(true)
  }, [coverSrc])

  const stockLevel = getStockLevel(product.stock_actual)
  const stockCfg = stockConfig[stockLevel]
  const hasPromo = product.precio_promocional != null
  const metaTag = [product.temporada].filter(Boolean).join('')

  return (
    <Link
      to={`/inventario/articulos/${product.id}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl bg-brand-surface ring-1 ring-brand-border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-brand-ink/8 hover:ring-brand-blush-deep"
    >
      {/* Inactive overlay indicator */}
      {!product.activo && (
        <span className="absolute left-3 top-3 z-20 rounded-full bg-brand-ink/80 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-white backdrop-blur-sm">
          Inactivo
        </span>
      )}

      {/* Image */}
      <div className="relative aspect-4/3 shrink-0 overflow-hidden bg-brand-canvas">
        <img
          ref={imgRef}
          src={coverSrc}
          alt=""
          loading="lazy"
          decoding="async"
          onLoad={() => setImgLoaded(true)}
          className={`h-full w-full transition-[opacity,transform] duration-500 group-hover:scale-[1.04] ${
            hasFile ? 'object-cover' : 'object-contain p-4'
          } ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
        />

        {/* Bottom gradient */}
        <div className="absolute inset-x-0 bottom-0 h-16 bg-linear-to-t from-black/30 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        {/* Category chip — bottom left */}
        {product.category && (
          <span className="absolute bottom-2.5 left-2.5 z-10 rounded-full bg-white/90 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-brand-ink-muted backdrop-blur-sm ring-1 ring-brand-border opacity-0 translate-y-1 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0">
            {product.category}
          </span>
        )}

        {/* Arrow icon — top right on hover */}
        <span className="absolute right-2.5 top-2.5 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-brand-primary text-white opacity-0 translate-y-1 shadow-md transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0">
          <IconArrowUpRight size={14} stroke={2.5} aria-hidden />
        </span>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col gap-1.5 p-4">
        {/* SKU + temporada */}
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center rounded-md bg-brand-primary-ghost px-2 py-0.5 font-mono text-[11px] font-semibold text-brand-primary ring-1 ring-brand-blush/50">
            {product.sku}
          </span>
          {metaTag && (
            <span className="text-[11px] font-medium text-brand-ink-faint">{metaTag}</span>
          )}
        </div>

        {/* Name */}
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-brand-ink transition-colors duration-200 group-hover:text-brand-primary">
          {product.name}
        </h3>

        {/* Footer */}
        <div className="mt-auto flex items-end justify-between gap-2 border-t border-brand-border-subtle pt-3">
          {/* Price block */}
          <div className="flex flex-col gap-0.5">
            {hasPromo ? (
              <>
                <span className="text-[11px] text-brand-ink-faint line-through">
                  ${product.precio_lista.toLocaleString('es-AR')}
                </span>
                <span className="text-base font-bold text-brand-primary leading-none">
                  ${product.precio_promocional!.toLocaleString('es-AR')}
                </span>
              </>
            ) : (
              <span className="text-base font-bold text-brand-ink leading-none">
                ${product.precio_lista.toLocaleString('es-AR')}
              </span>
            )}
          </div>

          {/* Stock badge */}
          {stockLevel !== 'ok' ? (
            <span
              className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${stockCfg.bg} ${stockCfg.text}`}
            >
              <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${stockCfg.dot}`} />
              {stockCfg.label}
            </span>
          ) : (
            <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium text-brand-ink-faint">
              <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${stockCfg.dot}`} />
              {product.stock_actual} uds.
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
