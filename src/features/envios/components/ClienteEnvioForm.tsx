import { IconArrowLeft, IconCheck, IconExternalLink, IconMapPin, IconTruck } from '@tabler/icons-react'
import { type FormEvent, useState } from 'react'
import { Link } from 'react-router-dom'
import { FormField } from '../../../components/ui/FormField'
import {
  isProvinciaArgentina,
  PROVINCIAS_ARGENTINA,
  type ProvinciaArgentina,
} from '../../../lib/argentina-provincias'
import { isGoogleMapsEmbedUrl } from '../../../lib/maps-embed'
import { ic } from '../../../lib/tabler'
import type { ClienteEnvio } from '../../../types/database'
import type { ClienteEnvioInput } from '../services/clientesEnvio.service'
import { CTC_GOOGLE_MAPS_EMBED_URL, CTC_GOOGLE_MAPS_URL } from '../lib/ctc-campus'

const selectClass =
  'w-full rounded-lg border border-brand-border-strong bg-brand-surface px-3 py-2 text-brand-ink outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-blush/50'

function SectionCard({
  title,
  icon,
  children,
}: {
  title: string
  icon: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <section className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-black/4">
      <header className="flex items-center gap-2 border-b border-[#f0eef5] bg-[#f8f7fa] px-5 py-3">
        <span className="text-brand-ink-faint">{icon}</span>
        <h2 className="text-xs font-semibold uppercase tracking-wider text-[#b9b6c3]">{title}</h2>
      </header>
      <div className="grid gap-4 px-5 py-5 sm:grid-cols-2">{children}</div>
    </section>
  )
}

export interface ClienteEnvioFormProps {
  mode: 'create' | 'edit'
  initialData?: ClienteEnvio
  onSubmit: (input: ClienteEnvioInput) => Promise<void>
  saving: boolean
  error: string | null
}

function normalizeMapsUrl(raw: string): string {
  const t = raw.trim()
  if (!t) return t
  if (/^https?:\/\//i.test(t)) return t
  return `https://${t}`
}

export function ClienteEnvioForm({ mode, initialData, onSubmit, saving, error }: ClienteEnvioFormProps) {
  const isCtcCatalog = initialData?.catalogo_origen === 'ctc'

  const [nombreEmpresa, setNombreEmpresa] = useState(initialData?.nombre_empresa ?? '')
  const [direccion, setDireccion] = useState(initialData?.direccion ?? '')
  const [localidad, setLocalidad] = useState(initialData?.localidad ?? '')
  const [provincia, setProvincia] = useState<ProvinciaArgentina>(() => {
    const p = initialData?.provincia
    if (p && isProvinciaArgentina(p)) return p
    return 'Buenos Aires'
  })
  const [mapsUrl, setMapsUrl] = useState(initialData?.maps_url ?? '')
  const [mapsEmbedUrl, setMapsEmbedUrl] = useState(initialData?.maps_embed_url ?? '')
  const [telefono, setTelefono] = useState(initialData?.telefono ?? '')
  const [horarioAtencion, setHorarioAtencion] = useState(initialData?.horario_atencion ?? '')
  const [observaciones, setObservaciones] = useState(initialData?.observaciones ?? '')
  const [zonasEnvio, setZonasEnvio] = useState(initialData?.zonas_envio ?? '')
  const [notas, setNotas] = useState(initialData?.notas ?? '')
  const [activo, setActivo] = useState(initialData?.activo ?? true)

  const [fieldErrors, setFieldErrors] = useState<{
    nombreEmpresa?: string
    direccion?: string
    mapsUrl?: string
    mapsEmbedUrl?: string
    zonasEnvio?: string
  }>({})

  function clearErr(k: keyof typeof fieldErrors) {
    setFieldErrors((p) => {
      if (!p[k]) return p
      const n = { ...p }
      delete n[k]
      return n
    })
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const errs: typeof fieldErrors = {}
    if (!nombreEmpresa.trim()) errs.nombreEmpresa = 'El nombre de la empresa es obligatorio.'
    if (!direccion.trim()) errs.direccion = 'La dirección es obligatoria.'
    if (!zonasEnvio.trim()) errs.zonasEnvio = 'Indicá a dónde envía el cliente (zonas, provincias, etc.).'

    let urlNormalized: string
    let embedTrim: string | null

    if (isCtcCatalog) {
      urlNormalized = CTC_GOOGLE_MAPS_URL
      embedTrim = CTC_GOOGLE_MAPS_EMBED_URL
    } else {
      urlNormalized = normalizeMapsUrl(mapsUrl)
      if (!mapsUrl.trim()) {
        errs.mapsUrl = 'El link de Google Maps es obligatorio.'
      } else {
        try {
          const u = new URL(urlNormalized)
          if (u.protocol !== 'http:' && u.protocol !== 'https:') errs.mapsUrl = 'Usá un link http o https válido.'
        } catch {
          errs.mapsUrl = 'No es un link válido. Pegá la URL que copiás de Google Maps (Compartir).'
        }
      }

      embedTrim = mapsEmbedUrl.trim() || null
      if (embedTrim && !isGoogleMapsEmbedUrl(embedTrim)) {
        errs.mapsEmbedUrl =
          'Si completás el embed, tiene que ser la URL del iframe de Google Maps (https://www.google.com/maps/embed?… o maps.google.com/…).'
      }
    }

    if (Object.keys(errs).length) {
      setFieldErrors(errs)
      return
    }
    setFieldErrors({})

    await onSubmit({
      nombre_empresa: nombreEmpresa.trim(),
      direccion: direccion.trim(),
      localidad: localidad.trim() || null,
      provincia,
      maps_url: urlNormalized,
      maps_embed_url: embedTrim,
      telefono: telefono.trim() || null,
      horario_atencion: horarioAtencion.trim() || null,
      observaciones: observaciones.trim() || null,
      zonas_envio: zonasEnvio.trim(),
      notas: notas.trim() || null,
      activo,
    })
  }

  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-primary-ghost text-brand-primary">
            <IconTruck {...ic.headerSm} aria-hidden />
          </span>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#3d3b4f]">
              {mode === 'create' ? 'Nueva dirección de envío' : 'Editar dirección de envío'}
            </h1>
            {mode === 'edit' && initialData && (
              <p className="mt-0.5 text-sm text-[#6e6b7b]">{initialData.nombre_empresa}</p>
            )}
          </div>
        </div>
        <Link
          to="/envios"
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium text-[#6e6b7b] transition hover:bg-white hover:text-[#3d3b4f] hover:shadow-sm"
        >
          <IconArrowLeft size={16} stroke={1.5} aria-hidden />
          Volver al listado
        </Link>
      </div>

      <form onSubmit={(e) => void handleSubmit(e)} className="relative space-y-6">
        {saving && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 rounded-xl bg-white/75 backdrop-blur-[2px]">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-md ring-1 ring-black/8">
              <svg className="h-7 w-7 animate-spin text-brand-primary" viewBox="0 0 24 24" fill="none" aria-hidden>
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-brand-ink">
              {mode === 'create' ? 'Guardando…' : 'Guardando cambios…'}
            </p>
          </div>
        )}

        <SectionCard title="Empresa y ubicación" icon={<IconTruck size={14} stroke={1.5} />}>
          <div className="sm:col-span-2">
            <FormField
              label="Nombre de la empresa *"
              value={nombreEmpresa}
              onChange={(e) => {
                setNombreEmpresa(e.target.value)
                clearErr('nombreEmpresa')
              }}
              placeholder="Ej: Distribuidora Norte S.A."
              required
              disabled={saving}
              error={fieldErrors.nombreEmpresa}
            />
          </div>
          <label className="block sm:col-span-2">
            <span className="mb-1 block text-sm font-medium text-brand-ink-muted">Provincia (jurisdicción) *</span>
            <select
              className={selectClass}
              value={provincia}
              onChange={(e) => setProvincia(e.target.value as ProvinciaArgentina)}
              disabled={saving}
            >
              {PROVINCIAS_ARGENTINA.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
            <p className="mt-1.5 text-xs text-brand-ink-faint">
              Si cubre varias provincias o no aplica, elegí <strong className="font-semibold">Otro</strong> y detallá en
              &quot;Zonas de envío&quot;.
            </p>
          </label>
          <FormField
            label="Localidad / ciudad"
            value={localidad}
            onChange={(e) => setLocalidad(e.target.value)}
            placeholder="Ej: Rosario"
            disabled={saving}
          />
          <div className="sm:col-span-2">
            <FormField
              label="Dirección completa *"
              value={direccion}
              onChange={(e) => {
                setDireccion(e.target.value)
                clearErr('direccion')
              }}
              placeholder="Calle, número, piso, barrio, referencias…"
              required
              disabled={saving}
              error={fieldErrors.direccion}
            />
          </div>
          <FormField
            label="Teléfono de contacto"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
            placeholder="Ej: (011) 1234-5678, WhatsApp…"
            disabled={saving}
          />
          <FormField
            label="Horario de atención"
            value={horarioAtencion}
            onChange={(e) => setHorarioAtencion(e.target.value)}
            placeholder="Ej: Lun. a Vie. 8 a 17 hs."
            disabled={saving}
          />
          <div className="sm:col-span-2">
            <FormField
              label="Observaciones"
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              placeholder="Ej: Nave B módulo 40 (CTC), referencia en planta…"
              disabled={saving}
            />
          </div>
          <p className="sm:col-span-2 text-xs text-brand-ink-faint">
            Teléfono, horario y observaciones son opcionales; sirven para operadores del CTC o datos de contacto en boca.
          </p>
        </SectionCard>

        <SectionCard title="Google Maps" icon={<IconMapPin size={14} stroke={1.5} />}>
          {isCtcCatalog ? (
            <div className="sm:col-span-2 space-y-3">
              <p className="text-sm leading-relaxed text-brand-ink-muted">
                En el catálogo CTC todas las empresas comparten el mismo{' '}
                <strong className="font-semibold text-brand-ink">link de Maps</strong> y el mismo{' '}
                <strong className="font-semibold text-brand-ink">iframe</strong> (campus Pergamino 3751). Coinciden con lo
                que ves en Envíos → panel CTC y se guardan siempre igual en la base al editar esta fila.
              </p>
              <div className="rounded-lg border border-brand-border-subtle bg-brand-canvas px-3 py-3 text-xs">
                <p className="font-semibold uppercase tracking-wide text-brand-ink-faint">maps_url</p>
                <p className="mt-1 break-all font-mono text-brand-ink">{CTC_GOOGLE_MAPS_URL}</p>
                <p className="mt-3 font-semibold uppercase tracking-wide text-brand-ink-faint">maps_embed_url</p>
                <p className="mt-1 break-all font-mono text-brand-ink">{CTC_GOOGLE_MAPS_EMBED_URL}</p>
              </div>
              <a
                href={CTC_GOOGLE_MAPS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-fit items-center gap-1.5 rounded-lg border border-brand-border-strong bg-white px-3 py-2 text-sm font-semibold text-brand-ink transition hover:bg-brand-canvas"
              >
                Abrir Maps del campus
                <IconExternalLink size={15} stroke={2} aria-hidden />
              </a>
            </div>
          ) : (
            <>
              <div className="sm:col-span-2 flex flex-col gap-2">
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => {
                    setMapsUrl(CTC_GOOGLE_MAPS_URL)
                    setMapsEmbedUrl(CTC_GOOGLE_MAPS_EMBED_URL)
                    clearErr('mapsUrl')
                    clearErr('mapsEmbedUrl')
                  }}
                  className="inline-flex w-fit items-center gap-2 rounded-lg border border-brand-primary/35 bg-brand-primary-ghost px-3 py-2 text-sm font-semibold text-brand-primary transition hover:bg-brand-primary/15 disabled:opacity-50"
                >
                  <IconMapPin size={16} stroke={1.5} aria-hidden />
                  Usar mapa del CTC (Pergamino 3751)
                </button>
                <p className="text-xs text-brand-ink-faint">
                  Rellena el mismo link y embed que usa el campus CTC para todas las empresas del listado.
                </p>
              </div>
              <div className="sm:col-span-2">
                <FormField
                  label="Link de Google Maps *"
                  value={mapsUrl}
                  onChange={(e) => {
                    setMapsUrl(e.target.value)
                    clearErr('mapsUrl')
                  }}
                  placeholder="https://maps.app.goo.gl/… o https://www.google.com/maps/…"
                  disabled={saving}
                  error={fieldErrors.mapsUrl}
                />
                <p className="mt-1.5 text-xs text-brand-ink-faint">
                  Es el link que compartís por WhatsApp (Compartir → Copiar enlace). Es la referencia principal.
                </p>
              </div>
              <div className="sm:col-span-2">
                <FormField
                  label="URL del embed (opcional)"
                  value={mapsEmbedUrl}
                  onChange={(e) => {
                    setMapsEmbedUrl(e.target.value)
                    clearErr('mapsEmbedUrl')
                  }}
                  placeholder="https://www.google.com/maps/embed?pb=…"
                  disabled={saving}
                  error={fieldErrors.mapsEmbedUrl}
                />
                <p className="mt-1.5 text-xs text-brand-ink-faint">
                  Solo para ver el mapa embebido en esta app. En Google Maps: Compartir → Insertar mapa → copiar solo el{' '}
                  <code className="rounded bg-brand-canvas px-1 text-[11px]">src</code> del iframe.
                </p>
              </div>
            </>
          )}
        </SectionCard>

        <section className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-black/4">
          <header className="flex items-center gap-2 border-b border-[#f0eef5] bg-[#f8f7fa] px-5 py-3">
            <span className="text-brand-ink-faint">
              <IconTruck size={14} stroke={1.5} />
            </span>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-[#b9b6c3]">
              Cobertura de envíos y notas
            </h2>
          </header>
          <div className="space-y-4 px-5 py-5">
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-brand-ink-muted">¿A dónde envía? *</span>
              <textarea
                className="min-h-28 w-full rounded-lg border border-brand-border-strong bg-brand-surface px-3 py-2 text-sm text-brand-ink outline-none transition placeholder:text-brand-ink-faint focus:border-brand-primary focus:ring-2 focus:ring-brand-blush/50"
                value={zonasEnvio}
                onChange={(e) => {
                  setZonasEnvio(e.target.value)
                  clearErr('zonasEnvio')
                }}
                placeholder="Ej: CABA y GBA oeste; interior de Buenos Aires (Zona 1); todo el país vía correo…"
                disabled={saving}
                rows={4}
              />
              {fieldErrors.zonasEnvio && (
                <p className="mt-1 text-xs font-medium text-red-600">{fieldErrors.zonasEnvio}</p>
              )}
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-brand-ink-muted">Notas internas</span>
              <textarea
                className="min-h-20 w-full rounded-lg border border-brand-border-strong bg-brand-surface px-3 py-2 text-sm text-brand-ink outline-none transition placeholder:text-brand-ink-faint focus:border-brand-primary focus:ring-2 focus:ring-brand-blush/50"
                value={notas}
                onChange={(e) => setNotas(e.target.value)}
                placeholder="Horario de recepción, contacto en planta, observaciones para logística…"
                disabled={saving}
                rows={3}
              />
            </label>
            <label className="flex cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                checked={activo}
                onChange={(e) => setActivo(e.target.checked)}
                disabled={saving}
                className="h-4 w-4 rounded border-brand-border-strong accent-brand-primary"
              />
              <span className="text-sm font-medium text-brand-ink-muted">Cliente activo (aparece por defecto en filtros)</span>
            </label>
          </div>
        </section>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            <p className="font-medium">No se pudo guardar</p>
            <p className="mt-1 text-red-700">{error}</p>
          </div>
        )}

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Link
            to="/envios"
            className="inline-flex justify-center rounded-lg border border-[#e8e4f0] bg-white px-5 py-2.5 text-sm font-medium text-[#6e6b7b] transition hover:text-[#3d3b4f]"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex min-w-40 items-center justify-center gap-2 rounded-lg bg-brand-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? (
              <>
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                  <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Guardando…
              </>
            ) : (
              <>
                <IconCheck size={15} stroke={2.5} aria-hidden />
                {mode === 'create' ? 'Guardar dirección' : 'Guardar cambios'}
              </>
            )}
          </button>
        </div>
      </form>
    </>
  )
}
