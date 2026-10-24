import { IconX } from '@tabler/icons-react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useEffect } from 'react'
import { createPortal } from 'react-dom'
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
  const reduceMotion = useReducedMotion()

  useEffect(() => {
    if (!articulo) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [articulo, onClose])

  useEffect(() => {
    if (!articulo) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [articulo])

  if (typeof document === 'undefined') return null

  return createPortal(
    <AnimatePresence>
      {articulo && (
        <motion.div
          key={articulo.codigo}
          role="dialog"
          aria-modal="true"
          aria-label={`Imagen de ${articulo.nombre}`}
          className="fixed inset-0 z-100 flex items-center justify-center p-4 sm:p-8"
          initial={reduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.2 }}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) onClose()
          }}
        >
          <motion.div
            className="absolute inset-0 bg-modal-scrim"
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.2 }}
            aria-hidden
            onClick={onClose}
          />

          <motion.div
            className="relative z-10 flex w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-brand-surface shadow-2xl ring-1 ring-brand-border"
            initial={reduceMotion ? false : { opacity: 0, y: 18, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={
              reduceMotion
                ? { duration: 0 }
                : { type: 'spring', stiffness: 420, damping: 34, mass: 0.8 }
            }
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 border-b border-brand-border-subtle px-5 py-4">
              <div className="min-w-0">
                <p className="truncate font-semibold text-brand-ink">{articulo.nombre}</p>
                <p className="font-mono text-xs text-brand-ink-faint">{articulo.codigo}</p>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Cerrar imagen"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-brand-ink-faint transition hover:bg-brand-canvas hover:text-brand-ink"
              >
                <IconX size={20} stroke={1.5} aria-hidden />
              </button>
            </div>

            <div className="flex min-h-[min(50vh,320px)] max-h-[min(78vh,720px)] items-center justify-center bg-brand-canvas p-4 sm:p-6">
              <img
                src={
                  hasStorageCoverImage(articulo.cover_image_path)
                    ? getProductImagePublicUrl(articulo.cover_image_path)
                    : DEFAULT_ARTICLE_IMAGE_PUBLIC_URL
                }
                alt={articulo.nombre}
                className="max-h-[min(72vh,680px)] max-w-full object-contain"
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
