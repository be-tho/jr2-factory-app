import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ClienteEnvioForm } from '../components/ClienteEnvioForm'
import { useCreateClienteEnvioMutation } from '../hooks/useClientesEnvio'
import type { ClienteEnvioInput } from '../services/clientesEnvio.service'

export function NuevoClienteEnvioPage() {
  const navigate = useNavigate()
  const createMutation = useCreateClienteEnvioMutation()
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(input: ClienteEnvioInput) {
    setError(null)
    setSubmitting(true)
    try {
      const row = await createMutation.mutateAsync(input)
      navigate(`/envios/${row.id}`, { replace: true })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo guardar.')
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <ClienteEnvioForm mode="create" onSubmit={handleSubmit} saving={submitting} error={error} />
    </div>
  )
}
