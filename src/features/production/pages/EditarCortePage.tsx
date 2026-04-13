import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { removeCorteImage, uploadCorteImage } from '../../media/services/storage.service'
import { CorteForm } from '../components/CorteForm'
import { useCorteQuery, useUpdateCorteMutation } from '../hooks/useCortes'
import type { NewCorteInput } from '../services/cortes.service'

export function EditarCortePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: corte, isPending: loading, isError } = useCorteQuery(id)
  const updateMutation = useUpdateCorteMutation()
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(input: NewCorteInput, imageFile: File | null) {
    if (!id) return
    setError(null)
    setSubmitting(true)
    try {
      let imagen_path = input.imagen_path

      if (imageFile) {
        const { path } = await uploadCorteImage(id, imageFile)
        if (input.imagen_path) {
          await removeCorteImage(input.imagen_path).catch(() => {})
        }
        imagen_path = path
      }

      await updateMutation.mutateAsync({ id, input: { ...input, imagen_path } })

      // No hacemos setSubmitting(false): el componente se desmonta al navegar.
      navigate(`/produccion/cortes/${id}`, { replace: true })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo actualizar el corte.')
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-sm text-brand-ink-muted">Cargando corte…</p>
      </div>
    )
  }

  if (isError || !corte) {
    return (
      <div className="rounded-xl bg-red-50 px-5 py-4 text-sm ring-1 ring-red-200">
        <p className="font-semibold text-red-800">No se pudo cargar el corte</p>
        <p className="mt-1 text-red-600">Verificá que el corte exista.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <CorteForm
        mode="edit"
        initialData={corte}
        onSubmit={handleSubmit}
        saving={submitting}
        error={error}
      />
    </div>
  )
}
