import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FormField } from '../../../components/ui/FormField'
import { PageHeader } from '../../../components/ui/PageHeader'
import { createProduct, listCategorias, listTemporadas } from '../services/products.service'

const selectClass =
  'w-full rounded-lg border border-brand-border-strong bg-brand-surface px-3 py-2 text-brand-ink outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-blush/50'

const sectionCardClass =
  'overflow-hidden rounded-xl border border-brand-border bg-brand-surface shadow-sm shadow-brand-ink/5 ring-1 ring-brand-border-subtle'

function SectionHeader({ title, hint }: { title: string; hint?: string }) {
  return (
    <header className="border-b border-brand-border bg-brand-blush/20 px-5 py-3">
      <h2 className="font-medium text-brand-ink">{title}</h2>
      {hint ? <p className="mt-0.5 text-sm text-brand-ink-muted">{hint}</p> : null}
    </header>
  )
}

export function NuevoArticuloPage() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [sku, setSku] = useState('')
  const [categoriaId, setCategoriaId] = useState('')
  const [temporadaId, setTemporadaId] = useState('')
  const [precioLista, setPrecioLista] = useState('')
  const [precioPromo, setPrecioPromo] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [categorias, setCategorias] = useState<{ id: string; nombre: string }[]>([])
  const [temporadas, setTemporadas] = useState<{ id: string; nombre: string }[]>([])
  const [catalogLoading, setCatalogLoading] = useState(true)
  const [catalogError, setCatalogError] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let cancelled = false
    setCatalogLoading(true)
    setCatalogError(null)
    void (async () => {
      const [c, t] = await Promise.all([listCategorias(), listTemporadas()])
      if (cancelled) return
      setCatalogLoading(false)
      if (c.error) setCatalogError(c.error.message)
      else setCategorias(c.data)
      if (t.error) setCatalogError((prev) => prev ?? t.error?.message ?? null)
      else setTemporadas(t.data)
    })()
    return () => {
      cancelled = true
    }
  }, [])

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
    const { data, error: err } = await createProduct({
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
    if (data?.id) {
      navigate(`/inventario/articulos/${data.id}`, { replace: true })
    } else {
      navigate('/inventario/articulos', { replace: true })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <PageHeader
          title="Nuevo artículo"
          description="Alta en catálogo: identificación, clasificación comercial y precios. El slug se genera automáticamente."
        />
        <Link
          to="/inventario/articulos"
          className="shrink-0 self-start rounded-lg border border-brand-border bg-brand-surface px-4 py-2.5 text-sm font-medium text-brand-ink-muted transition hover:border-brand-border-strong hover:text-brand-ink"
        >
          ← Volver al listado
        </Link>
      </div>

      <form onSubmit={(e) => void handleSubmit(e)} className="space-y-6">
        {catalogError ? (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            <p className="font-medium">Catálogo auxiliar</p>
            <p className="mt-1">No se pudieron cargar categorías o temporadas: {catalogError}</p>
          </div>
        ) : null}

        <section className={sectionCardClass}>
          <SectionHeader title="Identificación" hint="Nombre visible y código único (SKU)." />
          <div className="grid gap-4 px-5 py-5 sm:grid-cols-2">
            <FormField
              label="Nombre"
              value={name}
              onChange={(ev) => setName(ev.target.value)}
              placeholder="Ej. Remera manga corta"
              required
              disabled={saving}
            />
            <FormField
              label="Código (SKU)"
              value={sku}
              onChange={(ev) => setSku(ev.target.value)}
              placeholder="Ej. REM-105"
              required
              disabled={saving}
            />
          </div>
        </section>

        <section className={sectionCardClass}>
          <SectionHeader title="Clasificación" hint="Categoría y temporada según tablas relacionadas en Supabase." />
          <div className="grid gap-4 px-5 py-5 sm:grid-cols-2">
            <label className="block sm:col-span-1">
              <span className="mb-1 block text-sm font-medium text-brand-ink-muted">Categoría</span>
              <select
                className={selectClass}
                value={categoriaId}
                onChange={(ev) => setCategoriaId(ev.target.value)}
                required
                disabled={saving || catalogLoading || categorias.length === 0}
              >
                <option value="">{catalogLoading ? 'Cargando…' : 'Elegí una categoría'}</option>
                {categorias.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                  </option>
                ))}
              </select>
            </label>
            <label className="block sm:col-span-1">
              <span className="mb-1 block text-sm font-medium text-brand-ink-muted">Temporada</span>
              <select
                className={selectClass}
                value={temporadaId}
                onChange={(ev) => setTemporadaId(ev.target.value)}
                required
                disabled={saving || catalogLoading || temporadas.length === 0}
              >
                <option value="">{catalogLoading ? 'Cargando…' : 'Elegí una temporada'}</option>
                {temporadas.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.nombre}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </section>

        <section className={sectionCardClass}>
          <SectionHeader title="Precios" hint="Valores enteros; el stock inicia en cero salvo que lo ajustes después." />
          <div className="grid gap-4 px-5 py-5 sm:grid-cols-2">
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
          </div>
        </section>

        <section className={sectionCardClass}>
          <SectionHeader title="Descripción" hint="Opcional; notas internas o detalle comercial." />
          <div className="px-5 py-5">
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-brand-ink-muted">Texto</span>
              <textarea
                className="min-h-24 w-full rounded-lg border border-brand-border-strong bg-brand-surface px-3 py-2 text-brand-ink outline-none transition placeholder:text-brand-ink-faint focus:border-brand-primary focus:ring-2 focus:ring-brand-blush/50"
                value={descripcion}
                onChange={(ev) => setDescripcion(ev.target.value)}
                placeholder="Notas o detalle comercial"
                disabled={saving}
                rows={4}
              />
            </label>
          </div>
        </section>

        {error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            <p className="font-medium">No se pudo guardar</p>
            <p className="mt-1 text-red-700">{error}</p>
          </div>
        ) : null}

        <div className="flex flex-col-reverse gap-3 border-t border-brand-border-subtle pt-2 sm:flex-row sm:justify-end">
          <Link
            to="/inventario/articulos"
            className="inline-flex justify-center rounded-lg border border-brand-border bg-brand-surface px-5 py-2.5 text-sm font-medium text-brand-ink-muted transition hover:bg-brand-canvas hover:text-brand-ink"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={saving || catalogLoading}
            className="inline-flex justify-center rounded-lg border border-brand-border-strong bg-brand-primary px-5 py-2.5 text-sm font-medium text-brand-ink shadow-sm transition hover:bg-brand-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? 'Guardando…' : 'Crear artículo'}
          </button>
        </div>
      </form>
    </div>
  )
}
