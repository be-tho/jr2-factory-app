import { IconArrowLeft, IconCalendar } from '@tabler/icons-react'
import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FormField } from '../../../components/ui/FormField'
import { ic } from '../../../lib/tabler'
import { useCreateTemporadaMutation } from '../hooks/useTemporadas'

export function NuevaTemporadaPage() {
  const navigate = useNavigate()
  const createMutation = useCreateTemporadaMutation()
  const [nombre, setNombre] = useState('')
  const [activo, setActivo] = useState(true)

  const saving = createMutation.isPending
  const errorMessage =
    createMutation.isError && createMutation.error instanceof Error
      ? createMutation.error.message
      : null

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    createMutation.mutate(
      { nombre, activo },
      { onSuccess: () => navigate('/inventario/temporadas', { replace: true }) },
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-primary-ghost text-brand-primary">
              <IconCalendar {...ic.headerSm} aria-hidden />
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-[#3d3b4f]">Nueva temporada</h1>
          </div>
          <p className="mt-1.5 text-sm text-[#6e6b7b]">Alta de una temporada para asignar a artículos.</p>
        </div>
        <Link
          to="/inventario/temporadas"
          className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium text-[#6e6b7b] transition hover:bg-white hover:text-[#3d3b4f] hover:shadow-sm"
        >
          <IconArrowLeft size={16} stroke={1.5} className="shrink-0" aria-hidden />
          Volver
        </Link>
      </div>

      {/* Form island */}
      <form
        onSubmit={handleSubmit}
        className="max-w-lg overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-black/4"
      >
        <div className="border-b border-[#f0eef5] bg-[#f8f7fa] px-5 py-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#b9b6c3]">Datos de la temporada</p>
        </div>
        <div className="space-y-5 p-5">
          <FormField
            label="Nombre"
            value={nombre}
            onChange={(ev) => setNombre(ev.target.value)}
            placeholder="Ej. Verano 2026"
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
            Temporada activa (visible en formularios de artículos)
          </label>

          {errorMessage ? (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 ring-1 ring-red-200">{errorMessage}</p>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-3 border-t border-[#f0eef5] px-5 py-4">
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-brand-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? 'Guardando…' : 'Guardar'}
          </button>
          <Link
            to="/inventario/temporadas"
            className="inline-flex items-center rounded-lg border border-[#e8e4f0] bg-white px-5 py-2.5 text-sm font-medium text-[#6e6b7b] transition hover:text-[#3d3b4f]"
          >
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  )
}
