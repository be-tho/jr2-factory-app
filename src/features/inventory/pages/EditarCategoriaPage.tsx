import { IconAlertCircle, IconArrowLeft, IconRefresh, IconTag } from '@tabler/icons-react'
import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { FormField } from '../../../components/ui/FormField'
import { ic } from '../../../lib/tabler'
import { useCategoriaQuery, useUpdateCategoriaMutation } from '../hooks/useCategorias'

export function EditarCategoriaPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: categoria, isPending, isError, error, refetch } = useCategoriaQuery(id)
  const updateMutation = useUpdateCategoriaMutation()

  const [nombre, setNombre] = useState('')
  const [activo, setActivo] = useState(true)

  useEffect(() => {
    if (categoria) {
      setNombre(categoria.nombre)
      setActivo(categoria.activo)
    }
  }, [categoria])

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!id) return
    updateMutation.mutate(
      { id, input: { nombre, activo } },
      { onSuccess: () => navigate('/inventario/categorias', { replace: true }) },
    )
  }

  const backLink = (
    <Link
      to="/inventario/categorias"
      className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium text-[#6e6b7b] transition hover:bg-white hover:text-[#3d3b4f] hover:shadow-sm"
    >
      <IconArrowLeft size={16} stroke={1.5} className="shrink-0" aria-hidden />
      Volver
    </Link>
  )

  if (!id) {
    return (
      <div className="space-y-4">
        {backLink}
        <div className="rounded-xl bg-red-50 px-5 py-4 text-sm text-red-800 ring-1 ring-red-200">
          Falta el identificador de la categoría.
        </div>
      </div>
    )
  }

  if (isPending) {
    return (
      <div className="space-y-4">
        {backLink}
        <div className="animate-pulse space-y-3">
          <div className="h-10 w-1/2 rounded-xl bg-white shadow-sm ring-1 ring-black/4" />
          <div className="h-40 max-w-lg rounded-xl bg-white shadow-sm ring-1 ring-black/4" />
        </div>
      </div>
    )
  }

  if (isError) {
    const msg = error instanceof Error ? error.message : 'Error al cargar.'
    return (
      <div className="space-y-4">
        {backLink}
        <div className="flex flex-col items-center gap-3 rounded-xl bg-white px-8 py-12 text-center shadow-sm ring-1 ring-black/4">
          <IconAlertCircle size={32} stroke={1.5} className="text-red-400" aria-hidden />
          <p className="text-sm text-[#6e6b7b]">{msg}</p>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-700 transition hover:bg-red-50"
            onClick={() => void refetch()}
          >
            <IconRefresh size={15} stroke={1.5} className="shrink-0" aria-hidden />
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  const saving = updateMutation.isPending

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-primary-ghost text-brand-primary">
              <IconTag {...ic.headerSm} aria-hidden />
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-[#3d3b4f]">Editar categoría</h1>
          </div>
          <p className="mt-1.5 text-sm text-[#6e6b7b]">Nombre y visibilidad en formularios de artículos.</p>
        </div>
        {backLink}
      </div>

      {/* Form island */}
      <form
        onSubmit={handleSubmit}
        className="max-w-lg overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-black/4"
      >
        <div className="border-b border-[#f0eef5] bg-[#f8f7fa] px-5 py-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#b9b6c3]">Datos de la categoría</p>
        </div>
        <div className="space-y-5 p-5">
          <FormField
            label="Nombre"
            value={nombre}
            onChange={(ev) => setNombre(ev.target.value)}
            placeholder="Ej. Remeras"
            required
            disabled={saving}
          />

          <label className="flex cursor-pointer items-center gap-2.5 text-sm text-[#3d3b4f]">
            <input
              type="checkbox"
              checked={activo}
              onChange={(ev) => setActivo(ev.target.checked)}
              disabled={saving}
              className="h-4 w-4 rounded border-brand-border-strong text-brand-primary focus:ring-brand-blush/50"
            />
            Categoría activa (visible en formularios de artículos)
          </label>

        </div>

        <div className="flex flex-wrap gap-3 border-t border-[#f0eef5] px-5 py-4">
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-brand-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? 'Guardando…' : 'Guardar cambios'}
          </button>
          <Link
            to="/inventario/categorias"
            className="inline-flex items-center rounded-lg border border-[#e8e4f0] bg-white px-5 py-2.5 text-sm font-medium text-[#6e6b7b] transition hover:text-[#3d3b4f]"
          >
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  )
}
