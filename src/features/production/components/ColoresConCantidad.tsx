import { IconPlus, IconTrash } from '@tabler/icons-react'
import { useId } from 'react'

export interface ColorEntry {
  /** ID local para key estable (no va a la DB). */
  _key: string
  color: string
  cantidad: number
}

interface ColoresConCantidadProps {
  value: ColorEntry[]
  onChange: (entries: ColorEntry[]) => void
  disabled?: boolean
}

function makeKey() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

export function makeEmptyColor(): ColorEntry {
  return { _key: makeKey(), color: '', cantidad: 1 }
}

export function ColoresConCantidad({ value, onChange, disabled }: ColoresConCantidadProps) {
  const baseId = useId()

  function handleColorChange(key: string, color: string) {
    onChange(value.map((e) => (e._key === key ? { ...e, color } : e)))
  }

  function handleCantidadChange(key: string, raw: string) {
    const n = parseInt(raw, 10)
    onChange(value.map((e) => (e._key === key ? { ...e, cantidad: Number.isFinite(n) && n > 0 ? n : 1 } : e)))
  }

  function handleAdd() {
    onChange([...value, makeEmptyColor()])
  }

  function handleRemove(key: string) {
    onChange(value.filter((e) => e._key !== key))
  }

  return (
    <div className="space-y-2">
      {value.length === 0 && (
        <p className="text-sm text-brand-ink-faint">No hay colores cargados todavía.</p>
      )}

      {value.map((entry, idx) => (
        <div key={entry._key} className="flex items-center gap-2">
          <label className="sr-only" htmlFor={`${baseId}-color-${idx}`}>
            Color {idx + 1}
          </label>
          <input
            id={`${baseId}-color-${idx}`}
            type="text"
            value={entry.color}
            onChange={(e) => handleColorChange(entry._key, e.target.value)}
            placeholder="ej: rojo, azul marino…"
            disabled={disabled}
            className="min-w-0 flex-1 rounded-lg border border-brand-border-strong bg-brand-surface px-3 py-2 text-sm text-brand-ink outline-none transition placeholder:text-brand-ink-faint focus:border-brand-primary focus:ring-2 focus:ring-brand-blush/50 disabled:opacity-60"
          />

          <label className="sr-only" htmlFor={`${baseId}-cant-${idx}`}>
            Cantidad {idx + 1}
          </label>
          <input
            id={`${baseId}-cant-${idx}`}
            type="number"
            min={1}
            step={1}
            value={entry.cantidad}
            onChange={(e) => handleCantidadChange(entry._key, e.target.value)}
            disabled={disabled}
            className="w-24 rounded-lg border border-brand-border-strong bg-brand-surface px-3 py-2 text-sm text-brand-ink outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-blush/50 disabled:opacity-60"
          />

          <button
            type="button"
            aria-label={`Quitar color ${entry.color || idx + 1}`}
            onClick={() => handleRemove(entry._key)}
            disabled={disabled}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-brand-border text-brand-ink-faint transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <IconTrash size={15} stroke={1.5} aria-hidden />
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={handleAdd}
        disabled={disabled}
        className="mt-1 inline-flex items-center gap-1.5 rounded-lg border border-brand-border px-3 py-2 text-sm font-medium text-brand-primary transition hover:border-brand-blush-deep hover:bg-brand-primary-ghost disabled:cursor-not-allowed disabled:opacity-40"
      >
        <IconPlus size={15} stroke={2} aria-hidden />
        Agregar color
      </button>
    </div>
  )
}
