import {
  IconArrowLeft,
  IconCheck,
  IconExternalLink,
  IconPhoto,
  IconScissors,
  IconTrash,
  IconX,
} from '@tabler/icons-react'
import { type FormEvent, useEffect, useId, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { FormField } from '../../../components/ui/FormField'
import { ic } from '../../../lib/tabler'
import type { Corte, CorteEstado, Product } from '../../../types/database'
import {
  DEFAULT_ARTICLE_IMAGE_PUBLIC_URL,
  hasStorageCoverImage,
} from '../../../constants/defaultArticleImage'
import {
  getCorteImageSignedUrl,
  getProductImagePublicUrl,
  validateImageFile,
} from '../../media/services/storage.service'
import type { CorteColorInput, NewCorteInput } from '../services/cortes.service'
import { ArticuloImageModal } from './ArticuloImageModal'
import { ArticuloPickerModal } from './ArticuloPickerModal'
import { ColoresConCantidad, makeEmptyColor, type ColorEntry } from './ColoresConCantidad'

const ESTADOS: { value: CorteEstado; label: string }[] = [
  { value: 'pendiente', label: 'Pendiente' },
  { value: 'en_proceso', label: 'En proceso' },
  { value: 'completado', label: 'Completado' },
  { value: 'cancelado', label: 'Cancelado' },
]

const sectionCardClass = 'overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-black/4'
const selectClass =
  'w-full rounded-lg border border-brand-border-strong bg-brand-surface px-3 py-2 text-brand-ink outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-blush/50'

function SectionHeader({ title, hint }: { title: string; hint?: string }) {
  return (
    <header className="border-b border-[#f0eef5] bg-[#f8f7fa] px-5 py-3">
      <h2 className="text-xs font-semibold uppercase tracking-wider text-[#b9b6c3]">{title}</h2>
      {hint && <p className="mt-0.5 text-sm text-[#6e6b7b]">{hint}</p>}
    </header>
  )
}

function colorsToEntries(cols: Corte['colores']): ColorEntry[] {
  return cols.map((c) => ({ _key: c.id, color: c.color, cantidad: c.cantidad }))
}

export interface CorteFormProps {
  mode: 'create' | 'edit'
  initialData?: Corte
  /** El file de imagen se pasa aparte para que la página lo suba después de crear/editar. */
  onSubmit: (input: NewCorteInput, imageFile: File | null) => Promise<void>
  saving: boolean
  error: string | null
}

export function CorteForm({ mode, initialData, onSubmit, saving, error }: CorteFormProps) {
  const today = new Date().toISOString().slice(0, 10)
  const imageInputId = useId()
  const imageInputRef = useRef<HTMLInputElement>(null)

  // ─── Form fields ────────────────────────────────────────────────────────────
  const [numeroCorre, setNumeroCorre] = useState(initialData?.numero_corte ?? '')
  const [tipoTela, setTipoTela] = useState(initialData?.tipo_tela ?? '')
  const [cantidadTotal, setCantidadTotal] = useState(String(initialData?.cantidad_total ?? ''))
  const [costureros, setCostureros] = useState(initialData?.costureros ?? '')
  const [estado, setEstado] = useState<CorteEstado>(initialData?.estado ?? 'pendiente')
  const [fecha, setFecha] = useState(initialData?.fecha ?? today)
  const [descripcion, setDescripcion] = useState(initialData?.descripcion ?? '')

  const [articulos, setArticulos] = useState<Product[]>(() => {
    if (!initialData?.articulos.length) return []
    return initialData.articulos.map((a) => ({
      id: a.articulo_id,
      name: a.nombre,
      sku: a.codigo,
      slug: '',
      category: '',
      temporada: '',
      categoria_id: '',
      temporada_id: '',
      precio_lista: 0,
      precio_promocional: null,
      stock_actual: 0,
      descripcion: null,
      activo: true,
      created_at: '',
      updated_at: '',
      cover_image_path: a.cover_image_path,
    }))
  })
  const [colores, setColores] = useState<ColorEntry[]>(
    initialData ? colorsToEntries(initialData.colores) : [makeEmptyColor()],
  )

  // ─── Image ──────────────────────────────────────────────────────────────────
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imageError, setImageError] = useState<string | null>(null)
  /** Signed URL de la imagen existente (edit mode). */
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null)

  // Load signed URL for existing image in edit mode
  useEffect(() => {
    if (!initialData?.imagen_path) return
    let cancelled = false
    getCorteImageSignedUrl(initialData.imagen_path).then((url) => {
      if (!cancelled) setExistingImageUrl(url)
    })
    return () => { cancelled = true }
  }, [initialData?.imagen_path])

  // Object URL preview for newly picked file
  useEffect(() => {
    if (!imageFile) {
      setImagePreview(null)
      return
    }
    const url = URL.createObjectURL(imageFile)
    setImagePreview(url)
    return () => URL.revokeObjectURL(url)
  }, [imageFile])

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null
    setImageError(null)
    if (!file) { setImageFile(null); return }
    const err = validateImageFile(file)
    if (err) { setImageError(err); setImageFile(null); return }
    setImageFile(file)
  }

  function clearImage() {
    setImageFile(null)
    setImageError(null)
    if (imageInputRef.current) imageInputRef.current.value = ''
  }

  // ─── Modals ─────────────────────────────────────────────────────────────────
  const [showPicker, setShowPicker] = useState(false)
  const [imageTarget, setImageTarget] = useState<Product | null>(null)

  function removeArticulo(id: string) {
    setArticulos((prev) => prev.filter((a) => a.id !== id))
  }

  // ─── Field errors ────────────────────────────────────────────────────────────
  const [fieldErrors, setFieldErrors] = useState<{
    numeroCorre?: string
    tipoTela?: string
    cantidadTotal?: string
    fecha?: string
    articulos?: string
  }>({})

  function clearFieldError(field: keyof typeof fieldErrors) {
    setFieldErrors((prev) => {
      if (!prev[field]) return prev
      const next = { ...prev }
      delete next[field]
      return next
    })
  }

  // ─── Submit ─────────────────────────────────────────────────────────────────
  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()

    const n = parseInt(cantidadTotal, 10)
    const errors: typeof fieldErrors = {}

    if (!numeroCorre.trim()) errors.numeroCorre = 'El número de corte es obligatorio.'
    if (!tipoTela.trim()) errors.tipoTela = 'El tipo de tela es obligatorio.'
    if (!Number.isFinite(n) || n < 1) errors.cantidadTotal = 'Ingresá una cantidad mayor a 0.'
    if (!fecha) errors.fecha = 'La fecha es obligatoria.'
    if (articulos.length === 0) errors.articulos = 'Seleccioná al menos un artículo.'

    if (Object.keys(errors).length > 0 || imageError) {
      setFieldErrors(errors)
      return
    }

    setFieldErrors({})

    const validColores: CorteColorInput[] = colores
      .filter((c) => c.color.trim() !== '')
      .map((c) => ({ color: c.color.trim(), cantidad: c.cantidad }))

    await onSubmit(
      {
        numero_corte: numeroCorre.trim(),
        tipo_tela: tipoTela.trim(),
        cantidad_total: n,
        costureros: costureros.trim() || null,
        estado,
        fecha,
        descripcion: descripcion.trim() || null,
        imagen_path: initialData?.imagen_path ?? null,
        articulo_ids: articulos.map((a) => a.id),
        colores: validColores,
      },
      imageFile,
    )
  }

  // ─── Derived ─────────────────────────────────────────────────────────────────
  const previewSrc = imagePreview ?? existingImageUrl ?? null
  const hasExistingImage = Boolean(initialData?.imagen_path)

  return (
    <>
      {/* Page header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-primary-ghost text-brand-primary">
              <IconScissors {...ic.headerSm} aria-hidden />
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-[#3d3b4f]">
              {mode === 'create' ? 'Nuevo corte' : 'Editar corte'}
            </h1>
          </div>
          <p className="mt-1.5 text-sm text-[#6e6b7b]">
            {mode === 'create'
              ? 'Registrá un nuevo corte textil con sus artículos y colores.'
              : `Editando corte ${initialData?.numero_corte ?? ''}`}
          </p>
        </div>
        <Link
          to="/produccion/cortes"
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium text-[#6e6b7b] transition hover:bg-white hover:text-[#3d3b4f] hover:shadow-sm"
        >
          <IconArrowLeft size={16} stroke={1.5} className="shrink-0" aria-hidden />
          Volver al listado
        </Link>
      </div>

      <form onSubmit={(e) => void handleSubmit(e)} className="relative space-y-6">
        {/* Loading overlay */}
        {saving && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 rounded-xl bg-white/75 backdrop-blur-[2px]">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-md ring-1 ring-black/8">
              <svg
                className="h-7 w-7 animate-spin text-brand-primary"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden
              >
                <circle
                  className="opacity-25"
                  cx="12" cy="12" r="10"
                  stroke="currentColor"
                  strokeWidth="3"
                />
                <path
                  className="opacity-80"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
            </div>
            <p className="text-sm font-semibold text-brand-ink">
              {mode === 'create' ? 'Creando corte…' : 'Guardando cambios…'}
            </p>
            <p className="text-xs text-brand-ink-faint">Por favor esperá un momento</p>
          </div>
        )}
        {/* Información básica */}
        <section className={sectionCardClass}>
          <SectionHeader
            title="Información del Corte"
            hint="Completa todos los campos requeridos."
          />
          <div className="grid gap-4 px-5 py-5 sm:grid-cols-2">
            <FormField
              label="Número de Corte *"
              value={numeroCorre}
              onChange={(e) => { setNumeroCorre(e.target.value); clearFieldError('numeroCorre') }}
              placeholder="Ej: 001"
              required
              disabled={saving}
              error={fieldErrors.numeroCorre}
            />
            <FormField
              label="Tipo de Tela *"
              value={tipoTela}
              onChange={(e) => { setTipoTela(e.target.value); clearFieldError('tipoTela') }}
              placeholder="Ej: Algodón, Poliéster, Lino"
              required
              disabled={saving}
              error={fieldErrors.tipoTela}
            />
            <FormField
              label="Cantidad Total (encimadas) *"
              type="number"
              min={1}
              step={1}
              value={cantidadTotal}
              onChange={(e) => { setCantidadTotal(e.target.value); clearFieldError('cantidadTotal') }}
              placeholder="Ej: 100"
              required
              disabled={saving}
              error={fieldErrors.cantidadTotal}
            />
            <FormField
              label="Costureros"
              value={costureros}
              onChange={(e) => setCostureros(e.target.value)}
              placeholder="Ej: María, Juan"
              disabled={saving}
            />
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-brand-ink-muted">Estado *</span>
              <select
                className={selectClass}
                value={estado}
                onChange={(e) => setEstado(e.target.value as CorteEstado)}
                required
                disabled={saving}
              >
                {ESTADOS.map((op) => (
                  <option key={op.value} value={op.value}>
                    {op.label}
                  </option>
                ))}
              </select>
            </label>
            <FormField
              label="Fecha *"
              type="date"
              value={fecha}
              onChange={(e) => { setFecha(e.target.value); clearFieldError('fecha') }}
              required
              disabled={saving}
              error={fieldErrors.fecha}
            />
          </div>
          <div className="border-t border-brand-border-subtle px-5 pb-5">
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-brand-ink-muted">Descripción</span>
              <textarea
                className="min-h-24 w-full rounded-lg border border-brand-border-strong bg-brand-surface px-3 py-2 text-sm text-brand-ink outline-none transition placeholder:text-brand-ink-faint focus:border-brand-primary focus:ring-2 focus:ring-brand-blush/50"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="Describe las características del corte…"
                disabled={saving}
                rows={3}
              />
            </label>
          </div>
        </section>

        {/* Artículos vinculados */}
        <section className={sectionCardClass}>
          <SectionHeader
            title="Artículos"
            hint="Vinculá los artículos que se van a cortar. Hacé click en la foto para verla ampliada."
          />
          <div className="space-y-4 px-5 py-5">
            {articulos.length === 0 ? (
              <p className="text-sm text-brand-ink-faint">No hay artículos vinculados. Agregá al menos uno.</p>
            ) : (
              <ul className="space-y-2">
                {articulos.map((art) => {
                  const imgSrc = hasStorageCoverImage(art.cover_image_path)
                    ? getProductImagePublicUrl(art.cover_image_path)
                    : DEFAULT_ARTICLE_IMAGE_PUBLIC_URL
                  const isPlaceholder = !hasStorageCoverImage(art.cover_image_path)

                  return (
                    <li
                      key={art.id}
                      className="flex items-center gap-3 rounded-xl border border-brand-border bg-brand-canvas px-3 py-2"
                    >
                      <button
                        type="button"
                        aria-label={`Ver imagen de ${art.name}`}
                        onClick={() => setImageTarget(art)}
                        className="group relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-brand-border bg-white transition hover:ring-2 hover:ring-brand-primary/40"
                      >
                        <img
                          src={imgSrc}
                          alt=""
                          className={`h-full w-full ${isPlaceholder ? 'object-contain p-1' : 'object-cover'}`}
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition group-hover:bg-black/20">
                          <IconPhoto size={14} stroke={2} className="text-white opacity-0 transition group-hover:opacity-100" aria-hidden />
                        </div>
                      </button>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-brand-ink">{art.name}</p>
                        <p className="font-mono text-xs text-brand-ink-faint">{art.sku}</p>
                      </div>

                      <Link
                        to={`/inventario/articulos/${art.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Abrir ficha de ${art.name}`}
                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-brand-ink-faint transition hover:bg-brand-primary-ghost hover:text-brand-primary"
                      >
                        <IconExternalLink size={14} stroke={1.5} aria-hidden />
                      </Link>

                      <button
                        type="button"
                        aria-label={`Quitar ${art.name}`}
                        onClick={() => removeArticulo(art.id)}
                        disabled={saving}
                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-brand-ink-faint transition hover:bg-red-50 hover:text-red-500 disabled:opacity-40"
                      >
                        <IconX size={14} stroke={2} aria-hidden />
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}

            <button
              type="button"
              onClick={() => { setShowPicker(true); clearFieldError('articulos') }}
              disabled={saving}
              className="inline-flex items-center gap-1.5 rounded-lg border border-brand-border px-3 py-2 text-sm font-medium text-brand-primary transition hover:border-brand-blush-deep hover:bg-brand-primary-ghost disabled:opacity-40"
            >
              <IconPhoto size={15} stroke={1.5} aria-hidden />
              {articulos.length > 0 ? 'Cambiar artículos' : 'Seleccionar artículos'}
            </button>

            {fieldErrors.articulos && (
              <p className="text-xs font-medium text-red-600">{fieldErrors.articulos}</p>
            )}
          </div>
        </section>

        {/* Colores con cantidades */}
        <section className={sectionCardClass}>
          <SectionHeader
            title="Colores con Cantidades"
            hint="Indicá cada color del corte y cuántas unidades corresponden."
          />
          <div className="px-5 py-5">
            <ColoresConCantidad value={colores} onChange={setColores} disabled={saving} />
          </div>
        </section>

        {/* Plantilla del corte — imagen */}
        <section className={sectionCardClass}>
          <SectionHeader
            title="Plantilla del Corte"
            hint="Foto o escaneo de la plantilla de papel. Se optimiza y guarda en el servidor."
          />
          <div className="px-5 py-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
              {/* File input */}
              <div className="min-w-0 flex-1 space-y-2">
                <label htmlFor={imageInputId} className="mb-1 block text-sm font-medium text-brand-ink-muted">
                  Archivo{' '}
                  {hasExistingImage && !imageFile && (
                    <span className="text-brand-ink-faint font-normal">(ya hay una imagen guardada)</span>
                  )}
                </label>
                <input
                  id={imageInputId}
                  ref={imageInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
                  disabled={saving}
                  onChange={handleFileChange}
                  className="block w-full max-w-md text-sm text-brand-ink file:mr-3 file:rounded-lg file:border file:border-brand-border file:bg-brand-canvas file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-brand-ink transition file:transition file:hover:bg-brand-primary-ghost"
                />
                <p className="text-xs text-brand-ink-faint">
                  JPEG, PNG, WebP, GIF o SVG · máx. 8 MB. Las fotos se convierten a WebP automáticamente.
                </p>

                {imageError && (
                  <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2">
                    <span className="mt-0.5 shrink-0 text-red-500">⚠</span>
                    <div>
                      <p className="text-xs font-semibold text-red-700">Imagen no válida — no se puede guardar</p>
                      <p className="text-xs text-red-600">{imageError}</p>
                    </div>
                  </div>
                )}

                {imageFile && (
                  <button
                    type="button"
                    onClick={clearImage}
                    disabled={saving}
                    className="inline-flex items-center gap-1 text-sm text-brand-ink-muted underline-offset-2 hover:text-brand-ink hover:underline"
                  >
                    <IconTrash size={13} stroke={1.5} aria-hidden />
                    Quitar archivo seleccionado
                  </button>
                )}
              </div>

              {/* Preview */}
              <div className="flex shrink-0 flex-col items-center gap-2">
                <div className="flex h-44 w-44 items-center justify-center overflow-hidden rounded-xl border border-brand-border bg-brand-canvas shadow-sm">
                  {previewSrc ? (
                    <img
                      src={previewSrc}
                      alt="Vista previa de la plantilla"
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-brand-ink-faint">
                      <IconPhoto size={28} stroke={1.25} aria-hidden />
                      <p className="text-center text-xs">Sin imagen</p>
                    </div>
                  )}
                </div>
                {imageFile && (
                  <p className="max-w-44 text-center text-xs text-brand-ink-faint">
                    Vista previa · {(imageFile.size / 1024).toFixed(0)} KB
                  </p>
                )}
                {!imageFile && hasExistingImage && (
                  <p className="max-w-44 text-center text-xs text-brand-ink-faint">
                    Imagen actual guardada
                  </p>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Error */}
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            <p className="font-medium">No se pudo guardar</p>
            <p className="mt-1 text-red-700">{error}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Link
            to="/produccion/cortes"
            className="inline-flex justify-center rounded-lg border border-[#e8e4f0] bg-white px-5 py-2.5 text-sm font-medium text-[#6e6b7b] transition hover:text-[#3d3b4f]"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={saving || Boolean(imageError)}
            className="inline-flex min-w-40 items-center justify-center gap-2 rounded-lg bg-brand-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? (
              <>
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                  <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                {mode === 'create' ? 'Creando…' : 'Guardando…'}
              </>
            ) : (
              <>
                <IconCheck size={15} stroke={2.5} aria-hidden />
                {mode === 'create'
                  ? imageFile ? 'Crear corte con imagen' : 'Crear corte'
                  : imageFile ? 'Guardar con nueva imagen' : 'Guardar cambios'}
              </>
            )}
          </button>
        </div>
      </form>

      {/* Modals */}
      {showPicker && (
        <ArticuloPickerModal
          selected={articulos}
          onConfirm={setArticulos}
          onClose={() => setShowPicker(false)}
        />
      )}
      {imageTarget && (
        <ArticuloImageModal articulo={imageTarget} onClose={() => setImageTarget(null)} />
      )}
    </>
  )
}
