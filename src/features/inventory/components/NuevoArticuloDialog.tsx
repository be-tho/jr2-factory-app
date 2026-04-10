import { useEffect, useId, useRef, useState, type FormEvent } from 'react'
import { FormField } from '../../../components/ui/FormField'
import { createProduct, listCategorias, listTemporadas } from '../services/products.service'

type NuevoArticuloDialogProps = {
  open: boolean
  onClose: () => void
  onCreated: () => void
}

const selectClass =
  'w-full rounded-lg border border-brand-border-strong bg-brand-surface px-3 py-2 text-brand-ink outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-blush/50'

export function NuevoArticuloDialog({ open, onClose, onCreated }: NuevoArticuloDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const titleId = useId()
  const [name, setName] = useState('')
  const [sku, setSku] = useState('')
  const [categoriaId, setCategoriaId] = useState('')
  const [temporadaId, setTemporadaId] = useState('')
  const [precioLista, setPrecioLista] = useState('')
  const [precioPromo, setPrecioPromo] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [categorias, setCategorias] = useState<{ id: string; nombre: string }[]>([])
  const [temporadas, setTemporadas] = useState<{ id: string; nombre: string }[]>([])
  const [catalogError, setCatalogError] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const el = dialogRef.current
    if (!el) return
    if (open) {
      el.showModal()
      setError(null)
    } else {
      el.close()
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    let cancelled = false
    setCatalogError(null)
    void (async () => {
      const [c, t] = await Promise.all([listCategorias(), listTemporadas()])
      if (cancelled) return
      if (c.error) setCatalogError(c.error.message)
      else setCategorias(c.data)
      if (t.error) setCatalogError((prev) => prev ?? t.error?.message ?? null)
      else setTemporadas(t.data)
    })()
    return () => {
      cancelled = true
    }
  }, [open])

  function handleClose() {
    if (saving) return
    setName('')
    setSku('')
    setCategoriaId('')
    setTemporadaId('')
    setPrecioLista('')
    setPrecioPromo('')
    setDescripcion('')
    setError(null)
    onClose()
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const n = name.trim()
    const s = sku.trim()
    const pl = Number.parseInt(precioLista.replace(/\s/g, ''), 10)
    if (!n || !s || !categoriaId || !temporadaId || !Number.isFinite(pl) || pl < 0) {
      setError('Completá nombre, código, categoría, temporada y precio de lista válido.')
      return
    }
    const promoRaw = precioPromo.trim()
    let precio_promocional: number | null = null
    if (promoRaw !== '') {
      const p = Number.parseInt(promoRaw.replace(/\s/g, ''), 10)
      if (!Number.isFinite(p) || p < 0) {
        setError('Precio promocional inválido.')
        return
      }
      precio_promocional = p
    }
    setSaving(true)
    setError(null)
    const { error: err } = await createProduct({
      nombre: n,
      codigo: s,
      categoria_id: categoriaId,
      temporada_id: temporadaId,
      precio_lista: pl,
      precio_promocional,
      descripcion: descripcion.trim() || null,
    })
    setSaving(false)
    if (err) {
      setError(err.message)
      return
    }
    onCreated()
    setName('')
    setSku('')
    setCategoriaId('')
    setTemporadaId('')
    setPrecioLista('')
    setPrecioPromo('')
    setDescripcion('')
    onClose()
  }

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      className="w-[min(100%,28rem)] rounded-2xl border border-brand-border bg-brand-surface p-0 text-brand-ink shadow-xl ring-1 ring-brand-border-subtle backdrop:bg-brand-ink/25"
      onClose={handleClose}
      onCancel={(ev) => {
        ev.preventDefault()
        handleClose()
      }}
    >
      <form onSubmit={(e) => void handleSubmit(e)} className="flex flex-col">
        <div className="border-b border-brand-border bg-brand-blush/20 px-5 py-4">
          <h2 id={titleId} className="text-lg font-semibold text-brand-ink">
            Nuevo artículo
          </h2>
          <p className="mt-0.5 text-sm text-brand-ink-muted">
            Tabla <span className="font-mono text-xs">public.articulos</span> (FK a categorías y temporadas).
          </p>
        </div>
        <div className="max-h-[min(70vh,32rem)] space-y-3 overflow-y-auto px-5 py-4">
          {catalogError ? (
            <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
              No se pudieron cargar categorías o temporadas: {catalogError}
            </p>
          ) : null}
          <FormField label="Nombre" value={name} onChange={(ev) => setName(ev.target.value)} placeholder="Ej. Remera manga corta" required disabled={saving} />
          <FormField label="Código (SKU)" value={sku} onChange={(ev) => setSku(ev.target.value)} placeholder="Ej. REM-105" required disabled={saving} />
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-brand-ink-muted">Categoría</span>
            <select
              className={selectClass}
              value={categoriaId}
              onChange={(ev) => setCategoriaId(ev.target.value)}
              required
              disabled={saving || categorias.length === 0}
            >
              <option value="">Elegí una categoría</option>
              {categorias.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-brand-ink-muted">Temporada</span>
            <select
              className={selectClass}
              value={temporadaId}
              onChange={(ev) => setTemporadaId(ev.target.value)}
              required
              disabled={saving || temporadas.length === 0}
            >
              <option value="">Elegí una temporada</option>
              {temporadas.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.nombre}
                </option>
              ))}
            </select>
          </label>
          <FormField
            label="Precio lista"
            type="number"
            min={0}
            step={1}
            value={precioLista}
            onChange={(ev) => setPrecioLista(ev.target.value)}
            placeholder="0"
            required
            disabled={saving}
          />
          <FormField
            label="Precio promocional (opcional)"
            type="number"
            min={0}
            step={1}
            value={precioPromo}
            onChange={(ev) => setPrecioPromo(ev.target.value)}
            placeholder="—"
            disabled={saving}
          />
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-brand-ink-muted">Descripción (opcional)</span>
            <textarea
              className="min-h-[4rem] w-full rounded-lg border border-brand-border-strong bg-brand-surface px-3 py-2 text-brand-ink outline-none transition placeholder:text-brand-ink-faint focus:border-brand-primary focus:ring-2 focus:ring-brand-blush/50"
              value={descripcion}
              onChange={(ev) => setDescripcion(ev.target.value)}
              placeholder="Notas o detalle comercial"
              disabled={saving}
              rows={3}
            />
          </label>
          {error ? (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
          ) : null}
        </div>
        <div className="flex justify-end gap-2 border-t border-brand-border px-5 py-4">
          <button
            type="button"
            className="rounded-lg border border-brand-border bg-brand-surface px-4 py-2 text-sm font-medium text-brand-ink-muted transition hover:bg-brand-canvas hover:text-brand-ink disabled:cursor-not-allowed disabled:opacity-50"
            onClick={handleClose}
            disabled={saving}
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg border border-brand-border-strong bg-brand-primary px-4 py-2 text-sm font-medium text-brand-ink shadow-sm transition hover:bg-brand-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? 'Guardando…' : 'Guardar'}
          </button>
        </div>
      </form>
    </dialog>
  )
}
