import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { CostureroForm } from '../components/CostureroForm'
import { useCostureroQuery, useUpdateCostureroMutation } from '../hooks/useCostureros'
import type { CostureroInput } from '../services/costureros.service'

export function EditarCostureroPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: costurero, isPending: loading, isError } = useCostureroQuery(id)
  const updateMutation = useUpdateCostureroMutation()
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(input: CostureroInput) {
    if (!id) return
    setError(null)
    setSubmitting(true)
    try {
      await updateMutation.mutateAsync({ id, input })
      navigate(`/produccion/costureros/${id}`, { replace: true })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo actualizar el costurero.')
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-sm text-brand-ink-muted">Cargando costurero…</p>
      </div>
    )
  }

  if (isError || !costurero) {
    return (
      <div className="rounded-xl bg-red-50 px-5 py-4 text-sm ring-1 ring-red-200">
        <p className="font-semibold text-red-800">No se pudo cargar el costurero</p>
        <p className="mt-1 text-red-600">Verificá que el costurero exista.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <CostureroForm
        mode="edit"
        initialData={costurero}
        onSubmit={handleSubmit}
        saving={submitting}
        error={error}
      />
    </div>
  )
}
