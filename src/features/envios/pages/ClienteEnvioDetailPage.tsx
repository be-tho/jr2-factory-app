import {
  IconArrowLeft,
  IconBrandWhatsapp,
  IconCheck,
  IconClock,
  IconCopy,
  IconEdit,
  IconExternalLink,
  IconMapPin,
  IconNotes,
  IconPhone,
  IconTruck,
  IconX,
} from '@tabler/icons-react'
import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { isGoogleMapsEmbedUrl } from '../../../lib/maps-embed'
import {
  useClienteEnvioQuery,
  useDeleteClienteEnvioMutation,
  useToggleClienteEnvioActivoMutation,
} from '../hooks/useClientesEnvio'
import { buildWhatsappMapsMessage, whatsappShareUrl } from '../lib/whatsapp-maps'

function InfoBlock({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wider text-brand-ink-faint">{label}</p>
      <p className="mt-0.5 text-sm font-medium text-brand-ink whitespace-pre-wrap">{value}</p>
    </div>
  )
}

export function ClienteEnvioDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: row, isPending: loading, isError } = useClienteEnvioQuery(id)
  const toggleMutation = useToggleClienteEnvioActivoMutation()
  const deleteMutation = useDeleteClienteEnvioMutation()
  const [confirmDelete, setConfirmDelete] = useState(false)

  async function copyMapsLink() {
    if (!row) return
    try {
      await navigator.clipboard.writeText(row.maps_url)
      toast.success('Link de Maps copiado')
    } catch {
      toast.error('No se pudo copiar. Copiá manualmente desde el campo de abajo.')
    }
  }

  async function copyWhatsappMessage() {
    if (!row) return
    try {
      await navigator.clipboard.writeText(buildWhatsappMapsMessage(row))
      toast.success('Mensaje copiado (pegalo en WhatsApp)')
    } catch {
      toast.error('No se pudo copiar el mensaje.')
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-56 animate-pulse rounded-lg bg-brand-border" />
        <div className="h-48 animate-pulse rounded-xl bg-brand-border" />
      </div>
    )
  }

  if (isError || !row) {
    return (
      <div className="rounded-xl bg-red-50 px-5 py-4 text-sm ring-1 ring-red-200">
        <p className="font-semibold text-red-800">No se pudo cargar el registro</p>
        <p className="mt-1 text-red-600">Verificá que exista o volvé al listado.</p>
      </div>
    )
  }

  const embedOk = Boolean(row.maps_embed_url && isGoogleMapsEmbedUrl(row.maps_embed_url))
  const waUrl = whatsappShareUrl(buildWhatsappMapsMessage(row))

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-brand-primary-ghost text-brand-primary">
            <IconTruck size={28} stroke={1.5} aria-hidden />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-[#3d3b4f]">{row.nombre_empresa}</h1>
              {row.catalogo_origen === 'ctc' && (
                <span className="rounded-full bg-brand-primary-ghost px-2.5 py-0.5 text-[11px] font-semibold text-brand-primary ring-1 ring-brand-primary/25">
                  Catálogo CTC
                </span>
              )}
              <span
                className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1 ${
                  row.activo
                    ? 'bg-green-50 text-green-700 ring-green-200'
                    : 'bg-gray-100 text-gray-500 ring-gray-200'
                }`}
              >
                {row.activo ? 'Activo' : 'Inactivo'}
              </span>
            </div>
            <p className="mt-1 text-sm text-brand-ink-muted">
              {[row.localidad, row.provincia].filter(Boolean).join(' · ')}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            to="/envios"
            className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium text-[#6e6b7b] transition hover:bg-white hover:text-[#3d3b4f] hover:shadow-sm"
          >
            <IconArrowLeft size={16} stroke={1.5} aria-hidden />
            Volver
          </Link>
          <button
            type="button"
            onClick={() => toggleMutation.mutate({ id: row.id, activo: !row.activo })}
            disabled={toggleMutation.isPending}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition disabled:opacity-50 ${
              row.activo
                ? 'border border-brand-border bg-white text-brand-ink-muted hover:border-red-200 hover:bg-red-50 hover:text-red-600'
                : 'border border-green-200 bg-green-50 text-green-700 hover:bg-green-100'
            }`}
          >
            {row.activo ? (
              <>
                <IconX size={14} stroke={2} aria-hidden /> Desactivar
              </>
            ) : (
              <>
                <IconCheck size={14} stroke={2.5} aria-hidden /> Activar
              </>
            )}
          </button>
          <Link
            to={`/envios/${row.id}/editar`}
            className="inline-flex items-center gap-1.5 rounded-lg bg-brand-primary px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-brand-primary-hover"
          >
            <IconEdit size={15} stroke={1.5} aria-hidden />
            Editar
          </Link>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <a
          href={row.maps_url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-lg border border-brand-border bg-white px-3 py-2 text-sm font-medium text-brand-ink transition hover:bg-brand-canvas"
        >
          <IconExternalLink size={16} stroke={1.5} aria-hidden />
          Abrir en Google Maps
        </a>
        <button
          type="button"
          onClick={() => void copyMapsLink()}
          className="inline-flex items-center gap-1.5 rounded-lg border border-brand-border bg-white px-3 py-2 text-sm font-medium text-brand-ink transition hover:bg-brand-canvas"
        >
          <IconCopy size={16} stroke={1.5} aria-hidden />
          Copiar link
        </button>
        <button
          type="button"
          onClick={() => void copyWhatsappMessage()}
          className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-800 transition hover:bg-emerald-100"
        >
          <IconCopy size={16} stroke={1.5} aria-hidden />
          Copiar mensaje WhatsApp
        </button>
        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-lg bg-[#25D366] px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#20bd5a]"
        >
          <IconBrandWhatsapp size={18} stroke={1.5} aria-hidden />
          Abrir WhatsApp con mensaje
        </a>
      </div>

      {(row.telefono || row.horario_atencion || row.observaciones) && (
        <div className="overflow-hidden rounded-xl bg-white p-5 shadow-sm ring-1 ring-black/4">
          <h2 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brand-ink-faint">
            <IconPhone size={13} stroke={1.5} aria-hidden />
            Contacto y ubicación en campus
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <InfoBlock label="Teléfono" value={row.telefono ?? '—'} />
            <div>
              <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-brand-ink-faint">
                <IconClock size={12} stroke={1.5} aria-hidden />
                Horario de atención
              </p>
              <p className="mt-0.5 text-sm font-medium text-brand-ink whitespace-pre-wrap">
                {row.horario_atencion ?? '—'}
              </p>
            </div>
            <div className="sm:col-span-2 lg:col-span-1">
              <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-brand-ink-faint">
                <IconNotes size={12} stroke={1.5} aria-hidden />
                Observaciones (CTC / planta)
              </p>
              <p className="mt-0.5 text-sm font-medium text-brand-ink whitespace-pre-wrap">
                {row.observaciones ?? '—'}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-4 overflow-hidden rounded-xl bg-white p-5 shadow-sm ring-1 ring-black/4">
          <h2 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brand-ink-faint">
            <IconMapPin size={13} stroke={1.5} aria-hidden />
            Ubicación
          </h2>
          <InfoBlock label="Dirección" value={row.direccion} />
          {(row.localidad || row.provincia) && (
            <InfoBlock
              label="Localidad / provincia"
              value={[row.localidad, row.provincia].filter(Boolean).join(', ')}
            />
          )}
        </div>

        <div className="space-y-4 overflow-hidden rounded-xl bg-white p-5 shadow-sm ring-1 ring-black/4">
          <h2 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brand-ink-faint">
            <IconTruck size={13} stroke={1.5} aria-hidden />
            Envíos
          </h2>
          <InfoBlock label="Cobertura / zonas" value={row.zonas_envio} />
        </div>
      </div>

      {row.notas && (
        <div className="overflow-hidden rounded-xl bg-white p-5 shadow-sm ring-1 ring-black/4">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-brand-ink-faint">Notas internas</h2>
          <p className="mt-2 text-sm leading-relaxed text-brand-ink-muted">{row.notas}</p>
        </div>
      )}

      {embedOk && row.maps_embed_url ? (
        <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-black/4">
          <header className="border-b border-[#f0eef5] bg-[#f8f7fa] px-5 py-3">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-[#b9b6c3]">Vista previa (embed)</h2>
          </header>
          <div className="aspect-video w-full max-h-[420px] bg-brand-canvas">
            <iframe
              title={`Mapa ${row.nombre_empresa}`}
              src={row.maps_embed_url}
              className="h-full min-h-[240px] w-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          </div>
        </div>
      ) : row.maps_embed_url ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <p className="font-medium">Embed no válido o no es de Google Maps</p>
          <p className="mt-1 text-amber-800/90">
            Revisá el campo en editar: tiene que ser la URL{' '}
            <code className="rounded bg-white/80 px-1">https://www.google.com/maps/embed?…</code>
          </p>
        </div>
      ) : null}

      <div className="overflow-hidden rounded-xl bg-white p-5 shadow-sm ring-1 ring-black/4">
        <p className="text-xs font-semibold uppercase tracking-wider text-brand-ink-faint">Link guardado (Maps)</p>
        <p className="mt-2 break-all font-mono text-xs text-brand-ink-muted">{row.maps_url}</p>
      </div>

      <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-red-100">
        <header className="border-b border-red-100 bg-red-50 px-5 py-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-red-400">Zona peligrosa</h2>
        </header>
        <div className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-brand-ink">Eliminar dirección</p>
            <p className="mt-0.5 text-xs text-brand-ink-faint">
              {row.catalogo_origen === 'ctc'
                ? 'Permanente: la empresa desaparece también del directorio CTC en Envíos.'
                : 'Permanente. No afecta datos históricos fuera de esta tabla.'}
            </p>
          </div>
          {confirmDelete ? (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-medium text-red-600">¿Confirmar?</span>
              <button
                type="button"
                onClick={() => {
                  deleteMutation.mutate(row.id, {
                    onSuccess: () => navigate('/envios', { replace: true }),
                  })
                }}
                disabled={deleteMutation.isPending}
                className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-red-700 disabled:opacity-60"
              >
                {deleteMutation.isPending ? 'Eliminando…' : 'Sí, eliminar'}
              </button>
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                className="rounded-lg border border-brand-border px-3 py-1.5 text-xs font-medium text-brand-ink-muted transition hover:bg-brand-canvas"
              >
                Cancelar
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              className="shrink-0 rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
            >
              Eliminar
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-4 text-xs text-brand-ink-faint">
        <span>
          Creado:{' '}
          {new Date(row.created_at).toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' })}
        </span>
        <span>
          Actualizado:{' '}
          {new Date(row.updated_at).toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' })}
        </span>
      </div>
    </div>
  )
}
