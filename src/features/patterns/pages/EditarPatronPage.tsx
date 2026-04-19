import {
  IconArrowLeft,
  IconFile,
  IconLoader2,
  IconRuler,
  IconUpload,
  IconX,
} from '@tabler/icons-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ic } from '../../../lib/tabler'
import { useProductsQuery } from '../../inventory/hooks/useProducts'
import {
  useArticulosConPatronQuery,
  usePatronQuery,
  useUpdatePatronMutation,
} from '../hooks/usePatrones'

const MAX_BYTES = 50 * 1024 * 1024

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

export function EditarPatronPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: patron, isPending: loading, isError, error } = usePatronQuery(id)
  const { data: articulos = [], isPending: loadingArticulos } = useProductsQuery()
  const { data: articulosConPatron = [], isPending: loadingOcupados } = useArticulosConPatronQuery()
  const updateMutation = useUpdatePatronMutation()

  const [articuloId, setArticuloId] = useState('')
  const [nombre, setNombre] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [newFile, setNewFile] = useState<File | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (patron) {
      setArticuloId(patron.articulo_id)
      setNombre(patron.nombre)
      setDescripcion(patron.descripcion ?? '')
    }
  }, [patron])

  const articulosDisponibles = useMemo(
    () => articulos.filter((a) => !articulosConPatron.includes(a.id) || a.id === patron?.articulo_id),
    [articulos, articulosConPatron, patron?.articulo_id],
  )

  const articuloSeleccionado = articulos.find((a) => a.id === articuloId) ?? null
  const cargandoArticulos = loadingArticulos || loadingOcupados

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0] ?? null
    setFileError(null)
    if (!selected) return
    if (selected.size > MAX_BYTES) {
      setFileError(`El archivo supera el límite de 50 MB (${formatFileSize(selected.size)}).`)
      return
    }
    setNewFile(selected)
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
    setNewFile(dropped)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setFormError(null)
    if (!patron) return
    if (!articuloId) { setFormError('Seleccioná un artículo.'); return }
    if (!nombre.trim()) { setFormError('El nombre del patrón es requerido.'); return }

    updateMutation.mutate(
      {
        id: patron.id,
        input: {
          nombre: nombre.trim(),
          descripcion: descripcion.trim() || null,
          articulo_id: articuloId,
          file: newFile ?? undefined,
        },
      },
      { onSuccess: () => navigate(`/produccion/patrones/${patron.id}`, { replace: true }) },
    )
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 animate-pulse rounded-lg bg-[#f0eef5]" />
        <div className="rounded-xl bg-white p-6 ring-1 ring-black/4">
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-10 animate-pulse rounded-lg bg-[#f0eef5]" />
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
      <div>
        <Link
          to={`/produccion/patrones/${patron.id}`}
          className="inline-flex items-center gap-1.5 text-sm text-brand-ink-muted transition hover:text-brand-primary"
        >
          <IconArrowLeft size={15} stroke={1.5} aria-hidden />
          {patron.nombre}
        </Link>
        <div className="mt-2 flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-primary-ghost text-brand-primary">
            <IconRuler {...ic.headerSm} aria-hidden />
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-[#3d3b4f]">Editar patrón</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-black/4 space-y-5">

          {/* Artículo */}
          <div>
            <label htmlFor="articulo" className="block text-sm font-semibold text-[#3d3b4f]">
              Artículo vinculado <span className="text-red-500">*</span>
            </label>
            <p className="mt-0.5 text-xs text-brand-ink-faint">
              Podés cambiar el artículo; solo aparecen los que no tienen otro patrón (y el actual).
            </p>
            <select
              id="articulo"
              value={articuloId}
              onChange={(e) => setArticuloId(e.target.value)}
              disabled={cargandoArticulos}
              className="mt-2 w-full rounded-lg border border-[#e8e4f0] bg-[#f8f7fa] px-3 py-2 text-sm text-[#3d3b4f] outline-none transition focus:border-brand-primary focus:bg-white focus:ring-2 focus:ring-brand-blush/50 disabled:opacity-60 sm:max-w-md"
            >
              <option value="">
                {cargandoArticulos ? 'Cargando…' : articulosDisponibles.length === 0 ? 'Sin artículos disponibles' : 'Elegí un artículo…'}
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
          </div>

          {/* Nombre */}
          <div>
            <label htmlFor="nombre" className="block text-sm font-semibold text-[#3d3b4f]">
              Nombre del patrón <span className="text-red-500">*</span>
            </label>
            <input
              id="nombre"
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              maxLength={200}
              className="mt-2 w-full rounded-lg border border-[#e8e4f0] bg-[#f8f7fa] px-3 py-2 text-sm text-[#3d3b4f] outline-none transition placeholder:text-[#b9b6c3] focus:border-brand-primary focus:bg-white focus:ring-2 focus:ring-brand-blush/50 sm:max-w-md"
            />
          </div>

          {/* Descripción */}
          <div>
            <label htmlFor="descripcion" className="block text-sm font-semibold text-[#3d3b4f]">
              Descripción <span className="text-xs font-normal text-brand-ink-faint">(opcional)</span>
            </label>
            <textarea
              id="descripcion"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              rows={3}
              maxLength={500}
              className="mt-2 w-full resize-none rounded-lg border border-[#e8e4f0] bg-[#f8f7fa] px-3 py-2 text-sm text-[#3d3b4f] outline-none transition placeholder:text-[#b9b6c3] focus:border-brand-primary focus:bg-white focus:ring-2 focus:ring-brand-blush/50 sm:max-w-lg"
            />
          </div>

          {/* File replacement */}
          <div>
            <p className="block text-sm font-semibold text-[#3d3b4f]">Reemplazar archivo</p>
            <p className="mt-0.5 text-xs text-brand-ink-faint">
              Si no subís un archivo nuevo, se conserva el actual.
            </p>

            {/* Current file */}
            <div className="mt-3 flex items-center gap-3 rounded-lg bg-[#f8f7fa] px-4 py-3 ring-1 ring-[#e8e4f0]">
              <IconFile size={18} stroke={1.5} className="shrink-0 text-brand-ink-faint" aria-hidden />
              <div className="min-w-0 flex-1">
                <p className="text-xs text-brand-ink-faint">Archivo actual</p>
                <p className="truncate font-mono text-sm font-medium text-brand-ink">{patron.file_name}</p>
              </div>
            </div>

            {newFile ? (
              <div className="mt-2 flex items-center gap-3 rounded-lg border border-brand-primary/30 bg-brand-primary-ghost px-4 py-3">
                <IconFile size={18} stroke={1.5} className="shrink-0 text-brand-primary" aria-hidden />
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-brand-primary">Nuevo archivo (reemplazará el actual)</p>
                  <p className="truncate font-mono text-sm font-medium text-brand-ink">{newFile.name}</p>
                  <p className="text-xs text-brand-ink-faint">{formatFileSize(newFile.size)}</p>
                </div>
                <button
                  type="button"
                  onClick={() => { setNewFile(null); if (fileInputRef.current) fileInputRef.current.value = '' }}
                  className="shrink-0 rounded-md p-1 text-brand-ink-faint transition hover:bg-brand-blush/40 hover:text-brand-ink"
                  aria-label="Quitar nuevo archivo"
                >
                  <IconX size={16} stroke={2} aria-hidden />
                </button>
              </div>
            ) : (
              <div
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                className="mt-2 flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[#e8e4f0] bg-[#f8f7fa] px-6 py-6 text-center transition hover:border-brand-primary hover:bg-brand-primary-ghost"
              >
                <IconUpload size={24} stroke={1.25} className="text-brand-ink-faint" aria-hidden />
                <p className="text-sm text-brand-ink-muted">
                  Arrastrá el nuevo archivo o{' '}
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

            {fileError && <p className="mt-2 text-xs text-red-600">{fileError}</p>}
          </div>
        </div>

        {formError && (
          <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200">
            {formError}
          </p>
        )}

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={updateMutation.isPending}
            className="inline-flex items-center gap-2 rounded-lg bg-brand-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
          >
            {updateMutation.isPending && (
              <IconLoader2 size={16} stroke={1.5} className="animate-spin" aria-hidden />
            )}
            {updateMutation.isPending ? 'Guardando…' : 'Guardar cambios'}
          </button>
          <Link
            to={`/produccion/patrones/${patron.id}`}
            className="text-sm font-semibold text-brand-ink-muted transition hover:text-brand-ink"
          >
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  )
}
