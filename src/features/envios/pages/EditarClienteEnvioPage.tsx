import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ClienteEnvioForm } from '../components/ClienteEnvioForm'
import { useClienteEnvioQuery, useUpdateClienteEnvioMutation } from '../hooks/useClientesEnvio'
import type { ClienteEnvioInput } from '../services/clientesEnvio.service'

export function EditarClienteEnvioPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: row, isPending: loading, isError } = useClienteEnvioQuery(id)
  const updateMutation = useUpdateClienteEnvioMutation()
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(input: ClienteEnvioInput) {
    if (!id) return
    setError(null)
    setSubmitting(true)
    try {
      await updateMutation.mutateAsync({ id, input })
      navigate(`/envios/${id}`, { replace: true })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo actualizar.')
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-sm text-brand-ink-muted">Cargando…</p>
      </div>
    )
  }

  if (isError || !row) {
    return (
      <div className="rounded-xl bg-red-50 px-5 py-4 text-sm ring-1 ring-red-200">
        <p className="font-semibold text-red-800">No se pudo cargar el registro</p>
        <p className="mt-1 text-red-600">Verificá que el enlace sea correcto.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <ClienteEnvioForm mode="edit" initialData={row} onSubmit={handleSubmit} saving={submitting} error={error} />
    </div>
  )
}
