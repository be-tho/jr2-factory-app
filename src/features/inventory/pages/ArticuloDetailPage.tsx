import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { PageHeader } from '../../../components/ui/PageHeader'
import {
  DEFAULT_ARTICLE_IMAGE_PUBLIC_URL,
  hasStorageCoverImage,
} from '../../../constants/defaultArticleImage'
import { getProductImagePublicUrl } from '../../media/services/storage.service'
import type { Product } from '../../../types/database'
import { deleteProduct, getProductById } from '../services/products.service'

export function ArticuloDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [article, setArticle] = useState<Product | null | undefined>(undefined)
  const [error, setError] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) {
      setArticle(null)
      return
    }

    let cancelled = false
    setArticle(undefined)
    setError(null)

    void (async () => {
      const { data, error: err } = await getProductById(id)
      if (cancelled) return
      if (err) {
        setError(err.message)
        setArticle(null)
        return
      }
      setArticle(data)
    })()

    return () => {
      cancelled = true
    }
  }, [id])

  if (article === undefined && !error) {
    return (
      <div className="space-y-6">
        <PageHeader title="Artículo" description="Cargando ficha…" />
        <p className="text-sm text-brand-ink-muted">Cargando…</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader title="Error" description="No se pudo cargar el artículo." />
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p>
        <Link
          to="/inventario/articulos"
          className="inline-flex rounded-lg border border-brand-border-strong bg-brand-primary px-4 py-2 text-sm font-medium text-brand-ink shadow-sm transition hover:bg-brand-primary-hover"
        >
          Volver al listado
        </Link>
      </div>
    )
  }

  if (!article) {
    return (
      <div className="space-y-6">
        <PageHeader title="Artículo no encontrado" description="Ese artículo no existe o no tenés permiso para verlo." />
        <Link
          to="/inventario/articulos"
          className="inline-flex rounded-lg border border-brand-border-strong bg-brand-primary px-4 py-2 text-sm font-medium text-brand-ink shadow-sm transition hover:bg-brand-primary-hover"
        >
          Volver al listado
        </Link>
      </div>
    )
  }

  const storagePath = article.cover_image_path
  const hasFile = hasStorageCoverImage(storagePath)
  const coverSrc = hasFile ? getProductImagePublicUrl(storagePath) : DEFAULT_ARTICLE_IMAGE_PUBLIC_URL

  const created = new Date(article.created_at)
  const precioLabel =
    article.precio_promocional != null
      ? `${article.precio_promocional.toLocaleString('es-AR')} (lista ${article.precio_lista.toLocaleString('es-AR')})`
      : article.precio_lista.toLocaleString('es-AR')

  async function handleDelete() {
    if (!article) return
    const ok = window.confirm(
      `¿Borrar “${article.name}” (${article.sku})? Esta acción no se puede deshacer. También se eliminarán las imágenes asociadas en Storage.`
    )
    if (!ok) return
    setDeleting(true)
    setDeleteError(null)
    const { error: delErr } = await deleteProduct(article.id)
    setDeleting(false)
    if (delErr) {
      setDeleteError(delErr.message)
      return
    }
    navigate('/inventario/articulos', { replace: true })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <PageHeader
          title={article.name}
          description={`${article.activo ? 'Activo' : 'Inactivo'} · SKU ${article.sku} · ${[article.category, article.temporada].filter(Boolean).join(' · ') || '—'}`}
        />
        <div className="flex shrink-0 flex-col gap-2 self-start sm:flex-row sm:items-center">
          <Link
            to={`/inventario/articulos/${article.id}/editar`}
            className="inline-flex justify-center rounded-lg border border-brand-border-strong bg-brand-primary px-4 py-2 text-sm font-medium text-brand-ink shadow-sm transition hover:bg-brand-primary-hover"
          >
            Editar
          </Link>
          <button
            type="button"
            disabled={deleting}
            onClick={() => void handleDelete()}
            className="inline-flex justify-center rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-800 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {deleting ? 'Borrando…' : 'Borrar'}
          </button>
          <Link
            to="/inventario/articulos"
            className="inline-flex justify-center rounded-lg border border-brand-border bg-brand-surface px-4 py-2 text-sm font-medium text-brand-ink-muted transition hover:border-brand-border-strong hover:text-brand-ink"
          >
            ← Volver
          </Link>
        </div>
      </div>

      {deleteError ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          <p className="font-medium">No se pudo borrar</p>
          <p className="mt-1 text-red-700">{deleteError}</p>
        </div>
      ) : null}

      <section className="overflow-hidden rounded-xl border border-brand-border bg-brand-surface shadow-sm shadow-brand-ink/5 ring-1 ring-brand-border-subtle">
        <div
          className={`aspect-[4/3] w-full overflow-hidden sm:aspect-[16/10] sm:max-h-[min(70vh,32rem)] sm:mx-auto sm:max-w-4xl ${
            hasFile ? 'bg-brand-canvas' : 'bg-white'
          }`}
        >
          <img
            src={coverSrc}
            alt={article.name}
            className={`h-full w-full object-contain object-center ${hasFile ? '' : 'p-4 sm:p-8'}`}
            loading="eager"
            decoding="async"
          />
        </div>
      </section>

      <section className="overflow-hidden rounded-xl border border-brand-border bg-brand-surface shadow-sm shadow-brand-ink/5 ring-1 ring-brand-border-subtle">
        <header className="border-b border-brand-border bg-brand-blush/20 px-5 py-3">
          <h3 className="font-medium text-brand-ink">Ficha del artículo</h3>
        </header>
        <dl className="grid gap-4 px-5 py-5 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-brand-ink-faint">Nombre</dt>
            <dd className="mt-1 text-brand-ink">{article.name}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-brand-ink-faint">Slug</dt>
            <dd className="mt-1 font-mono text-sm text-brand-ink">{article.slug}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-brand-ink-faint">SKU</dt>
            <dd className="mt-1 font-mono text-brand-ink">{article.sku}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-brand-ink-faint">Categoría</dt>
            <dd className="mt-1 text-brand-ink">{article.category || '—'}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-brand-ink-faint">Temporada</dt>
            <dd className="mt-1 text-brand-ink">{article.temporada || '—'}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-brand-ink-faint">Precio</dt>
            <dd className="mt-1 text-brand-ink">${precioLabel}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-brand-ink-faint">Stock actual</dt>
            <dd className="mt-1 text-brand-ink">{article.stock_actual}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-xs font-semibold uppercase tracking-wide text-brand-ink-faint">Descripción</dt>
            <dd className="mt-1 whitespace-pre-wrap text-brand-ink">{article.descripcion?.trim() || '—'}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-brand-ink-faint">Fecha de alta</dt>
            <dd className="mt-1 text-brand-ink">
              {created.toLocaleString('es-AR', {
                dateStyle: 'long',
                timeStyle: 'short',
              })}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-brand-ink-faint">Última actualización</dt>
            <dd className="mt-1 text-brand-ink">
              {new Date(article.updated_at).toLocaleString('es-AR', {
                dateStyle: 'long',
                timeStyle: 'short',
              })}
            </dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-xs font-semibold uppercase tracking-wide text-brand-ink-faint">ID interno</dt>
            <dd className="mt-1 break-all font-mono text-sm text-brand-ink-muted">{article.id}</dd>
          </div>
        </dl>
      </section>
    </div>
  )
}
