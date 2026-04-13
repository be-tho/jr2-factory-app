import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { uploadCorteImage } from '../../media/services/storage.service'
import { patchCorteImagePath } from '../services/cortes.service'
import { CorteForm } from '../components/CorteForm'
import { useCreateCorteMutation, cortesKeys } from '../hooks/useCortes'
import type { NewCorteInput } from '../services/cortes.service'

export function NuevoCortePage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const createMutation = useCreateCorteMutation()
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(input: NewCorteInput, imageFile: File | null) {
    setError(null)
    setSubmitting(true)
    try {
      const corte = await createMutation.mutateAsync(input)

      // Navegar de inmediato — la imagen se sube en segundo plano.
      // No hacemos setSubmitting(false): el componente se desmonta al navegar.
      navigate(`/produccion/cortes/${corte.id}`, { replace: true })

      if (imageFile) {
        uploadCorteImage(corte.id, imageFile)
          .then(async ({ path }) => {
            await patchCorteImagePath(corte.id, path)
            void queryClient.invalidateQueries({ queryKey: cortesKeys.detail(corte.id) })
          })
          .catch((imgErr: unknown) => {
            toast.error(
              `La imagen no se guardó: ${imgErr instanceof Error ? imgErr.message : 'error desconocido'}`,
            )
          })
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo crear el corte.')
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <CorteForm
        mode="create"
        onSubmit={handleSubmit}
        saving={submitting}
        error={error}
      />
    </div>
  )
}
