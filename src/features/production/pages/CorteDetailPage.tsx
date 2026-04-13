import {
  IconArrowLeft,
  IconCalendar,
  IconEdit,
  IconExternalLink,
  IconPhoto,
  IconScissors,
  IconUser,
} from '@tabler/icons-react'
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ic } from '../../../lib/tabler'
import type { CorteEstado } from '../../../types/database'
import {
  DEFAULT_ARTICLE_IMAGE_PUBLIC_URL,
  hasStorageCoverImage,
} from '../../../constants/defaultArticleImage'
import { getCorteImageSignedUrl, getProductImagePublicUrl } from '../../media/services/storage.service'
import { useCorteQuery } from '../hooks/useCortes'
import { ArticuloImageModal } from '../components/ArticuloImageModal'

const ESTADO_CONFIG: Record<CorteEstado, { label: string; dot: string; bg: string; text: string }> = {
  pendiente:  { label: 'Pendiente',  dot: 'bg-amber-400',       bg: 'bg-amber-50 ring-1 ring-amber-200',  text: 'text-amber-700' },
  en_proceso: { label: 'En proceso', dot: 'bg-blue-400',        bg: 'bg-blue-50 ring-1 ring-blue-200',    text: 'text-blue-700' },
  completado: { label: 'Completado', dot: 'bg-brand-mint',      bg: 'bg-green-50 ring-1 ring-green-200',  text: 'text-green-700' },
  cancelado:  { label: 'Cancelado',  dot: 'bg-brand-ink-faint', bg: 'bg-gray-100 ring-1 ring-gray-200',   text: 'text-gray-500' },
}

const fieldClass = 'rounded-xl border border-brand-border bg-brand-canvas px-4 py-3'
const labelClass = 'text-xs font-semibold uppercase tracking-wider text-brand-ink-faint'
const valueClass = 'mt-1 text-sm font-medium text-brand-ink'

export function CorteDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data: corte, isPending: loading, isError } = useCorteQuery(id)
  const [imageTarget, setImageTarget] = useState<{ nombre: string; codigo: string; cover_image_path: string | null } | null>(null)
  const [plantillaUrl, setPlantillaUrl] = useState<string | null>(null)

  useEffect(() => {
    if (!corte?.imagen_path) return
    let cancelled = false
    getCorteImageSignedUrl(corte.imagen_path).then((url) => {
      if (!cancelled) setPlantillaUrl(url)
    })
    return () => { cancelled = true }
  }, [corte?.imagen_path])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-48 animate-pulse rounded-lg bg-brand-border" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-xl bg-brand-border" />
          ))}
        </div>
      </div>
    )
  }

  if (isError || !corte) {
    return (
      <div className="rounded-xl bg-red-50 px-5 py-4 text-sm ring-1 ring-red-200">
        <p className="font-semibold text-red-800">No se pudo cargar el corte</p>
        <p className="mt-1 text-red-600">Verificá que el corte exista.</p>
      </div>
    )
  }

  const estadoCfg = ESTADO_CONFIG[corte.estado]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-primary-ghost text-brand-primary">
              <IconScissors {...ic.headerSm} aria-hidden />
            </span>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-[#3d3b4f]">
                Corte #{corte.numero_corte}
              </h1>
              <span className={`mt-1 inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${estadoCfg.bg} ${estadoCfg.text}`}>
                <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${estadoCfg.dot}`} />
                {estadoCfg.label}
              </span>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            to="/produccion/cortes"
            className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium text-[#6e6b7b] transition hover:bg-white hover:text-[#3d3b4f] hover:shadow-sm"
          >
            <IconArrowLeft size={16} stroke={1.5} className="shrink-0" aria-hidden />
            Volver
          </Link>
          <Link
            to={`/produccion/cortes/${corte.id}/editar`}
            className="inline-flex items-center gap-1.5 rounded-lg bg-brand-primary px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-brand-primary-hover"
          >
            <IconEdit size={15} stroke={1.5} className="shrink-0" aria-hidden />
            Editar
          </Link>
        </div>
      </div>

      {/* Main info grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className={fieldClass}>
          <p className={labelClass}>
            <IconScissors size={12} className="mr-1 inline" aria-hidden />
            Tipo de Tela
          </p>
          <p className={valueClass}>{corte.tipo_tela}</p>
        </div>

        <div className={fieldClass}>
          <p className={labelClass}>
            <IconScissors size={12} className="mr-1 inline" aria-hidden />
            Cantidad Total (encimadas)
          </p>
          <p className={`${valueClass} font-mono text-lg font-bold text-brand-primary`}>
            {corte.cantidad_total}
          </p>
        </div>

        <div className={fieldClass}>
          <p className={labelClass}>
            <IconCalendar size={12} className="mr-1 inline" aria-hidden />
            Fecha
          </p>
          <p className={valueClass}>
            {new Date(corte.fecha + 'T00:00:00').toLocaleDateString('es-AR', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </p>
        </div>

        {corte.costureros && (
          <div className={fieldClass}>
            <p className={labelClass}>
              <IconUser size={12} className="mr-1 inline" aria-hidden />
              Costureros
            </p>
            <p className={valueClass}>{corte.costureros}</p>
          </div>
        )}

        {corte.descripcion && (
          <div className={`${fieldClass} sm:col-span-2 lg:col-span-${corte.costureros ? '2' : '3'}`}>
            <p className={labelClass}>Descripción</p>
            <p className="mt-1 text-sm text-brand-ink-muted leading-relaxed">{corte.descripcion}</p>
          </div>
        )}
      </div>

      {/* Artículos */}
      <section className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-black/4">
        <header className="border-b border-[#f0eef5] bg-[#f8f7fa] px-5 py-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-[#b9b6c3]">
            Artículos ({corte.articulos.length})
          </h2>
        </header>
        {corte.articulos.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-brand-ink-faint">Sin artículos vinculados.</p>
        ) : (
          <ul className="divide-y divide-brand-border-subtle">
            {corte.articulos.map((art) => {
              const imgSrc = hasStorageCoverImage(art.cover_image_path)
                ? getProductImagePublicUrl(art.cover_image_path)
                : DEFAULT_ARTICLE_IMAGE_PUBLIC_URL
              const isPlaceholder = !hasStorageCoverImage(art.cover_image_path)

              return (
                <li key={art.articulo_id} className="flex items-center gap-4 px-5 py-4">
                  {/* Image — click to enlarge */}
                  <button
                    type="button"
                    aria-label={`Ver imagen de ${art.nombre}`}
                    onClick={() => setImageTarget({ nombre: art.nombre, codigo: art.codigo, cover_image_path: art.cover_image_path })}
                    className="group relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-brand-border bg-brand-canvas transition hover:ring-2 hover:ring-brand-primary/40"
                  >
                    <img
                      src={imgSrc}
                      alt=""
                      className={`h-full w-full ${isPlaceholder ? 'object-contain p-1' : 'object-cover'}`}
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition group-hover:bg-black/25">
                      <IconPhoto
                        size={16}
                        stroke={2}
                        className="text-white opacity-0 transition group-hover:opacity-100"
                        aria-hidden
                      />
                    </div>
                  </button>

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-brand-ink">{art.nombre}</p>
                    <p className="font-mono text-xs text-brand-ink-faint">{art.codigo}</p>
                  </div>

                  <Link
                    to={`/inventario/articulos/${art.articulo_id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Abrir ficha de ${art.nombre}`}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-brand-border px-3 py-1.5 text-xs font-medium text-brand-ink-muted transition hover:border-brand-primary hover:text-brand-primary"
                  >
                    Ver artículo
                    <IconExternalLink size={12} stroke={1.5} aria-hidden />
                  </Link>
                </li>
              )
            })}
          </ul>
        )}
      </section>

      {/* Colores */}
      {corte.colores.length > 0 && (
        <section className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-black/4">
          <header className="border-b border-[#f0eef5] bg-[#f8f7fa] px-5 py-3">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-[#b9b6c3]">
              Colores con Cantidades ({corte.colores.length})
            </h2>
          </header>
          <div className="px-5 py-4">
            <div className="flex flex-wrap gap-2">
              {corte.colores.map((col) => (
                <div
                  key={col.id}
                  className="flex items-center gap-2 rounded-xl border border-brand-border bg-brand-canvas px-4 py-2.5"
                >
                  <span className="text-sm font-medium text-brand-ink">{col.color}</span>
                  <span className="rounded-full bg-brand-primary px-2 py-0.5 text-xs font-bold text-white">
                    {col.cantidad}
                  </span>
                </div>
              ))}
            </div>
            <p className="mt-3 text-xs text-brand-ink-faint">
              Total por colores:{' '}
              <span className="font-semibold text-brand-ink">
                {corte.colores.reduce((s, c) => s + c.cantidad, 0)} unidades
              </span>
            </p>
          </div>
        </section>
      )}

      {/* Plantilla del Corte */}
      {corte.imagen_path && (
        <section className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-black/4">
          <header className="border-b border-[#f0eef5] bg-[#f8f7fa] px-5 py-3">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-[#b9b6c3]">
              Plantilla del Corte
            </h2>
          </header>
          <div className="flex items-center justify-center p-6">
            {plantillaUrl ? (
              <img
                src={plantillaUrl}
                alt="Plantilla del corte"
                className="max-h-[480px] w-auto max-w-full rounded-xl border border-brand-border object-contain shadow-sm"
              />
            ) : (
              <div className="flex h-40 items-center justify-center gap-2 text-brand-ink-faint">
                <IconPhoto size={20} stroke={1.25} aria-hidden />
                <p className="text-sm">Cargando imagen…</p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Meta */}
      <div className="flex flex-wrap gap-4 text-xs text-brand-ink-faint">
        <span>
          Creado:{' '}
          {new Date(corte.created_at).toLocaleDateString('es-AR', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          })}
        </span>
        <span>
          Actualizado:{' '}
          {new Date(corte.updated_at).toLocaleDateString('es-AR', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          })}
        </span>
      </div>

      {/* Image lightbox */}
      {imageTarget && (
        <ArticuloImageModal articulo={imageTarget} onClose={() => setImageTarget(null)} />
      )}
    </div>
  )
}
