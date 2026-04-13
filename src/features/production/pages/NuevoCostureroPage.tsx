import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CostureroForm } from '../components/CostureroForm'
import { useCreateCostureroMutation } from '../hooks/useCostureros'
import type { CostureroInput } from '../services/costureros.service'

export function NuevoCostureroPage() {
  const navigate = useNavigate()
  const createMutation = useCreateCostureroMutation()
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(input: CostureroInput) {
    setError(null)
    setSubmitting(true)
    try {
      const costurero = await createMutation.mutateAsync(input)
      navigate(`/produccion/costureros/${costurero.id}`, { replace: true })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo crear el costurero.')
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <CostureroForm
        mode="create"
        onSubmit={handleSubmit}
        saving={submitting}
        error={error}
      />
    </div>
  )
}
