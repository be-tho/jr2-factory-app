import {
  IconArrowLeft,
  IconFile,
  IconLoader2,
  IconPhoto,
  IconRuler,
  IconUpload,
  IconX,
} from '@tabler/icons-react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { patronMetaFormSchema, type PatronMetaFormValues } from '../../../lib/schemas/patron'
import { ic } from '../../../lib/tabler'
import { useProductsQuery } from '../../inventory/hooks/useProducts'
import {
  useArticulosConPatronQuery,
  useCreatePatronMutation,
} from '../hooks/usePatrones'

const MAX_BYTES = 50 * 1024 * 1024

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

export function NuevoPatronPage() {
  const navigate = useNavigate()
  const { data: articulos = [], isPending: loadingArticulos } = useProductsQuery()
  const { data: articulosConPatron = [], isPending: loadingOcupados } = useArticulosConPatronQuery()
  const createMutation = useCreatePatronMutation()

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<PatronMetaFormValues>({
    resolver: zodResolver(patronMetaFormSchema),
    defaultValues: { articulo_id: '', nombre: '', descripcion: '' },
  })

  const [file, setFile] = useState<File | null>(null)
  const [image, setImage] = useState<File | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)
  const [imageError, setImageError] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)

  const articuloIdWatch = watch('articulo_id')
  const nombreWatch = watch('nombre')

  const articulosDisponibles = articulos.filter((a) => !articulosConPatron.includes(a.id))
  const articuloSeleccionado = articulos.find((a) => a.id === articuloIdWatch) ?? null

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0] ?? null
    setFileError(null)
    if (!selected) return
    if (selected.size > MAX_BYTES) {
      setFileError(`El archivo supera el límite de 50 MB (${formatFileSize(selected.size)}).`)
      return
    }
    setFile(selected)
    if (!nombreWatch.trim()) {
      const base = selected.name.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ')
      setValue('nombre', base, { shouldValidate: true })
    }
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault()
    const dropped = e.dataTransfer.files[0]
    if (!dropped) return
    setFileError(null)
    if (dropped.size > MAX_BYTES) {
      setFileError(`El archivo supera el límite de 50 MB (${formatFileSize(dropped.size)}).`)
      return
    }
    setFile(dropped)
    if (!nombreWatch.trim()) {
      const base = dropped.name.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ')
      setValue('nombre', base, { shouldValidate: true })
    }
  }

  function onSubmit(values: PatronMetaFormValues) {
    setFormError(null)
    if (!file) {
      setFormError('Adjuntá el archivo del patrón.')
      return
    }

    createMutation.mutate(
      {
        articulo_id: values.articulo_id,
        nombre: values.nombre.trim(),
        descripcion: values.descripcion.trim() || null,
        file,
        image,
      },
      { onSuccess: (data) => navigate(`/produccion/patrones/${data.id}`, { replace: true }) },
    )
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0] ?? null
    setImageError(null)
    if (!selected) return
    if (!selected.type.startsWith('image/')) {
      setImageError('Seleccioná un archivo de imagen válido.')
      return
    }
    if (selected.size > 8 * 1024 * 1024) {
      setImageError(`La imagen supera el límite de 8 MB (${formatFileSize(selected.size)}).`)
      return
    }
    setImage(selected)
  }

  const isLoading = loadingArticulos || loadingOcupados

  return (
    <div className="space-y-6">
      {/* Header */}
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
          <h1 className="text-2xl font-bold tracking-tight text-[#3d3b4f]">Nuevo patrón</h1>
        </div>
        <p className="mt-1.5 text-sm text-[#6e6b7b]">
          Vinculá el archivo de moldería a un artículo existente del catálogo.
        </p>
      </div>

      <form onSubmit={(e) => void handleSubmit(onSubmit)(e)} className="space-y-6" noValidate>
        <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-black/4 space-y-5">

          {/* Artículo */}
          <div>
            <label htmlFor="articulo" className="block text-sm font-semibold text-[#3d3b4f]">
              Artículo <span className="text-red-500">*</span>
            </label>
            <p className="mt-0.5 text-xs text-brand-ink-faint">
              Solo se muestran artículos sin patrón asignado.
            </p>
            <select
              id="articulo"
              disabled={isLoading}
              aria-invalid={Boolean(errors.articulo_id)}
              className="mt-2 w-full rounded-lg border border-[#e8e4f0] bg-[#f8f7fa] px-3 py-2 text-sm text-[#3d3b4f] outline-none transition focus:border-brand-primary focus:bg-white focus:ring-2 focus:ring-brand-blush/50 disabled:opacity-60 aria-invalid:border-red-400 sm:max-w-md"
              {...register('articulo_id')}
            >
              <option value="">
                {isLoading ? 'Cargando…' : articulosDisponibles.length === 0 ? 'Todos los artículos tienen patrón' : 'Elegí un artículo…'}
              </option>
              {articulosDisponibles.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} — {a.sku}
                </option>
              ))}
            </select>
            {articuloSeleccionado && (
              <p className="mt-1.5 text-xs text-brand-ink-faint">
                Categoría: {articuloSeleccionado.category || '—'} · Temporada: {articuloSeleccionado.temporada || '—'}
              </p>
            )}
            {errors.articulo_id ? (
              <p className="mt-1 text-xs font-medium text-red-600">{errors.articulo_id.message}</p>
            ) : null}
          </div>

          {/* Nombre */}
          <div>
            <label htmlFor="patron-nombre" className="block text-sm font-semibold text-[#3d3b4f]">
              Nombre del patrón <span className="text-red-500">*</span>
            </label>
            <input
              id="patron-nombre"
              type="text"
              placeholder="ej: Remera cuello redondo v2"
              maxLength={200}
              aria-invalid={Boolean(errors.nombre)}
              className="mt-2 w-full rounded-lg border border-[#e8e4f0] bg-[#f8f7fa] px-3 py-2 text-sm text-[#3d3b4f] outline-none transition placeholder:text-[#b9b6c3] focus:border-brand-primary focus:bg-white focus:ring-2 focus:ring-brand-blush/50 aria-invalid:border-red-400 sm:max-w-md"
              {...register('nombre')}
            />
            {errors.nombre ? (
              <p className="mt-1 text-xs font-medium text-red-600">{errors.nombre.message}</p>
            ) : null}
          </div>

          {/* Descripción */}
          <div>
            <label htmlFor="descripcion" className="block text-sm font-semibold text-[#3d3b4f]">
              Descripción <span className="text-xs font-normal text-brand-ink-faint">(opcional)</span>
            </label>
            <textarea
              id="descripcion"
              placeholder="Versión, talle, observaciones…"
              rows={3}
              maxLength={500}
              className="mt-2 w-full resize-none rounded-lg border border-[#e8e4f0] bg-[#f8f7fa] px-3 py-2 text-sm text-[#3d3b4f] outline-none transition placeholder:text-[#b9b6c3] focus:border-brand-primary focus:bg-white focus:ring-2 focus:ring-brand-blush/50 sm:max-w-lg"
              {...register('descripcion')}
            />
          </div>

          {/* File upload */}
          <div>
            <p className="block text-sm font-semibold text-[#3d3b4f]">
              Archivo del patrón <span className="text-red-500">*</span>
            </p>
            <p className="mt-0.5 text-xs text-brand-ink-faint">
              Audaces (.aud), Optitex (.pds / .pce), DXF, PDF, ZIP — máx. 50 MB
            </p>

            {file ? (
              <div className="mt-3 flex items-center gap-3 rounded-lg bg-[#f8f7fa] px-4 py-3 ring-1 ring-[#e8e4f0]">
                <IconFile size={20} stroke={1.5} className="shrink-0 text-brand-ink-faint" aria-hidden />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-mono text-sm font-medium text-brand-ink">{file.name}</p>
                  <p className="text-xs text-brand-ink-faint">{formatFileSize(file.size)}</p>
                </div>
                <button
                  type="button"
                  onClick={() => { setFile(null); if (fileInputRef.current) fileInputRef.current.value = '' }}
                  className="shrink-0 rounded-md p-1 text-brand-ink-faint transition hover:bg-[#e8e4f0] hover:text-brand-ink"
                  aria-label="Quitar archivo"
                >
                  <IconX size={16} stroke={2} aria-hidden />
                </button>
              </div>
            ) : (
              <div
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                className="mt-3 flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[#e8e4f0] bg-[#f8f7fa] px-6 py-8 text-center transition hover:border-brand-primary hover:bg-brand-primary-ghost"
              >
                <IconUpload size={28} stroke={1.25} className="text-brand-ink-faint" aria-hidden />
                <p className="text-sm text-brand-ink-muted">
                  Arrastrá el archivo acá o{' '}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="font-semibold text-brand-primary hover:underline"
                  >
                    seleccionalo
                  </button>
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="sr-only"
                  onChange={handleFileChange}
                  accept=".aud,.pds,.pce,.dxf,.pdf,.zip,.rar,.7z"
                />
              </div>
            )}

            {fileError && (
              <p className="mt-2 text-xs text-red-600">{fileError}</p>
            )}
          </div>

          {/* Pattern image upload */}
          <div>
            <p className="block text-sm font-semibold text-[#3d3b4f]">Foto del patrón (opcional)</p>
            <p className="mt-0.5 text-xs text-brand-ink-faint">
              Esta imagen es propia del patrón y no depende del artículo.
            </p>

            {image ? (
              <div className="mt-3 flex items-center gap-3 rounded-lg bg-[#f8f7fa] px-4 py-3 ring-1 ring-[#e8e4f0]">
                <IconPhoto size={20} stroke={1.5} className="shrink-0 text-brand-ink-faint" aria-hidden />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-mono text-sm font-medium text-brand-ink">{image.name}</p>
                  <p className="text-xs text-brand-ink-faint">{formatFileSize(image.size)}</p>
                </div>
                <button
                  type="button"
                  onClick={() => { setImage(null); if (imageInputRef.current) imageInputRef.current.value = '' }}
                  className="shrink-0 rounded-md p-1 text-brand-ink-faint transition hover:bg-[#e8e4f0] hover:text-brand-ink"
                  aria-label="Quitar imagen"
                >
                  <IconX size={16} stroke={2} aria-hidden />
                </button>
              </div>
            ) : (
              <div className="mt-3 rounded-xl border-2 border-dashed border-[#e8e4f0] bg-[#f8f7fa] px-4 py-5">
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-brand-ink-faint">
                  Cargar foto
                </p>
                <button
                  type="button"
                  onClick={() => imageInputRef.current?.click()}
                  className="inline-flex items-center gap-2 rounded-lg border border-[#e8e4f0] bg-white px-3 py-2 text-sm font-semibold text-brand-ink-muted transition hover:bg-[#f8f7fa] hover:text-brand-ink"
                >
                  <IconPhoto size={16} stroke={1.5} aria-hidden />
                  Seleccionar imagen
                </button>
                <input
                  ref={imageInputRef}
                  type="file"
                  className="sr-only"
                  onChange={handleImageChange}
                  accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
                />
                <p className="mt-2 text-xs text-brand-ink-faint">Formatos: JPG, PNG, WebP, GIF, SVG (máx. 8 MB).</p>
              </div>
            )}

            {imageError && <p className="mt-2 text-xs text-red-600">{imageError}</p>}
          </div>
        </div>

        {/* Form error */}
        {formError && (
          <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200">
            {formError}
          </p>
        )}

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={createMutation.isPending}
            className="inline-flex items-center gap-2 rounded-lg bg-brand-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
          >
            {createMutation.isPending && (
              <IconLoader2 size={16} stroke={1.5} className="animate-spin" aria-hidden />
            )}
            {createMutation.isPending ? 'Guardando…' : 'Guardar patrón'}
          </button>
          <Link
            to="/produccion/patrones"
            className="text-sm font-semibold text-brand-ink-muted transition hover:text-brand-ink"
          >
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  )
}
