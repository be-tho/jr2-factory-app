import { IconLoader2, IconTrash } from '@tabler/icons-react'
import { createPortal } from 'react-dom'

type OrdenDeleteConfirmDialogProps = {
  clienteNombre: string
  loading: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function OrdenDeleteConfirmDialog({
  clienteNombre,
  loading,
  onConfirm,
  onCancel,
}: OrdenDeleteConfirmDialogProps) {
  if (typeof document === 'undefined') return null

  return createPortal(
    <div
      role="presentation"
      className="fixed inset-0 z-100 flex items-center justify-center bg-modal-scrim p-4 sm:p-6"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !loading) onCancel()
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="orden-delete-title"
        className="w-full max-w-md rounded-2xl border border-brand-border bg-brand-surface p-6 shadow-[0_24px_48px_-12px_rgba(44,40,41,0.45)] ring-1 ring-black/5"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <h3 id="orden-delete-title" className="text-base font-bold text-brand-ink">
          ¿Eliminar esta orden?
        </h3>
        <p className="mt-2 text-sm text-brand-ink-muted">
          Se va a borrar el pedido de <span className="font-semibold">{clienteNombre}</span> y todas sus líneas. Usalo si
          el cliente no va a pagar: la acción no se puede deshacer.
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="rounded-lg border border-brand-border px-4 py-2 text-sm font-medium text-brand-ink-muted transition hover:bg-brand-canvas disabled:opacity-40"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-60"
          >
            {loading ? <IconLoader2 size={16} className="animate-spin" aria-hidden /> : <IconTrash size={16} stroke={2} aria-hidden />}
            Eliminar orden
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
