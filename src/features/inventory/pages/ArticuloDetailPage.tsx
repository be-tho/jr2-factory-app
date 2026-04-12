import {
  IconAlertCircle,
  IconArrowLeft,
  IconCalendar,
  IconClock,
  IconHash,
  IconMoodEmpty,
  IconPackage,
  IconPencil,
  IconRefresh,
  IconSeeding,
  IconStack,
  IconTag,
  IconTrash,
} from '@tabler/icons-react'
import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  DEFAULT_ARTICLE_IMAGE_PUBLIC_URL,
  hasStorageCoverImage,
} from '../../../constants/defaultArticleImage'
import { getProductImagePublicUrl } from '../../media/services/storage.service'
import { ic } from '../../../lib/tabler'
import { useDeleteProductMutation, useProductQuery } from '../hooks/useProducts'

// ── Island — white card base ──────────────────────────────────────────────────
function Island({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl bg-white shadow-sm ring-1 ring-black/4 ${className}`}>
      {children}
    </div>
  )
}

// ── Skeleton ──────────────────────────────────────────────────────────────────
function DetailSkeleton() {
  return (
    <div className="animate-pulse space-y-5">
      <div className="h-7 w-40 rounded-lg bg-white/80 shadow-sm" />
      <div className="grid gap-5 lg:grid-cols-[1fr_1.65fr]">
        <div className="flex flex-col gap-4">
          <div className="aspect-square rounded-xl bg-white shadow-sm" />
          <div className="h-32 rounded-xl bg-white shadow-sm" />
        </div>
        <div className="flex flex-col gap-4">
          <div className="h-40 rounded-xl bg-white shadow-sm" />
          <div className="grid grid-cols-2 gap-4">
            <div className="h-24 rounded-xl bg-white shadow-sm" />
            <div className="h-24 rounded-xl bg-white shadow-sm" />
          </div>
          <div className="h-28 rounded-xl bg-white shadow-sm" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-20 rounded-xl bg-white shadow-sm" />
        ))}
      </div>
    </div>
  )
}

// ── Back button ───────────────────────────────────────────────────────────────
function BackButton() {
  return (
    <Link
      to="/inventario/articulos"
      className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium text-[#6e6b7b] transition hover:bg-white hover:text-[#3d3b4f] hover:shadow-sm"
    >
      <IconArrowLeft size={16} stroke={1.5} className="shrink-0" aria-hidden />
      Volver al listado
    </Link>
  )
}

// ── Stat island ───────────────────────────────────────────────────────────────
function StatIsland({
  icon,
  label,
  value,
  valueClass = '',
  sub,
}: {
  icon: React.ReactNode
  label: string
  value: string
  valueClass?: string
  sub?: string
}) {
  return (
    <Island className="flex flex-col gap-1 p-4">
      <div className="flex items-center gap-2">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-primary-ghost text-brand-primary">
          {icon}
        </span>
        <p className="text-xs font-semibold uppercase tracking-wider text-[#b9b6c3]">{label}</p>
      </div>
      <p className={`mt-1 text-xl font-bold tabular-nums text-[#3d3b4f] ${valueClass}`}>{value}</p>
      {sub ? <p className="text-xs text-[#b9b6c3]">{sub}</p> : null}
    </Island>
  )
}

// ── Meta item ─────────────────────────────────────────────────────────────────
function MetaIsland({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <Island className="flex items-start gap-3 p-4">
      <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#f8f7fa] text-[#b9b6c3]">
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-[#b9b6c3]">{label}</p>
        <p className="mt-0.5 break-all text-sm font-medium text-[#3d3b4f]">{value}</p>
      </div>
    </Island>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
export function ArticuloDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: article, isPending, isError, error, refetch } = useProductQuery(id)
  const deleteMutation = useDeleteProductMutation()
  const [deleteError, setDeleteError] = useState<string | null>(null)

  if (!id) {
    return (

        <div className="space-y-4">
          <BackButton />
          <Island className="flex flex-col items-center gap-3 px-8 py-16 text-center">
            <IconStack size={40} stroke={1.5} className="text-[#b9b6c3]" aria-hidden />
            <p className="text-lg font-semibold text-[#3d3b4f]">Ruta inválida</p>
            <p className="text-sm text-[#6e6b7b]">No se encontró el identificador del artículo.</p>
          </Island>
        </div>
  
    )
  }

  if (isPending) return <DetailSkeleton />

  if (isError) {
    const msg = error instanceof Error ? error.message : 'Error desconocido'
    return (

        <div className="space-y-4">
          <BackButton />
          <Island className="flex flex-col items-center gap-4 px-8 py-14 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
              <IconAlertCircle size={28} stroke={1.5} className="text-red-500" aria-hidden />
            </span>
            <div>
              <p className="text-lg font-semibold text-[#3d3b4f]">No se pudo cargar el artículo</p>
              <p className="mt-1 max-w-sm text-sm text-[#6e6b7b]">{msg}</p>
            </div>
            <button
              type="button"
              onClick={() => void refetch()}
              className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-700 shadow-sm transition hover:bg-red-50"
            >
              <IconRefresh size={16} stroke={1.5} className="shrink-0" aria-hidden />
              Reintentar
            </button>
          </Island>
        </div>
  
    )
  }

  if (!article) {
    return (

        <div className="space-y-4">
          <BackButton />
          <Island className="flex flex-col items-center gap-3 px-8 py-16 text-center">
            <IconMoodEmpty size={44} stroke={1.5} className="text-[#b9b6c3]" aria-hidden />
            <p className="text-lg font-semibold text-[#3d3b4f]">Artículo no encontrado</p>
            <p className="text-sm text-[#6e6b7b]">
              Ese artículo no existe o no tenés permiso para verlo.
            </p>
          </Island>
        </div>
  
    )
  }

  const product = article
  const storagePath = product.cover_image_path
  const hasFile = hasStorageCoverImage(storagePath)
  const coverSrc = hasFile ? getProductImagePublicUrl(storagePath) : DEFAULT_ARTICLE_IMAGE_PUBLIC_URL

  const hasPromo = product.precio_promocional != null
  const fmtARS = (n: number) => `$ ${n.toLocaleString('es-AR')}`

  const stockLevel =
    product.stock_actual === 0 ? 'empty' : product.stock_actual <= 5 ? 'low' : 'ok'

  const stockMeta = {
    empty: { label: 'Sin stock', sub: 'Reponer urgente', cls: 'text-red-600' },
    low: { label: `${product.stock_actual} unidades`, sub: 'Stock bajo', cls: 'text-amber-600' },
    ok: { label: `${product.stock_actual} unidades`, sub: 'Stock disponible', cls: 'text-emerald-600' },
  }[stockLevel]

  function handleDelete() {
    const ok = window.confirm(
      `¿Borrar "${product.name}" (${product.sku})? Esta acción no se puede deshacer. También se eliminarán las imágenes asociadas en Storage.`,
    )
    if (!ok) return
    setDeleteError(null)
    deleteMutation.mutate(product.id, {
      onSuccess: () => navigate('/inventario/articulos', { replace: true }),
      onError: (e) => {
        setDeleteError(e instanceof Error ? e.message : 'No se pudo borrar.')
      },
    })
  }

  return (
    <div className="space-y-5">

        {/* ── Top bar ── */}
        <div className="flex items-center justify-between gap-4">
          <BackButton />
          <div className="flex items-center gap-2">
            <Link
              to={`/inventario/articulos/${product.id}/editar`}
              className="inline-flex items-center gap-1.5 rounded-lg bg-brand-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-primary-hover active:bg-brand-primary-active"
            >
              <IconPencil {...ic.btn} aria-hidden />
              Editar
            </Link>
            <button
              type="button"
              disabled={deleteMutation.isPending}
              onClick={handleDelete}
              className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-600 shadow-sm transition hover:border-red-300 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <IconTrash {...ic.btn} aria-hidden />
              {deleteMutation.isPending ? 'Borrando…' : 'Borrar'}
            </button>
          </div>
        </div>

        {/* ── Delete error ── */}
        {deleteError ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm">
            <p className="font-medium text-red-800">No se pudo borrar</p>
            <p className="mt-0.5 text-red-600">{deleteError}</p>
          </div>
        ) : null}

        {/* ── Main grid ── */}
        <div className="grid gap-5 lg:grid-cols-[1fr_1.65fr]">

          {/* LEFT COLUMN */}
          <div className="flex flex-col gap-4">

            {/* Image island */}
            <Island className="overflow-hidden">
              <div
                className={`aspect-square w-full ${hasFile ? 'bg-[#f8f7fa]' : 'bg-white'}`}
              >
                <img
                  src={coverSrc}
                  alt={product.name}
                  className={`h-full w-full ${hasFile ? 'object-cover' : 'object-contain p-10'}`}
                  loading="eager"
                  decoding="async"
                />
              </div>
            </Island>

            {/* Identification island */}
            <Island className="divide-y divide-[#f0eef5]">
              <div className="px-4 py-3">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-[#b9b6c3]">
                  Identificación
                </p>
              </div>
              <div className="flex items-center gap-3 px-4 py-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#f8f7fa]">
                  <IconHash size={14} stroke={2} className="text-[#b9b6c3]" aria-hidden />
                </span>
                <div>
                  <p className="text-[10px] text-[#b9b6c3]">SKU</p>
                  <p className="font-mono text-sm font-semibold text-[#3d3b4f]">{product.sku}</p>
                </div>
              </div>
              {product.category ? (
                <div className="flex items-center gap-3 px-4 py-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-brand-primary-ghost">
                    <IconTag size={14} stroke={2} className="text-brand-primary" aria-hidden />
                  </span>
                  <div>
                    <p className="text-[10px] text-[#b9b6c3]">Categoría</p>
                    <p className="text-sm font-semibold text-[#3d3b4f]">{product.category}</p>
                  </div>
                </div>
              ) : null}
              {product.temporada ? (
                <div className="flex items-center gap-3 px-4 py-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#f8f7fa]">
                    <IconSeeding size={14} stroke={2} className="text-[#b9b6c3]" aria-hidden />
                  </span>
                  <div>
                    <p className="text-[10px] text-[#b9b6c3]">Temporada</p>
                    <p className="text-sm font-semibold text-[#3d3b4f]">{product.temporada}</p>
                  </div>
                </div>
              ) : null}
            </Island>
          </div>

          {/* RIGHT COLUMN */}
          <div className="flex flex-col gap-4">

            {/* Name + status island */}
            <Island className="p-5">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
                    product.activo
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                      : 'border-stone-200 bg-stone-100 text-stone-500'
                  }`}
                >
                  <span
                    className={`inline-block h-1.5 w-1.5 rounded-full ${product.activo ? 'bg-emerald-500' : 'bg-stone-400'}`}
                    aria-hidden
                  />
                  {product.activo ? 'Activo' : 'Inactivo'}
                </span>
              </div>
              <h1 className="mt-3 text-2xl font-bold leading-snug tracking-tight text-[#3d3b4f] sm:text-3xl">
                {product.name}
              </h1>
              <p className="mt-1 font-mono text-sm text-[#b9b6c3]">SKU&nbsp;·&nbsp;{product.sku}</p>
            </Island>

            {/* Stats row: Precio + Stock */}
            <div className="grid grid-cols-2 gap-4">
              <StatIsland
                icon={<span className="text-base font-bold">$</span>}
                label="Precio lista"
                value={fmtARS(product.precio_lista)}
                sub={hasPromo ? `Promo: ${fmtARS(product.precio_promocional!)}` : undefined}
              />
              <StatIsland
                icon={<IconPackage size={16} stroke={1.75} />}
                label="Stock actual"
                value={stockMeta.label}
                valueClass={stockMeta.cls}
                sub={stockMeta.sub}
              />
            </div>

            {/* Promo island — only when there's a promotional price */}
            {hasPromo ? (
              <Island className="flex items-center gap-4 p-4">
                <span className="shrink-0 rounded-lg bg-brand-primary px-2 py-1 text-xs font-bold text-white">
                  PROMO
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold tabular-nums text-brand-primary">
                    {fmtARS(product.precio_promocional!)}
                  </span>
                  <span className="text-sm text-[#b9b6c3] line-through">
                    {fmtARS(product.precio_lista)}
                  </span>
                </div>
              </Island>
            ) : null}

            {/* Description island */}
            <Island className="flex-1 p-5">
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-[#b9b6c3]">
                Descripción
              </p>
              {product.descripcion?.trim() ? (
                <p className="text-sm leading-relaxed text-[#6e6b7b]">
                  {product.descripcion.trim()}
                </p>
              ) : (
                <p className="text-sm italic text-[#b9b6c3]">Sin descripción cargada.</p>
              )}
            </Island>
          </div>
        </div>

        {/* ── Meta islands strip ── */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <MetaIsland
            icon={<IconCalendar size={15} stroke={1.5} />}
            label="Fecha de alta"
            value={new Date(product.created_at).toLocaleString('es-AR', {
              dateStyle: 'medium',
              timeStyle: 'short',
            })}
          />
          <MetaIsland
            icon={<IconClock size={15} stroke={1.5} />}
            label="Actualización"
            value={new Date(product.updated_at).toLocaleString('es-AR', {
              dateStyle: 'medium',
              timeStyle: 'short',
            })}
          />
          <MetaIsland
            icon={<IconTag size={15} stroke={1.5} />}
            label="Slug"
            value={product.slug}
          />
          <MetaIsland
            icon={<IconHash size={15} stroke={1.5} />}
            label="ID interno"
            value={product.id}
          />
        </div>

      </div>
  )
}
