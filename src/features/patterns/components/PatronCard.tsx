import { IconChevronRight, IconFile } from '@tabler/icons-react'
import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import type { Patron } from '../../../types/database'
import { getPatternImagePublicUrl } from '../services/patrones.service'

type PatronCardProps = {
  patron: Patron
}

function formatFileSize(bytes: number | null): string {
  if (bytes == null) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

export function PatronCard({ patron }: PatronCardProps) {
  const imagePath = patron.image_path
  const hasImage = typeof imagePath === 'string' && imagePath.length > 0
  const coverSrc = hasImage ? getPatternImagePublicUrl(imagePath) : null

  const imgRef = useRef<HTMLImageElement>(null)
  const [imgLoaded, setImgLoaded] = useState(false)

  useEffect(() => {
    if (imgRef.current?.complete) setImgLoaded(true)
  }, [coverSrc])

  return (
    <Link
      to={`/produccion/patrones/${patron.id}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-brand-border bg-brand-surface shadow-sm shadow-brand-ink/5 ring-1 ring-brand-border-subtle transition hover:border-brand-border-strong hover:shadow-md hover:ring-brand-blush/40"
    >
      <div
        className={`aspect-4/3 w-full shrink-0 overflow-hidden ${
          hasImage ? 'bg-brand-canvas' : 'bg-white'
        }`}
      >
        {coverSrc ? (
          <img
            ref={imgRef}
            src={coverSrc}
            alt=""
            loading="lazy"
            decoding="async"
            onLoad={() => setImgLoaded(true)}
            className={`h-full w-full object-cover transition-[opacity,transform] duration-300 group-hover:scale-[1.02] ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-[#f8f7fa] text-sm font-medium text-brand-ink-faint">
            Sin foto
          </div>
        )}
      </div>

      <div className="flex flex-col p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-brand-ink-faint">
          {patron.articulo_sku || '—'}
        </p>
        <h3 className="mt-1 line-clamp-2 text-base font-semibold text-brand-ink group-hover:text-brand-primary-hover">
          {patron.nombre}
        </h3>
        <p className="mt-1 line-clamp-1 text-sm text-brand-ink-muted">{patron.articulo_nombre}</p>

        <div className="mt-3 flex items-center gap-1.5 rounded-lg bg-[#f8f7fa] px-2.5 py-1.5">
          <IconFile size={14} stroke={1.5} className="shrink-0 text-brand-ink-faint" aria-hidden />
          <span className="min-w-0 flex-1 truncate font-mono text-xs text-brand-ink-muted">
            {patron.file_name}
          </span>
          {patron.file_size != null && (
            <span className="shrink-0 text-xs text-brand-ink-faint">
              {formatFileSize(patron.file_size)}
            </span>
          )}
        </div>

        <div className="mt-auto flex items-center justify-between gap-2 border-t border-brand-border-subtle pt-3">
          <p className="text-xs text-brand-ink-faint">
            {new Date(patron.created_at).toLocaleDateString('es-AR', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })}
          </p>
          <IconChevronRight size={16} stroke={1.5} className="shrink-0 text-brand-ink-faint" aria-hidden />
        </div>
      </div>
    </Link>
  )
}
