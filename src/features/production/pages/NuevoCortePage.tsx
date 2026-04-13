import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { uploadCorteImage } from '../../media/services/storage.service'
import { updateCorte } from '../services/cortes.service'
import { CorteForm } from '../components/CorteForm'
import { useCreateCorteMutation } from '../hooks/useCortes'
import type { NewCorteInput } from '../services/cortes.service'

export function NuevoCortePage() {
  const navigate = useNavigate()
  const createMutation = useCreateCorteMutation()
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(input: NewCorteInput, imageFile: File | null) {
    setError(null)
    try {
      const corte = await createMutation.mutateAsync(input)

      if (imageFile) {
        try {
          const { path } = await uploadCorteImage(corte.id, imageFile)
          await updateCorte(corte.id, { ...input, imagen_path: path })
        } catch (imgErr) {
          // Corte creado pero imagen falló: navegar igual, mostrar aviso
          setError(
            `El corte se creó, pero la imagen no se guardó: ${imgErr instanceof Error ? imgErr.message : 'error desconocido'}`
          )
          navigate(`/produccion/cortes/${corte.id}`, { replace: true })
          return
        }
      }

      navigate(`/produccion/cortes/${corte.id}`, { replace: true })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo crear el corte.')
    }
  }

  return (
    <div className="space-y-6">
      <CorteForm
        mode="create"
        onSubmit={handleSubmit}
        saving={createMutation.isPending}
        error={error}
      />
    </div>
  )
}
