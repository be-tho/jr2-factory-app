import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { FormField } from '../../../components/ui/FormField'
import { PageHeader } from '../../../components/ui/PageHeader'
import { useTemporadaQuery, useUpdateTemporadaMutation } from '../hooks/useTemporadas'

export function EditarTemporadaPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: temporada, isPending, isError, error, refetch } = useTemporadaQuery(id)
  const updateMutation = useUpdateTemporadaMutation()

  const [nombre, setNombre] = useState('')
  const [activo, setActivo] = useState(true)

  useEffect(() => {
    if (temporada) {
      setNombre(temporada.nombre)
      setActivo(temporada.activo)
    }
  }, [temporada])

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!id) return
    updateMutation.mutate(
      { id, input: { nombre, activo } },
      {
        onSuccess: () => navigate('/inventario/temporadas', { replace: true }),
      },
    )
  }

  if (!id) {
    return (
      <div className="space-y-6">
        <PageHeader title="Editar temporada" description="No se pudo cargar el registro." />
        <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-800">
          Falta el identificador de la temporada.
        </div>
        <Link
          to="/inventario/temporadas"
          className="text-sm font-medium text-brand-ink underline-offset-2 hover:underline"
        >
          Volver al listado
        </Link>
      </div>
    )
  }

  if (isPending) {
    return (
      <div className="space-y-6">
        <PageHeader title="Editar temporada" description="Cargando…" />
        <p className="text-sm text-brand-ink-muted">Cargando…</p>
      </div>
    )
  }

  if (isError) {
    const msg = error instanceof Error ? error.message : 'Error al cargar.'
    return (
      <div className="space-y-6">
        <PageHeader title="Editar temporada" description="No se pudo cargar el registro." />
        <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-800">{msg}</div>
        <button
          type="button"
          className="rounded-lg border border-red-300 bg-white px-3 py-1.5 text-sm font-medium text-red-900 transition hover:bg-red-100"
          onClick={() => void refetch()}
        >
          Reintentar
        </button>
        <Link
          to="/inventario/temporadas"
          className="block text-sm font-medium text-brand-ink underline-offset-2 hover:underline"
        >
          Volver al listado
        </Link>
      </div>
    )
  }

  const saving = updateMutation.isPending
  const saveError =
    updateMutation.isError && updateMutation.error instanceof Error
      ? updateMutation.error.message
      : null

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <PageHeader title="Editar temporada" description="Nombre y visibilidad en catálogos de artículos." />
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

        {saveError ? (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{saveError}</p>
        ) : null}

        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg border border-brand-primary-hover bg-brand-primary px-4 py-2.5 text-sm font-semibold text-brand-on-primary shadow-sm transition hover:bg-brand-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? 'Guardando…' : 'Guardar cambios'}
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
