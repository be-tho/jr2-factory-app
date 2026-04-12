import {
  IconAlertTriangle,
  IconArrowLeft,
  IconCalendar,
  IconDownload,
  IconEdit,
  IconFile,
  IconLoader2,
  IconRuler,
  IconTrash,
} from '@tabler/icons-react'
import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  DEFAULT_ARTICLE_IMAGE_PUBLIC_URL,
  hasStorageCoverImage,
} from '../../../constants/defaultArticleImage'
import { ic } from '../../../lib/tabler'
import { getProductImagePublicUrl } from '../../media/services/storage.service'
import { useDeletePatronMutation, usePatronQuery } from '../hooks/usePatrones'
import { downloadPatronFile } from '../services/patrones.service'

function formatFileSize(bytes: number | null): string {
  if (bytes == null) return '—'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

export function PatronDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: patron, isPending: loading, isError, error } = usePatronQuery(id)
  const deleteMutation = useDeletePatronMutation()

  const [downloading, setDownloading] = useState(false)
  const [downloadError, setDownloadError] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const storagePath = patron?.articulo_cover_image_path ?? null
  const hasFile = hasStorageCoverImage(storagePath)
  const coverSrc = hasFile ? getProductImagePublicUrl(storagePath) : DEFAULT_ARTICLE_IMAGE_PUBLIC_URL

  const imgRef = useRef<HTMLImageElement>(null)
  const [imgLoaded, setImgLoaded] = useState(false)
  useEffect(() => {
    if (imgRef.current?.complete) setImgLoaded(true)
  }, [coverSrc])

  async function handleDownload() {
    if (!patron) return
    setDownloadError(null)
    setDownloading(true)
    try {
      await downloadPatronFile(patron.storage_path, patron.file_name)
    } catch (e) {
      setDownloadError(e instanceof Error ? e.message : 'Error al descargar el archivo.')
    } finally {
      setDownloading(false)
    }
  }

  function handleDelete() {
    if (!patron) return
    deleteMutation.mutate(patron.id, {
      onSuccess: () => {
        navigate('/produccion/patrones', { replace: true })
      },
    })
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 animate-pulse rounded-lg bg-[#f0eef5]" />
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="aspect-4/3 animate-pulse rounded-xl bg-[#f0eef5]" />
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className={`h-4 animate-pulse rounded bg-[#f0eef5] ${i === 1 ? 'w-3/4' : i === 2 ? 'w-1/2' : 'w-full'}`} />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (isError || !patron) {
    return (
      <div className="rounded-xl bg-red-50 px-5 py-6 ring-1 ring-red-200">
        <p className="font-semibold text-red-800">No se pudo cargar el patrón</p>
        <p className="mt-1 text-sm text-red-600">
          {error instanceof Error ? error.message : 'Patrón no encontrado.'}
        </p>
        <Link
          to="/produccion/patrones"
          className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-brand-primary hover:underline"
        >
          <IconArrowLeft size={16} stroke={1.5} aria-hidden />
          Volver al listado
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link
            to="/produccion/patrones"
            className="inline-flex items-center gap-1.5 text-sm text-brand-ink-muted transition hover:text-brand-primary"
          >
            <IconArrowLeft size={15} stroke={1.5} aria-hidden />
            Patrones
          </Link>
          <div className="mt-2 flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-primary-ghost text-brand-primary">
              <IconRuler {...ic.headerSm} aria-hidden />
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-[#3d3b4f]">{patron.nombre}</h1>
          </div>
          <p className="mt-1.5 text-sm text-[#6e6b7b]">{patron.articulo_nombre}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Link
            to={`/produccion/patrones/${patron.id}/editar`}
            className="inline-flex items-center gap-2 rounded-lg border border-[#e8e4f0] bg-white px-3 py-2 text-sm font-semibold text-[#6e6b7b] shadow-sm transition hover:bg-[#f8f7fa] hover:text-[#3d3b4f]"
          >
            <IconEdit size={16} stroke={1.5} aria-hidden />
            Editar
          </Link>
          {!confirmDelete ? (
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-white px-3 py-2 text-sm font-semibold text-red-600 shadow-sm transition hover:bg-red-50"
            >
              <IconTrash size={16} stroke={1.5} aria-hidden />
              Eliminar
            </button>
          ) : (
            <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2">
              <IconAlertTriangle size={15} stroke={1.5} className="shrink-0 text-red-600" aria-hidden />
              <span className="text-sm text-red-700">¿Confirmás?</span>
              <button
                type="button"
                disabled={deleteMutation.isPending}
                onClick={handleDelete}
                className="rounded-md bg-red-600 px-2 py-0.5 text-xs font-semibold text-white transition hover:bg-red-700 disabled:opacity-60"
              >
                {deleteMutation.isPending ? 'Eliminando…' : 'Sí, eliminar'}
              </button>
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                className="text-xs font-semibold text-red-600 hover:underline"
              >
                No
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Cover image (from article) */}
        <div className={`aspect-4/3 overflow-hidden rounded-xl ${hasFile ? 'bg-brand-canvas' : 'bg-white'} ring-1 ring-brand-border`}>
          <img
            ref={imgRef}
            src={coverSrc}
            alt={patron.articulo_nombre}
            loading="lazy"
            decoding="async"
            onLoad={() => setImgLoaded(true)}
            className={`h-full w-full transition-opacity duration-300 ${hasFile ? 'object-cover' : 'object-contain p-6'} ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
          />
        </div>

        {/* Details card */}
        <div className="flex flex-col gap-4 rounded-xl bg-white p-6 shadow-sm ring-1 ring-black/4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-brand-ink-faint">Artículo vinculado</p>
            <Link
              to={`/inventario/articulos/${patron.articulo_id}`}
              className="mt-1 inline-flex items-center gap-1 text-sm font-semibold text-brand-primary hover:underline"
            >
              {patron.articulo_nombre}
              <span className="font-mono text-xs text-brand-ink-muted">({patron.articulo_sku})</span>
            </Link>
          </div>

          {patron.descripcion && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-brand-ink-faint">Descripción</p>
              <p className="mt-1 text-sm text-brand-ink-muted">{patron.descripcion}</p>
            </div>
          )}

          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-brand-ink-faint">Archivo</p>
            <div className="mt-2 flex items-center gap-3 rounded-lg bg-[#f8f7fa] px-4 py-3 ring-1 ring-[#e8e4f0]">
              <IconFile size={20} stroke={1.5} className="shrink-0 text-brand-ink-faint" aria-hidden />
              <div className="min-w-0 flex-1">
                <p className="truncate font-mono text-sm font-medium text-brand-ink">{patron.file_name}</p>
                <p className="text-xs text-brand-ink-faint">
                  {[patron.file_type?.toUpperCase(), formatFileSize(patron.file_size)]
                    .filter(Boolean)
                    .join(' · ')}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-brand-ink-faint">
            <IconCalendar size={14} stroke={1.5} aria-hidden />
            Cargado el{' '}
            {new Date(patron.created_at).toLocaleDateString('es-AR', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </div>

          {/* Download */}
          <div className="mt-auto border-t border-brand-border-subtle pt-4">
            {downloadError && (
              <p className="mb-2 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700 ring-1 ring-red-200">
                {downloadError}
              </p>
            )}
            <button
              type="button"
              disabled={downloading}
              onClick={() => void handleDownload()}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-brand-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
            >
              {downloading ? (
                <IconLoader2 size={18} stroke={1.5} className="animate-spin" aria-hidden />
              ) : (
                <IconDownload size={18} stroke={1.5} aria-hidden />
              )}
              {downloading ? 'Preparando descarga…' : 'Descargar patrón'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
