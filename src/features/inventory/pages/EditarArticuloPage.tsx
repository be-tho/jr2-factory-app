import { useEffect, useId, useRef, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { DEFAULT_ARTICLE_IMAGE_PUBLIC_URL, hasStorageCoverImage } from '../../../constants/defaultArticleImage'
import { FormField } from '../../../components/ui/FormField'
import { PageHeader } from '../../../components/ui/PageHeader'
import {
  getProductImagePublicUrl,
  removeProductImage,
  uploadProductImage,
  validateImageFile,
} from '../../media/services/storage.service'
import { useArticuloImagenesQuery } from '../hooks/useArticuloImagenes'
import { useCategoriasQuery } from '../hooks/useCategorias'
import { useProductQuery, useUpdateProductMutation } from '../hooks/useProducts'
import { useTemporadasCatalogQuery } from '../hooks/useTemporadas'
import {
  createArticuloImagen,
  pickPrincipalArticuloImagen,
  updateArticuloImagenStoragePath,
} from '../services/articulo-imagenes.service'
import type { ProductImage } from '../../../types/database'

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

export function EditarArticuloPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const coverInputId = useId()
  const coverFileInputRef = useRef<HTMLInputElement>(null)

  const productQ = useProductQuery(id)
  const imagenesQ = useArticuloImagenesQuery(id)
  const categoriasQ = useCategoriasQuery()
  const temporadasQ = useTemporadasCatalogQuery()
  const updateMutation = useUpdateProductMutation()

  const categorias = categoriasQ.data ?? []
  const temporadas = temporadasQ.data ?? []
  const catalogLoading = categoriasQ.isPending || temporadasQ.isPending
  const catalogError =
    categoriasQ.isError && categoriasQ.error instanceof Error
      ? categoriasQ.error.message
      : temporadasQ.isError && temporadasQ.error instanceof Error
        ? temporadasQ.error.message
        : null

  const loading =
    Boolean(id) &&
    (productQ.isPending || imagenesQ.isPending || categoriasQ.isPending || temporadasQ.isPending)
  const loadError = !id
    ? 'Falta el identificador del artículo.'
    : productQ.isError && productQ.error instanceof Error
      ? productQ.error.message
      : null

  const [principalRow, setPrincipalRow] = useState<ProductImage | null>(null)
  const [initialCoverPath, setInitialCoverPath] = useState<string | null>(null)

  const [name, setName] = useState('')
  const [sku, setSku] = useState('')
  const [categoriaId, setCategoriaId] = useState('')
  const [temporadaId, setTemporadaId] = useState('')
  const [precioLista, setPrecioLista] = useState('')
  const [precioPromo, setPrecioPromo] = useState('')
  const [stockActual, setStockActual] = useState('0')
  const [activo, setActivo] = useState(true)
  const [descripcion, setDescripcion] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [coverImage, setCoverImage] = useState<File | null>(null)
  const [coverPreview, setCoverPreview] = useState<string | null>(null)

  useEffect(() => {
    setPrincipalRow(null)
  }, [id])

  useEffect(() => {
    const p = productQ.data
    if (!p) return
    setName(p.name)
    setSku(p.sku)
    setCategoriaId(p.categoria_id)
    setTemporadaId(p.temporada_id)
    setPrecioLista(String(p.precio_lista))
    setPrecioPromo(p.precio_promocional != null ? String(p.precio_promocional) : '')
    setStockActual(String(p.stock_actual))
    setActivo(p.activo)
    setDescripcion(p.descripcion ?? '')
    setInitialCoverPath(p.cover_image_path)
    setCoverImage(null)
  }, [productQ.data])

  useEffect(() => {
    if (!id || !productQ.data) return
    if (imagenesQ.isSuccess) {
      setPrincipalRow(pickPrincipalArticuloImagen(imagenesQ.data))
    } else if (imagenesQ.isError) {
      setPrincipalRow(null)
    }
  }, [id, productQ.data, imagenesQ.data, imagenesQ.isSuccess, imagenesQ.isError])

  useEffect(() => {
    if (coverImage) {
      const url = URL.createObjectURL(coverImage)
      setCoverPreview(url)
      return () => {
        URL.revokeObjectURL(url)
      }
    }
    if (hasStorageCoverImage(initialCoverPath)) {
      setCoverPreview(getProductImagePublicUrl(initialCoverPath))
      return
    }
    setCoverPreview(DEFAULT_ARTICLE_IMAGE_PUBLIC_URL)
    return undefined
  }, [coverImage, initialCoverPath])

  /**
   * Solo se llama cuando el usuario eligió un archivo nuevo: sube, actualiza la fila y borra el objeto anterior en Storage.
   * Si no hay archivo nuevo, no se invoca (la imagen de la BD no se toca).
   */
  async function replaceCoverWithNewFile(articuloId: string, file: File): Promise<void> {
    const v = validateImageFile(file)
    if (v) throw new Error(v)

    const oldPath = principalRow?.storage_path ?? initialCoverPath
    const { path: newPath } = await uploadProductImage(articuloId, file)

    if (principalRow) {
      const { error: uErr } = await updateArticuloImagenStoragePath(principalRow.id, newPath)
      if (uErr) {
        await removeProductImage(newPath).catch(() => {})
        throw new Error(uErr.message)
      }
    } else {
      const { error: cErr } = await createArticuloImagen({
        articulo_id: articuloId,
        storage_path: newPath,
        es_principal: true,
        orden: 0,
      })
      if (cErr) {
        await removeProductImage(newPath).catch(() => {})
        throw new Error(cErr.message)
      }
    }

    if (oldPath && oldPath !== newPath) {
      await removeProductImage(oldPath).catch(() => {})
    }
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!id || loading) return

    const n = name.trim()
    const s = sku.trim()
    const pl = Number.parseInt(precioLista.replace(/\s/g, ''), 10)
    const st = Number.parseInt(stockActual.replace(/\s/g, ''), 10)
    if (!n || !s || !categoriaId || !temporadaId || !Number.isFinite(pl) || pl < 0) {
      setError('Completá nombre, código, categoría, temporada y precio de lista válido.')
      return
    }
    if (!Number.isFinite(st) || st < 0) {
      setError('Indicá un stock actual válido (entero ≥ 0).')
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

    try {
      await updateMutation.mutateAsync({
        id,
        input: {
          nombre: n,
          codigo: s,
          categoria_id: categoriaId,
          temporada_id: temporadaId,
          precio_lista: pl,
          precio_promocional,
          stock_actual: st,
          activo,
          descripcion: descripcion.trim() || null,
        },
      })
    } catch (e) {
      setSaving(false)
      setError(e instanceof Error ? e.message : 'No se pudo guardar.')
      return
    }

    try {
      if (coverImage) {
        await replaceCoverWithNewFile(id, coverImage)
      }
    } catch (imErr) {
      setSaving(false)
      setError(
        imErr instanceof Error
          ? `Los datos se guardaron, pero hubo un problema con la imagen: ${imErr.message}`
          : 'Los datos se guardaron, pero hubo un problema con la imagen.'
      )
      return
    }

    setSaving(false)
    navigate(`/inventario/articulos/${id}`, { replace: true })
  }

  if (!id) {
    return (
      <div className="space-y-6">
        <PageHeader title="Editar artículo" description="Ruta inválida." />
        <Link to="/inventario/articulos" className="text-sm font-medium text-brand-ink underline-offset-2 hover:underline">
          Volver al listado
        </Link>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Editar artículo" description="Cargando…" />
        <p className="text-sm text-brand-ink-muted">Cargando datos del artículo…</p>
      </div>
    )
  }

  if (loadError) {
    return (
      <div className="space-y-6">
        <PageHeader title="Editar artículo" description="No se pudo abrir el formulario." />
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{loadError}</p>
        {id ? (
          <button
            type="button"
            className="rounded-lg border border-red-300 bg-white px-3 py-1.5 text-sm font-medium text-red-900 transition hover:bg-red-100"
            onClick={() => void productQ.refetch()}
          >
            Reintentar
          </button>
        ) : null}
        <Link
          to="/inventario/articulos"
          className="inline-flex rounded-lg border border-brand-border-strong bg-brand-primary px-4 py-2 text-sm font-medium text-brand-ink shadow-sm transition hover:bg-brand-primary-hover"
        >
          Volver al listado
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <PageHeader
          title="Editar artículo"
          description="Los datos del formulario se guardan siempre. La imagen del catálogo solo cambia si elegís un archivo nuevo; si no, se mantiene la que está en la base."
        />
        <div className="flex flex-wrap gap-2">
          <Link
            to={`/inventario/articulos/${id}`}
            className="shrink-0 rounded-lg border border-brand-border bg-brand-surface px-4 py-2.5 text-sm font-medium text-brand-ink-muted transition hover:border-brand-border-strong hover:text-brand-ink"
          >
            ← Ver ficha
          </Link>
          <Link
            to="/inventario/articulos"
            className="shrink-0 rounded-lg border border-brand-border bg-brand-surface px-4 py-2.5 text-sm font-medium text-brand-ink-muted transition hover:border-brand-border-strong hover:text-brand-ink"
          >
            Listado
          </Link>
        </div>
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
              disabled={saving}
            />
            <FormField
              label="Código (SKU)"
              value={sku}
              onChange={(ev) => setSku(ev.target.value)}
              placeholder="Ej. REM-105"
              required
              disabled={saving}
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
                disabled={saving || catalogLoading || categorias.length === 0}
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
                disabled={saving || catalogLoading || temporadas.length === 0}
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
          <SectionHeader
            title="Precio, stock y estado"
            hint="Precios y stock en unidades enteras."
          />
          <div className="grid gap-4 px-5 py-5 sm:grid-cols-2 lg:grid-cols-3">
            <FormField
              label="Precio lista"
              type="number"
              min={0}
              step={1}
              value={precioLista}
              onChange={(ev) => setPrecioLista(ev.target.value)}
              placeholder="0"
              required
              disabled={saving}
            />
            <FormField
              label="Precio promocional (opcional)"
              type="number"
              min={0}
              step={1}
              value={precioPromo}
              onChange={(ev) => setPrecioPromo(ev.target.value)}
              placeholder="—"
              disabled={saving}
            />
            <FormField
              label="Stock actual"
              type="number"
              min={0}
              step={1}
              value={stockActual}
              onChange={(ev) => setStockActual(ev.target.value)}
              placeholder="0"
              required
              disabled={saving}
            />
          </div>
          <div className="border-t border-brand-border-subtle px-5 py-4">
            <label className="flex cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                checked={activo}
                onChange={(ev) => setActivo(ev.target.checked)}
                disabled={saving}
                className="h-4 w-4 rounded border-brand-border-strong text-brand-primary focus:ring-brand-blush/50"
              />
              <span className="text-sm text-brand-ink">Artículo activo en catálogo</span>
            </label>
          </div>
        </section>

        <section className={sectionCardClass}>
          <SectionHeader title="Descripción" hint="Opcional." />
          <div className="px-5 py-5">
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-brand-ink-muted">Texto</span>
              <textarea
                className="min-h-24 w-full rounded-lg border border-brand-border-strong bg-brand-surface px-3 py-2 text-brand-ink outline-none transition placeholder:text-brand-ink-faint focus:border-brand-primary focus:ring-2 focus:ring-brand-blush/50"
                value={descripcion}
                onChange={(ev) => setDescripcion(ev.target.value)}
                placeholder="Notas o detalle comercial"
                disabled={saving}
                rows={4}
              />
            </label>
          </div>
        </section>

        <section className={sectionCardClass}>
          <SectionHeader
            title="Imagen del producto"
            hint="Si no elegís un archivo, no se modifica Storage ni la imagen en la base. Con archivo nuevo, se sube y se elimina la anterior del bucket."
          />
          <div className="px-5 py-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
              <div className="min-w-0 flex-1 space-y-3">
                <div>
                  <label htmlFor={coverInputId} className="mb-1 block text-sm font-medium text-brand-ink-muted">
                    Nueva imagen (opcional)
                  </label>
                  <input
                    ref={coverFileInputRef}
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
                  <p className="mt-1 text-xs text-brand-ink-faint">
                    JPEG, PNG, WebP, GIF o SVG · máx. 8 MB. JPEG/PNG/WebP se suben optimizados en WebP.
                  </p>
                  {coverImage ? (
                    <button
                      type="button"
                      className="mt-2 text-sm font-medium text-brand-ink-muted underline-offset-2 hover:text-brand-ink hover:underline"
                      onClick={() => {
                        setCoverImage(null)
                        if (coverFileInputRef.current) coverFileInputRef.current.value = ''
                      }}
                      disabled={saving}
                    >
                      Quitar archivo y conservar la imagen del catálogo
                    </button>
                  ) : null}
                </div>
              </div>
              <div className="flex shrink-0 flex-col items-center gap-1.5">
                <div className="h-40 w-40 overflow-hidden rounded-lg border border-brand-border bg-white shadow-sm">
                  {coverPreview ? (
                    <img src={coverPreview} alt="" className="h-full w-full object-contain" />
                  ) : null}
                </div>
                <p className="max-w-40 text-center text-xs text-brand-ink-muted">
                  {coverImage ? 'Archivo nuevo (reemplazo)' : 'Imagen actual'}
                </p>
              </div>
            </div>
          </div>
        </section>

        {error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            <p className="font-medium">Atención</p>
            <p className="mt-1 text-red-700">{error}</p>
          </div>
        ) : null}

        <div className="flex flex-col-reverse gap-3 border-t border-brand-border-subtle pt-2 sm:flex-row sm:justify-end">
          <Link
            to={`/inventario/articulos/${id}`}
            className="inline-flex justify-center rounded-lg border border-brand-border bg-brand-surface px-5 py-2.5 text-sm font-medium text-brand-ink-muted transition hover:bg-brand-canvas hover:text-brand-ink"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={saving || catalogLoading}
            className="inline-flex justify-center rounded-lg border border-brand-border-strong bg-brand-primary px-5 py-2.5 text-sm font-medium text-brand-ink shadow-sm transition hover:bg-brand-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? 'Guardando…' : 'Guardar cambios'}
          </button>
        </div>
      </form>
    </div>
  )
}
