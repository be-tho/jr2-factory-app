import { IconX } from '@tabler/icons-react'
import { useEffect } from 'react'
import {
  DEFAULT_ARTICLE_IMAGE_PUBLIC_URL,
  hasStorageCoverImage,
} from '../../../constants/defaultArticleImage'
import { getProductImagePublicUrl } from '../../media/services/storage.service'

interface ArticuloImageModalProps {
  articulo: {
    nombre: string
    codigo: string
    cover_image_path: string | null
  } | null
  onClose: () => void
}

export function ArticuloImageModal({ articulo, onClose }: ArticuloImageModalProps) {
  useEffect(() => {
    if (!articulo) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [articulo, onClose])

  if (!articulo) return null

  const src = hasStorageCoverImage(articulo.cover_image_path)
    ? getProductImagePublicUrl(articulo.cover_image_path)
    : DEFAULT_ARTICLE_IMAGE_PUBLIC_URL

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Imagen de ${articulo.nombre}`}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />

      {/* Panel */}
      <div className="relative z-10 flex w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-brand-surface shadow-2xl ring-1 ring-brand-border">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-brand-border-subtle px-5 py-4">
          <div>
            <p className="font-semibold text-brand-ink">{articulo.nombre}</p>
            <p className="font-mono text-xs text-brand-ink-faint">{articulo.codigo}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar imagen"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-brand-ink-faint transition hover:bg-brand-canvas hover:text-brand-ink"
          >
            <IconX size={18} stroke={1.5} aria-hidden />
          </button>
        </div>

        {/* Image */}
        <div className="flex aspect-square items-center justify-center bg-brand-canvas p-4">
          <img
            src={src}
            alt={articulo.nombre}
            className="h-full w-full object-contain"
          />
        </div>
      </div>
    </div>
  )
}
