import { IconMinus, IconPlus, IconShoppingCart } from '@tabler/icons-react'
import { useEffect, useRef, useState } from 'react'
import {
  DEFAULT_ARTICLE_IMAGE_PUBLIC_URL,
  hasStorageCoverImage,
} from '../../../constants/defaultArticleImage'
import type { Product } from '../../../types/database'
import { getProductImagePublicUrl } from '../../media/services/storage.service'
import { effectiveSaleUnitPrice, formatARS, resolvedCartUnitPrice } from '../lib/pricing'

type VentaProductCardProps = {
  product: Product
  quantityInCart: number
  onAdd: () => void
}

export function VentaProductCard({ product, quantityInCart, onAdd }: VentaProductCardProps) {
  const storagePath = product.cover_image_path
  const hasFile = hasStorageCoverImage(storagePath)
  const coverSrc = hasFile ? getProductImagePublicUrl(storagePath) : DEFAULT_ARTICLE_IMAGE_PUBLIC_URL

  const imgRef = useRef<HTMLImageElement>(null)
  const [imgLoaded, setImgLoaded] = useState(false)
  useEffect(() => {
    if (imgRef.current?.complete) setImgLoaded(true)
  }, [coverSrc])

  const unit = effectiveSaleUnitPrice(product)
  const hasPromo = product.precio_promocional != null
  const stock = product.stock_actual
  const disabled = !product.activo || stock <= 0

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl bg-brand-surface ring-1 ring-brand-border transition hover:shadow-lg hover:ring-brand-blush-deep">
      {!product.activo && (
        <span className="absolute left-3 top-3 z-10 rounded-full bg-brand-ink/75 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white">
          Inactivo
        </span>
      )}

      <div className="relative aspect-4/3 shrink-0 overflow-hidden bg-brand-canvas">
        <img
          ref={imgRef}
          src={coverSrc}
          alt=""
          className={`h-full w-full object-cover transition duration-300 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
          loading="lazy"
          onLoad={() => setImgLoaded(true)}
        />
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div>
          <p className="line-clamp-2 text-sm font-semibold text-brand-ink">{product.name}</p>
          <p className="mt-0.5 font-mono text-xs text-brand-ink-faint">{product.sku}</p>
        </div>
        <div className="flex flex-wrap items-baseline gap-2">
          <span className="text-lg font-bold text-brand-ink">{formatARS(unit)}</span>
          {hasPromo && (
            <span className="text-xs text-brand-ink-faint line-through">{formatARS(product.precio_lista)}</span>
          )}
        </div>
        <p className="text-xs text-brand-ink-muted">
          Stock:{' '}
          <span className={stock <= 0 ? 'font-semibold text-red-600' : stock <= 5 ? 'font-semibold text-amber-700' : ''}>
            {stock}
          </span>
          {quantityInCart > 0 && (
            <span className="ml-2 text-brand-primary">· En carrito: {quantityInCart}</span>
          )}
        </p>

        <button
          type="button"
          disabled={disabled}
          onClick={onAdd}
          className="mt-auto inline-flex items-center justify-center gap-2 rounded-xl bg-brand-primary py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
        >
          <IconShoppingCart size={18} stroke={2} aria-hidden />
          {disabled ? (stock <= 0 ? 'Sin stock' : 'No disponible') : 'Agregar'}
        </button>
      </div>
    </div>
  )
}

export function CartLineRow({
  line,
  product,
  maxStock,
  onDec,
  onInc,
  onRemove,
}: {
  line: import('../store/cartStore').CartLine
  product?: import('../../../types/database').Product
  maxStock: number
  onDec: () => void
  onInc: () => void
  onRemove: () => void
}) {
  const unit = resolvedCartUnitPrice(line, product)
  const sub = line.cantidad * unit
  const fuente = line.precio_fuente ?? 'lista'
  const fuenteLabel =
    fuente === 'manual' ? 'Manual' : fuente === 'promo' ? 'Promo' : 'Lista'
  return (
    <div className="flex gap-3 rounded-xl border border-brand-border-subtle bg-white p-3">
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-brand-ink">{line.nombre}</p>
        <p className="font-mono text-xs text-brand-ink-faint">{line.sku}</p>
        <p className="mt-1 text-xs text-brand-ink-muted">
          {formatARS(unit)} c/u
          <span className="ml-1 rounded bg-brand-canvas px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-brand-ink-faint">
            {fuenteLabel}
          </span>
        </p>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-2">
        <div className="flex items-center gap-1 rounded-lg border border-brand-border bg-brand-canvas p-0.5">
          <button
            type="button"
            aria-label="Menos"
            onClick={onDec}
            className="rounded-md p-1.5 text-brand-ink-muted hover:bg-white hover:text-brand-ink"
          >
            <IconMinus size={14} stroke={2} />
          </button>
          <span className="min-w-[1.5rem] text-center text-sm font-semibold tabular-nums">{line.cantidad}</span>
          <button
            type="button"
            aria-label="Más"
            disabled={line.cantidad >= maxStock}
            onClick={onInc}
            className="rounded-md p-1.5 text-brand-ink-muted hover:bg-white hover:text-brand-ink disabled:opacity-40"
          >
            <IconPlus size={14} stroke={2} />
          </button>
        </div>
        <p className="text-sm font-semibold text-brand-ink">{formatARS(sub)}</p>
        <button type="button" onClick={onRemove} className="text-xs font-medium text-red-600 hover:underline">
          Quitar
        </button>
      </div>
    </div>
  )
}
