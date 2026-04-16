import { IconPhoto, IconSearch, IconX } from '@tabler/icons-react'
import { useMemo, useState, useEffect } from 'react'
import {
  DEFAULT_ARTICLE_IMAGE_PUBLIC_URL,
  hasStorageCoverImage,
} from '../../../constants/defaultArticleImage'
import { getProductImagePublicUrl } from '../../media/services/storage.service'
import { useProductsQuery } from '../../inventory/hooks/useProducts'
import type { Product } from '../../../types/database'
import { ArticuloImageModal } from './ArticuloImageModal'

interface ArticuloPickerModalProps {
  selected: Product[]
  onConfirm: (products: Product[]) => void
  onClose: () => void
}

function normalize(s: string) {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

export function ArticuloPickerModal({ selected, onConfirm, onClose }: ArticuloPickerModalProps) {
  const { data: allProducts = [], isPending } = useProductsQuery()
  const [query, setQuery] = useState('')
  const [picking, setPicking] = useState<Set<string>>(new Set(selected.map((p) => p.id)))
  const [imageTarget, setImageTarget] = useState<{ nombre: string; codigo: string; cover_image_path: string | null } | null>(null)

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape' && !imageTarget) onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose, imageTarget])

  const filtered = useMemo(() => {
    const q = normalize(query.trim())
    if (!q) return allProducts
    return allProducts.filter(
      (p) =>
        normalize(p.name).includes(q) ||
        normalize(p.sku).includes(q) ||
        normalize(p.category).includes(q),
    )
  }, [allProducts, query])

  function toggle(product: Product) {
    setPicking((prev) => {
      const next = new Set(prev)
      if (next.has(product.id)) {
        next.delete(product.id)
      } else {
        next.add(product.id)
      }
      return next
    })
  }

  function handleConfirm() {
    const chosen = allProducts.filter((p) => picking.has(p.id))
    onConfirm(chosen)
    onClose()
  }

  return (
    <>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Seleccionar artículos"
        className="fixed inset-0 z-40 flex items-center justify-center p-4"
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} aria-hidden />

        {/* Panel */}
        <div className="relative z-10 flex w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-brand-surface shadow-2xl ring-1 ring-brand-border" style={{ maxHeight: '85vh' }}>
          {/* Header */}
          <div className="flex items-center justify-between gap-4 border-b border-brand-border-subtle px-5 py-4">
            <div>
              <h2 className="font-semibold text-brand-ink">Seleccionar artículos</h2>
              <p className="text-xs text-brand-ink-faint">
                {picking.size === 0 ? 'Ninguno seleccionado' : `${picking.size} seleccionado${picking.size > 1 ? 's' : ''}`}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar selector"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-brand-ink-faint transition hover:bg-brand-canvas hover:text-brand-ink"
            >
              <IconX size={18} stroke={1.5} aria-hidden />
            </button>
          </div>

          {/* Search */}
          <div className="border-b border-brand-border-subtle px-4 py-3">
            <div className="relative">
              <IconSearch
                size={15}
                stroke={1.5}
                className="pointer-events-none absolute inset-y-0 left-3 my-auto text-brand-ink-faint"
                aria-hidden
              />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar por nombre, código o categoría…"
                className="w-full rounded-lg border border-brand-border-strong bg-brand-canvas py-2 pl-9 pr-3 text-sm text-brand-ink outline-none transition placeholder:text-brand-ink-faint focus:border-brand-primary focus:ring-2 focus:ring-brand-blush/50"
                autoFocus
              />
            </div>
          </div>

          {/* List */}
          <div className="overflow-y-auto flex-1">
            {isPending ? (
              <div className="flex items-center justify-center py-16">
                <p className="text-sm text-brand-ink-faint">Cargando artículos…</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex items-center justify-center py-16">
                <p className="text-sm text-brand-ink-faint">Ningún artículo coincide.</p>
              </div>
            ) : (
              <ul className="divide-y divide-brand-border-subtle">
                {filtered.map((product) => {
                  const isSelected = picking.has(product.id)
                  const imgSrc = hasStorageCoverImage(product.cover_image_path)
                    ? getProductImagePublicUrl(product.cover_image_path)
                    : DEFAULT_ARTICLE_IMAGE_PUBLIC_URL
                  const isPlaceholder = !hasStorageCoverImage(product.cover_image_path)

                  return (
                    <li key={product.id}>
                      <label className={`flex cursor-pointer items-center gap-3 px-5 py-3 transition ${isSelected ? 'bg-brand-primary-ghost' : 'hover:bg-brand-canvas'}`}>
                        {/* Checkbox */}
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggle(product)}
                          className="h-4 w-4 shrink-0 rounded border-brand-border-strong text-brand-primary focus:ring-brand-blush/50"
                        />

                        {/* Image */}
                        <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-brand-border bg-brand-canvas">
                          <img
                            src={imgSrc}
                            alt=""
                            className={`h-full w-full ${isPlaceholder ? 'object-contain p-1' : 'object-cover'}`}
                          />
                        </div>

                        {/* Info */}
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-brand-ink">{product.name}</p>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs text-brand-ink-faint">{product.sku}</span>
                            {product.category && (
                              <span className="rounded-full bg-brand-border-subtle px-1.5 py-0.5 text-[10px] text-brand-ink-faint">
                                {product.category}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Ver imagen */}
                        <button
                          type="button"
                          aria-label={`Ver imagen de ${product.name}`}
                          onClick={(e) => {
                            e.preventDefault()
                            setImageTarget({ nombre: product.name, codigo: product.sku, cover_image_path: product.cover_image_path })
                          }}
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-brand-ink-faint transition hover:bg-brand-blush/30 hover:text-brand-primary"
                        >
                          <IconPhoto size={16} stroke={1.5} aria-hidden />
                        </button>
                      </label>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between gap-3 border-t border-brand-border-subtle px-5 py-4">
            <p className="text-sm text-brand-ink-faint">
              {filtered.length} de {allProducts.length} artículos
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-brand-border px-4 py-2 text-sm font-medium text-brand-ink-muted transition hover:bg-brand-canvas"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                className="rounded-lg bg-brand-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-primary-hover"
              >
                Confirmar selección
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Image lightbox (higher z-index, inside modal stack) */}
      {imageTarget && (
        <div className="fixed inset-0 z-50">
          <ArticuloImageModal
            articulo={imageTarget}
            onClose={() => setImageTarget(null)}
          />
        </div>
      )}
    </>
  )
}
