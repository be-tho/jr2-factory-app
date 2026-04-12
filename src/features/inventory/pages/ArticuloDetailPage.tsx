import {
  IconAlertCircle,
  IconArrowLeft,
  IconCalendar,
  IconClock,
  IconCoin,
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

// ── Skeleton loader ───────────────────────────────────────────────────────────
function DetailSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-8 w-40 rounded-lg bg-brand-border" />
      <div className="overflow-hidden rounded-2xl border border-brand-border bg-brand-surface shadow-sm">
        <div className="flex flex-col gap-0 lg:flex-row">
          <div className="aspect-square w-full bg-brand-blush/30 lg:w-[42%]" />
          <div className="flex-1 space-y-4 p-7">
            <div className="flex gap-2">
              <div className="h-6 w-16 rounded-full bg-brand-border" />
              <div className="h-6 w-20 rounded-full bg-brand-border" />
              <div className="h-6 w-18 rounded-full bg-brand-border" />
            </div>
            <div className="h-8 w-3/4 rounded-lg bg-brand-border" />
            <div className="h-5 w-24 rounded bg-brand-border" />
            <div className="mt-4 h-10 w-36 rounded-xl bg-brand-border" />
            <div className="mt-2 h-5 w-24 rounded bg-brand-border" />
            <div className="mt-4 space-y-2">
              <div className="h-4 w-full rounded bg-brand-border" />
              <div className="h-4 w-5/6 rounded bg-brand-border" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Shared back button ────────────────────────────────────────────────────────
function BackButton() {
  return (
    <Link
      to="/inventario/articulos"
      className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium text-brand-ink-muted transition hover:bg-brand-blush/40 hover:text-brand-ink"
    >
      <IconArrowLeft size={16} stroke={1.5} className="shrink-0" aria-hidden />
      Volver al listado
    </Link>
  )
}

// ── Meta info row ─────────────────────────────────────────────────────────────
function MetaItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 text-brand-ink-faint">{icon}</span>
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-brand-ink-faint">{label}</p>
        <p className="mt-0.5 break-all text-sm text-brand-ink">{value}</p>
      </div>
    </div>
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
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-brand-border bg-brand-surface px-8 py-16 text-center shadow-sm">
          <IconStack size={40} stroke={1.5} className="text-brand-ink-faint" aria-hidden />
          <p className="text-lg font-semibold text-brand-ink">Ruta inválida</p>
          <p className="text-sm text-brand-ink-muted">No se encontró el identificador del artículo.</p>
        </div>
      </div>
    )
  }

  if (isPending) return <DetailSkeleton />

  if (isError) {
    const msg = error instanceof Error ? error.message : 'Error desconocido'
    return (
      <div className="space-y-4">
        <BackButton />
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-red-200 bg-red-50 px-8 py-14 text-center shadow-sm">
          <IconAlertCircle size={40} stroke={1.5} className="text-red-500" aria-hidden />
          <div>
            <p className="text-lg font-semibold text-red-800">No se pudo cargar el artículo</p>
            <p className="mt-1 max-w-sm text-sm text-red-600">{msg}</p>
          </div>
          <button
            type="button"
            onClick={() => void refetch()}
            className="inline-flex items-center gap-2 rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-800 shadow-sm transition hover:bg-red-100"
          >
            <IconRefresh size={16} stroke={1.5} className="shrink-0" aria-hidden />
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  if (!article) {
    return (
      <div className="space-y-4">
        <BackButton />
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-brand-border bg-brand-surface px-8 py-16 text-center shadow-sm">
          <IconMoodEmpty size={44} stroke={1.5} className="text-brand-ink-faint" aria-hidden />
          <p className="text-lg font-semibold text-brand-ink">Artículo no encontrado</p>
          <p className="text-sm text-brand-ink-muted">Ese artículo no existe o no tenés permiso para verlo.</p>
        </div>
      </div>
    )
  }

  const product = article
  const storagePath = product.cover_image_path
  const hasFile = hasStorageCoverImage(storagePath)
  const coverSrc = hasFile ? getProductImagePublicUrl(storagePath) : DEFAULT_ARTICLE_IMAGE_PUBLIC_URL

  const hasPromo = product.precio_promocional != null
  const fmtARS = (n: number) => `$\u00A0${n.toLocaleString('es-AR')}`

  const stockLevel =
    product.stock_actual === 0
      ? 'empty'
      : product.stock_actual <= 5
        ? 'low'
        : 'ok'

  const stockStyles = {
    empty: 'bg-red-50 text-red-700 border-red-200',
    low: 'bg-amber-50 text-amber-700 border-amber-200',
    ok: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  }[stockLevel]

  const stockLabel = {
    empty: 'Sin stock',
    low: `${product.stock_actual} u. — stock bajo`,
    ok: `${product.stock_actual} unidades`,
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
      {/* ── Nav ── */}
      <BackButton />

      {/* ── Delete error banner ── */}
      {deleteError ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm">
          <p className="font-medium text-red-800">No se pudo borrar</p>
          <p className="mt-0.5 text-red-600">{deleteError}</p>
        </div>
      ) : null}

      {/* ── Hero card ── */}
      <article className="overflow-hidden rounded-2xl border border-brand-border bg-brand-surface shadow-sm ring-1 ring-brand-border-subtle">
        <div className="flex flex-col lg:flex-row">

          {/* Image panel */}
          <div
            className={`relative flex items-center justify-center lg:w-[42%] lg:shrink-0 ${
              hasFile
                ? 'aspect-square bg-brand-canvas'
                : 'aspect-square bg-white'
            }`}
          >
            <img
              src={coverSrc}
              alt={product.name}
              className={`h-full w-full ${hasFile ? 'object-cover' : 'object-contain p-10'}`}
              loading="eager"
              decoding="async"
            />
          </div>

          {/* Info panel */}
          <div className="flex flex-1 flex-col justify-between gap-6 p-6 sm:p-8">
            <div className="space-y-5">

              {/* Badges row */}
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

                {product.category ? (
                  <span className="inline-flex items-center gap-1 rounded-full border border-brand-blush-deep bg-brand-primary-ghost px-2.5 py-0.5 text-xs font-medium text-brand-primary-hover">
                    <IconTag size={11} stroke={2} aria-hidden />
                    {product.category}
                  </span>
                ) : null}

                {product.temporada ? (
                  <span className="inline-flex items-center gap-1 rounded-full border border-brand-border bg-brand-canvas px-2.5 py-0.5 text-xs font-medium text-brand-ink-muted">
                    <IconSeeding size={11} stroke={2} aria-hidden />
                    {product.temporada}
                  </span>
                ) : null}
              </div>

              {/* Name + SKU */}
              <div>
                <h1 className="text-2xl font-semibold leading-tight tracking-tight text-brand-ink sm:text-3xl">
                  {product.name}
                </h1>
                <p className="mt-1.5 font-mono text-sm text-brand-ink-faint">
                  SKU&nbsp;·&nbsp;{product.sku}
                </p>
              </div>

              {/* Price block */}
              <div className="space-y-1">
                {hasPromo ? (
                  <>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold tabular-nums text-brand-ink">
                        {fmtARS(product.precio_promocional!)}
                      </span>
                      <span className="rounded bg-brand-primary px-1.5 py-0.5 text-[11px] font-bold text-white">
                        PROMO
                      </span>
                    </div>
                    <p className="text-sm text-brand-ink-faint line-through">
                      Lista&nbsp;{fmtARS(product.precio_lista)}
                    </p>
                  </>
                ) : (
                  <span className="text-3xl font-bold tabular-nums text-brand-ink">
                    {fmtARS(product.precio_lista)}
                  </span>
                )}
              </div>

              {/* Stock badge */}
              <div>
                <span
                  className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium ${stockStyles}`}
                >
                  <IconPackage size={15} stroke={1.75} className="shrink-0" aria-hidden />
                  {stockLabel}
                </span>
              </div>

              {/* Description */}
              {product.descripcion?.trim() ? (
                <p className="text-sm leading-relaxed text-brand-ink-muted">
                  {product.descripcion.trim()}
                </p>
              ) : (
                <p className="text-sm italic text-brand-ink-faint">Sin descripción.</p>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap gap-2 border-t border-brand-border pt-5">
              <Link
                to={`/inventario/articulos/${product.id}/editar`}
                className="inline-flex items-center gap-2 rounded-lg bg-brand-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-primary-hover active:bg-brand-primary-active"
              >
                <IconPencil {...ic.btn} aria-hidden />
                Editar artículo
              </Link>
              <button
                type="button"
                disabled={deleteMutation.isPending}
                onClick={handleDelete}
                className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-2.5 text-sm font-medium text-red-700 transition hover:border-red-300 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <IconTrash {...ic.btn} aria-hidden />
                {deleteMutation.isPending ? 'Borrando…' : 'Borrar'}
              </button>
            </div>
          </div>
        </div>
      </article>

      {/* ── Technical details ── */}
      <section className="overflow-hidden rounded-2xl border border-brand-border bg-brand-surface shadow-sm ring-1 ring-brand-border-subtle">
        <header className="border-b border-brand-border bg-brand-canvas px-6 py-3.5">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-brand-ink-faint">
            Información técnica
          </h2>
        </header>
        <div className="grid gap-5 px-6 py-6 sm:grid-cols-2 lg:grid-cols-4">
          <MetaItem
            icon={<IconCoin size={16} stroke={1.5} />}
            label="Slug"
            value={product.slug}
          />
          <MetaItem
            icon={<IconCalendar size={16} stroke={1.5} />}
            label="Fecha de alta"
            value={new Date(product.created_at).toLocaleString('es-AR', {
              dateStyle: 'medium',
              timeStyle: 'short',
            })}
          />
          <MetaItem
            icon={<IconClock size={16} stroke={1.5} />}
            label="Última actualización"
            value={new Date(product.updated_at).toLocaleString('es-AR', {
              dateStyle: 'medium',
              timeStyle: 'short',
            })}
          />
          <MetaItem
            icon={<IconHash size={16} stroke={1.5} />}
            label="ID interno"
            value={product.id}
          />
        </div>
      </section>
    </div>
  )
}
