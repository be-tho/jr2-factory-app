import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FormField } from '../../../components/ui/FormField'
import { PageHeader } from '../../../components/ui/PageHeader'
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
      {
        onSuccess: () => navigate('/inventario/temporadas', { replace: true }),
      },
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <PageHeader title="Nueva temporada" description="Alta de una temporada para asignar a artículos." />
        <Link
          to="/inventario/temporadas"
          className="text-sm font-medium text-brand-ink-muted underline-offset-2 hover:text-brand-ink hover:underline"
        >
          Volver al listado
        </Link>
      </div>

      <form
        onSubmit={handleSubmit}
        className="max-w-lg space-y-5 rounded-xl border border-brand-border bg-brand-surface p-6 shadow-sm shadow-brand-ink/5 ring-1 ring-brand-border-subtle"
      >
        <FormField
          label="Nombre"
          value={nombre}
          onChange={(ev) => setNombre(ev.target.value)}
          placeholder="Ej. Verano 2026"
          required
          disabled={saving}
        />

        <label className="flex cursor-pointer items-center gap-2 text-sm text-brand-ink">
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
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{errorMessage}</p>
        ) : null}

        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg border border-brand-primary-hover bg-brand-primary px-4 py-2.5 text-sm font-semibold text-brand-on-primary shadow-sm transition hover:bg-brand-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? 'Guardando…' : 'Guardar'}
          </button>
          <Link
            to="/inventario/temporadas"
            className="inline-flex items-center rounded-lg border border-brand-border-strong bg-white px-4 py-2.5 text-sm font-medium text-brand-ink transition hover:bg-brand-blush/20"
          >
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  )
}
