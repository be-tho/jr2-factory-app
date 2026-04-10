import { useEffect, useId, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { DEFAULT_ARTICLE_IMAGE_PUBLIC_URL } from '../../../constants/defaultArticleImage'
import { FormField } from '../../../components/ui/FormField'
import { PageHeader } from '../../../components/ui/PageHeader'
import {
  loadDefaultArticleImageFile,
  removeProductImage,
  uploadDefaultArticlePlaceholder,
  uploadProductImage,
  validateImageFile,
} from '../../media/services/storage.service'
import { createArticuloImagen } from '../services/articulo-imagenes.service'
import { createProduct, listCategorias, listTemporadas } from '../services/products.service'

const selectClass =
  'w-full rounded-lg border border-brand-border-strong bg-brand-surface px-3 py-2 text-brand-ink outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-blush/50'

const sectionCardClass =
  'overflow-hidden rounded-xl border border-brand-border bg-brand-surface shadow-sm shadow-brand-ink/5 ring-1 ring-brand-border-subtle'

function SectionHeader({ title, hint }: { title: string; hint?: string }) {
  return (
    <header className="border-b border-brand-border bg-brand-blush/20 px-5 py-3">
      <h2 className="font-medium text-brand-ink">{title}</h2>
      {hint ? <p className="mt-0.5 text-sm text-brand-ink-muted">{hint}</p> : null}
    </header>
  )
}

export function NuevoArticuloPage() {
  const navigate = useNavigate()
  const coverInputId = useId()
  const [name, setName] = useState('')
  const [sku, setSku] = useState('')
  const [categoriaId, setCategoriaId] = useState('')
  const [temporadaId, setTemporadaId] = useState('')
  const [precioLista, setPrecioLista] = useState('')
  const [precioPromo, setPrecioPromo] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [categorias, setCategorias] = useState<{ id: string; nombre: string }[]>([])
  const [temporadas, setTemporadas] = useState<{ id: string; nombre: string }[]>([])
  const [catalogLoading, setCatalogLoading] = useState(true)
  const [catalogError, setCatalogError] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [coverImage, setCoverImage] = useState<File | null>(null)
  const [coverPreview, setCoverPreview] = useState<string | null>(null)
  /** Si el artículo ya existe en BD pero falló Storage o `articulo_imagenes`. */
  const [articleIdPendingImage, setArticleIdPendingImage] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setCatalogLoading(true)
    setCatalogError(null)
    void (async () => {
      const [c, t] = await Promise.all([listCategorias(), listTemporadas()])
      if (cancelled) return
      setCatalogLoading(false)
      if (c.error) setCatalogError(c.error.message)
      else setCategorias(c.data)
      if (t.error) setCatalogError((prev) => prev ?? t.error?.message ?? null)
      else setTemporadas(t.data)
    })()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!coverImage) {
      setCoverPreview(null)
      return
    }
    const url = URL.createObjectURL(coverImage)
    setCoverPreview(url)
    return () => {
      URL.revokeObjectURL(url)
    }
  }, [coverImage])

  async function attachImageToArticle(articuloId: string, file: File): Promise<void> {
    const v = validateImageFile(file)
    if (v) throw new Error(v)
    const { path } = await uploadProductImage(articuloId, file)
    const { error: insErr } = await createArticuloImagen({
      articulo_id: articuloId,
      storage_path: path,
      es_principal: true,
      orden: 0,
    })
    if (insErr) {
      await removeProductImage(path).catch(() => {})
      throw new Error(insErr.message)
    }
  }

  /** Sube `default-articulo.svg` a `images/<id>/default-articulo.svg` y registra la fila. */
  async function attachDefaultArticleImage(articuloId: string): Promise<void> {
    const file = await loadDefaultArticleImageFile()
    const { path } = await uploadDefaultArticlePlaceholder(articuloId, file)
    const { error: insErr } = await createArticuloImagen({
      articulo_id: articuloId,
      storage_path: path,
      es_principal: true,
      orden: 0,
    })
    if (insErr) {
      await removeProductImage(path).catch(() => {})
      throw new Error(insErr.message)
    }
  }

  async function retryImageOnly() {
    if (!articleIdPendingImage) return
    setSaving(true)
    setError(null)
    try {
      if (coverImage) {
        await attachImageToArticle(articleIdPendingImage, coverImage)
      } else {
        await attachDefaultArticleImage(articleIdPendingImage)
      }
      navigate(`/inventario/articulos/${articleIdPendingImage}`, { replace: true })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo subir la imagen.')
    } finally {
      setSaving(false)
    }
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (articleIdPendingImage) return

    const n = name.trim()
    const s = sku.trim()
    const pl = Number.parseInt(precioLista.replace(/\s/g, ''), 10)
    if (!n || !s || !categoriaId || !temporadaId || !Number.isFinite(pl) || pl < 0) {
      setError('Completá nombre, código, categoría, temporada y precio de lista válido.')
      return
    }
    if (coverImage) {
      const imgErr = validateImageFile(coverImage)
      if (imgErr) {
        setError(imgErr)
        return
      }
    }
    const promoRaw = precioPromo.trim()
    let precio_promocional: number | null = null
    if (promoRaw !== '') {
      const p = Number.parseInt(promoRaw.replace(/\s/g, ''), 10)
      if (!Number.isFinite(p) || p < 0) {
        setError('Precio promocional inválido.')
        return
      }
      precio_promocional = p
    }
    setSaving(true)
    setError(null)
    setArticleIdPendingImage(null)

    const { data, error: err } = await createProduct({
      nombre: n,
      codigo: s,
      categoria_id: categoriaId,
      temporada_id: temporadaId,
      precio_lista: pl,
      precio_promocional,
      descripcion: descripcion.trim() || null,
    })

    if (err || !data?.id) {
      setSaving(false)
      setError(err?.message ?? 'No se pudo crear el artículo.')
      return
    }

    const newId = data.id

    try {
      if (coverImage) {
        await attachImageToArticle(newId, coverImage)
      } else {
        await attachDefaultArticleImage(newId)
      }
    } catch (e) {
      setArticleIdPendingImage(newId)
      setError(
        e instanceof Error
          ? `El artículo se creó, pero la imagen no se guardó: ${e.message}`
          : 'El artículo se creó, pero la imagen no se guardó.'
      )
      setSaving(false)
      return
    }

    setSaving(false)
    navigate(`/inventario/articulos/${newId}`, { replace: true })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <PageHeader
          title="Nuevo artículo"
          description="Si no subís foto, se usa y guarda public/default-articulo.svg en Storage para ese artículo."
        />
        <Link
          to="/inventario/articulos"
          className="shrink-0 self-start rounded-lg border border-brand-border bg-brand-surface px-4 py-2.5 text-sm font-medium text-brand-ink-muted transition hover:border-brand-border-strong hover:text-brand-ink"
        >
          ← Volver al listado
        </Link>
      </div>

      <form onSubmit={(e) => void handleSubmit(e)} className="space-y-6">
        {catalogError ? (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            <p className="font-medium">Catálogo auxiliar</p>
            <p className="mt-1">No se pudieron cargar categorías o temporadas: {catalogError}</p>
          </div>
        ) : null}

        <section className={sectionCardClass}>
          <SectionHeader title="Identificación" hint="Nombre visible y código único (SKU)." />
          <div className="grid gap-4 px-5 py-5 sm:grid-cols-2">
            <FormField
              label="Nombre"
              value={name}
              onChange={(ev) => setName(ev.target.value)}
              placeholder="Ej. Remera manga corta"
              required
              disabled={saving || articleIdPendingImage != null}
            />
            <FormField
              label="Código (SKU)"
              value={sku}
              onChange={(ev) => setSku(ev.target.value)}
              placeholder="Ej. REM-105"
              required
              disabled={saving || articleIdPendingImage != null}
            />
          </div>
        </section>

        <section className={sectionCardClass}>
          <SectionHeader title="Clasificación" hint="Categoría y temporada según tablas relacionadas en Supabase." />
          <div className="grid gap-4 px-5 py-5 sm:grid-cols-2">
            <label className="block sm:col-span-1">
              <span className="mb-1 block text-sm font-medium text-brand-ink-muted">Categoría</span>
              <select
                className={selectClass}
                value={categoriaId}
                onChange={(ev) => setCategoriaId(ev.target.value)}
                required
                disabled={saving || catalogLoading || categorias.length === 0 || articleIdPendingImage != null}
              >
                <option value="">{catalogLoading ? 'Cargando…' : 'Elegí una categoría'}</option>
                {categorias.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                  </option>
                ))}
              </select>
            </label>
            <label className="block sm:col-span-1">
              <span className="mb-1 block text-sm font-medium text-brand-ink-muted">Temporada</span>
              <select
                className={selectClass}
                value={temporadaId}
                onChange={(ev) => setTemporadaId(ev.target.value)}
                required
                disabled={saving || catalogLoading || temporadas.length === 0 || articleIdPendingImage != null}
              >
                <option value="">{catalogLoading ? 'Cargando…' : 'Elegí una temporada'}</option>
                {temporadas.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.nombre}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </section>

        <section className={sectionCardClass}>
          <SectionHeader title="Precios" hint="Valores enteros; el stock inicia en cero salvo que lo ajustes después." />
          <div className="grid gap-4 px-5 py-5 sm:grid-cols-2">
            <FormField
              label="Precio lista"
              type="number"
              min={0}
              step={1}
              value={precioLista}
              onChange={(ev) => setPrecioLista(ev.target.value)}
              placeholder="0"
              required
              disabled={saving || articleIdPendingImage != null}
            />
            <FormField
              label="Precio promocional (opcional)"
              type="number"
              min={0}
              step={1}
              value={precioPromo}
              onChange={(ev) => setPrecioPromo(ev.target.value)}
              placeholder="—"
              disabled={saving || articleIdPendingImage != null}
            />
          </div>
        </section>

        <section className={sectionCardClass}>
          <SectionHeader title="Descripción" hint="Opcional; notas internas o detalle comercial." />
          <div className="px-5 py-5">
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-brand-ink-muted">Texto</span>
              <textarea
                className="min-h-24 w-full rounded-lg border border-brand-border-strong bg-brand-surface px-3 py-2 text-brand-ink outline-none transition placeholder:text-brand-ink-faint focus:border-brand-primary focus:ring-2 focus:ring-brand-blush/50"
                value={descripcion}
                onChange={(ev) => setDescripcion(ev.target.value)}
                placeholder="Notas o detalle comercial"
                disabled={saving || articleIdPendingImage != null}
                rows={4}
              />
            </label>
          </div>
        </section>

        <section className={sectionCardClass}>
          <SectionHeader
            title="Imagen del producto"
            hint="Opcional. Sin archivo, al guardar se copia public/default-articulo.svg al bucket como images/<id>/default-articulo.svg."
          />
          <div className="px-5 py-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
              <div className="min-w-0 flex-1">
                <label htmlFor={coverInputId} className="mb-1 block text-sm font-medium text-brand-ink-muted">
                  Archivo (si no, se usa la imagen por defecto de abajo)
                </label>
                <input
                  id={coverInputId}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
                  disabled={saving}
                  className="block w-full max-w-md text-sm text-brand-ink file:mr-3 file:rounded-lg file:border file:border-brand-border file:bg-brand-canvas file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-brand-ink"
                  onChange={(ev) => {
                    const f = ev.target.files?.[0] ?? null
                    setCoverImage(f)
                  }}
                />
                <p className="mt-1 text-xs text-brand-ink-faint">JPEG, PNG, WebP, GIF o SVG · máx. 8 MB</p>
                {coverImage ? (
                  <button
                    type="button"
                    className="mt-2 text-sm font-medium text-brand-ink-muted underline-offset-2 hover:text-brand-ink hover:underline"
                    onClick={() => setCoverImage(null)}
                    disabled={saving}
                  >
                    Quitar y usar imagen por defecto
                  </button>
                ) : null}
              </div>
              <div className="flex shrink-0 flex-col items-center gap-1.5">
                <div className="h-40 w-40 overflow-hidden rounded-lg border border-brand-border bg-white shadow-sm">
                  <img
                    src={coverPreview ?? DEFAULT_ARTICLE_IMAGE_PUBLIC_URL}
                    alt=""
                    className="h-full w-full object-contain"
                  />
                </div>
                <p className="max-w-[10rem] text-center text-xs text-brand-ink-muted">
                  {coverImage ? 'Vista previa de tu archivo' : 'Por defecto: default-articulo.svg'}
                </p>
              </div>
            </div>
          </div>
        </section>

        {articleIdPendingImage ? (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-950">
            <p className="font-medium">El artículo ya está creado</p>
            <p className="mt-1 text-amber-900">
              Podés reintentar: con el archivo elegido, o sin archivo para volver a subir la imagen por defecto.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                disabled={saving}
                className="rounded-lg border border-amber-300 bg-white px-4 py-2 text-sm font-medium text-amber-950 transition hover:bg-amber-100 disabled:opacity-60"
                onClick={() => void retryImageOnly()}
              >
                {saving ? 'Subiendo…' : 'Reintentar imagen'}
              </button>
              <Link
                to={`/inventario/articulos/${articleIdPendingImage}`}
                className="inline-flex items-center rounded-lg border border-brand-border bg-brand-surface px-4 py-2 text-sm font-medium text-brand-ink transition hover:border-brand-border-strong"
              >
                Ir al artículo
              </Link>
              <Link
                to="/inventario/articulos"
                className="inline-flex items-center rounded-lg px-4 py-2 text-sm font-medium text-amber-900 underline-offset-2 hover:underline"
              >
                Ir al listado
              </Link>
            </div>
          </div>
        ) : null}

        {error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            <p className="font-medium">No se pudo guardar</p>
            <p className="mt-1 text-red-700">{error}</p>
          </div>
        ) : null}

        <div className="flex flex-col-reverse gap-3 border-t border-brand-border-subtle pt-2 sm:flex-row sm:justify-end">
          <Link
            to="/inventario/articulos"
            className="inline-flex justify-center rounded-lg border border-brand-border bg-brand-surface px-5 py-2.5 text-sm font-medium text-brand-ink-muted transition hover:bg-brand-canvas hover:text-brand-ink"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={saving || catalogLoading || articleIdPendingImage != null}
            className="inline-flex justify-center rounded-lg border border-brand-border-strong bg-brand-primary px-5 py-2.5 text-sm font-medium text-brand-ink shadow-sm transition hover:bg-brand-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? 'Guardando…' : coverImage ? 'Crear artículo e imagen' : 'Crear artículo'}
          </button>
        </div>
      </form>
    </div>
  )
}
