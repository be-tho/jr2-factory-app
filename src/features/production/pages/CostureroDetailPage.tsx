import {
  IconArrowLeft,
  IconCheck,
  IconEdit,
  IconId,
  IconMail,
  IconMapPin,
  IconPhone,
  IconUser,
  IconWallet,
  IconX,
} from '@tabler/icons-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  useCostureroQuery,
  useDeleteCostureroMutation,
  useToggleCostureroActivoMutation,
} from '../hooks/useCostureros'
import { useState } from 'react'

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | null | undefined }) {
  if (!value) return null
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 shrink-0 text-brand-ink-faint">{icon}</span>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-brand-ink-faint">{label}</p>
        <p className="mt-0.5 text-sm font-medium text-brand-ink">{value}</p>
      </div>
    </div>
  )
}

export function CostureroDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: costurero, isPending: loading, isError } = useCostureroQuery(id)
  const toggleMutation = useToggleCostureroActivoMutation()
  const deleteMutation = useDeleteCostureroMutation()
  const [confirmDelete, setConfirmDelete] = useState(false)

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-56 animate-pulse rounded-lg bg-brand-border" />
        <div className="grid gap-4 sm:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-xl bg-brand-border" />
          ))}
        </div>
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

  const initials = costurero.nombre_completo
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase() ?? '')
    .join('')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-brand-primary-ghost text-xl font-bold text-brand-primary">
            {initials}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-[#3d3b4f]">
                {costurero.nombre_completo}
              </h1>
              <span
                className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1 ${
                  costurero.activo
                    ? 'bg-green-50 text-green-700 ring-green-200'
                    : 'bg-gray-100 text-gray-500 ring-gray-200'
                }`}
              >
                {costurero.activo ? 'Activo' : 'Inactivo'}
              </span>
            </div>
            <p className="mt-0.5 text-sm text-brand-ink-faint">
              {costurero.tipo_documento} {costurero.numero_documento}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            to="/produccion/costureros"
            className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium text-[#6e6b7b] transition hover:bg-white hover:text-[#3d3b4f] hover:shadow-sm"
          >
            <IconArrowLeft size={16} stroke={1.5} aria-hidden />
            Volver
          </Link>
          <button
            type="button"
            onClick={() => toggleMutation.mutate({ id: costurero.id, activo: !costurero.activo })}
            disabled={toggleMutation.isPending}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition disabled:opacity-50 ${
              costurero.activo
                ? 'border border-brand-border bg-white text-brand-ink-muted hover:text-red-600 hover:border-red-200 hover:bg-red-50'
                : 'border border-green-200 bg-green-50 text-green-700 hover:bg-green-100'
            }`}
          >
            {costurero.activo ? (
              <><IconX size={14} stroke={2} aria-hidden /> Desactivar</>
            ) : (
              <><IconCheck size={14} stroke={2.5} aria-hidden /> Activar</>
            )}
          </button>
          <Link
            to={`/produccion/costureros/${costurero.id}/editar`}
            className="inline-flex items-center gap-1.5 rounded-lg bg-brand-primary px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-brand-primary-hover"
          >
            <IconEdit size={15} stroke={1.5} aria-hidden />
            Editar
          </Link>
        </div>
      </div>

      {/* Info cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Datos personales */}
        <div className="space-y-4 overflow-hidden rounded-xl bg-white p-5 shadow-sm ring-1 ring-black/4">
          <h2 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brand-ink-faint">
            <IconUser size={13} stroke={1.5} aria-hidden />
            Datos personales
          </h2>
          <div className="space-y-3">
            <InfoRow
              icon={<IconId size={15} stroke={1.5} />}
              label="Documento"
              value={`${costurero.tipo_documento} ${costurero.numero_documento}`}
            />
          </div>
        </div>

        {/* Contacto */}
        <div className="space-y-4 overflow-hidden rounded-xl bg-white p-5 shadow-sm ring-1 ring-black/4">
          <h2 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brand-ink-faint">
            <IconPhone size={13} stroke={1.5} aria-hidden />
            Contacto
          </h2>
          <div className="space-y-3">
            <InfoRow icon={<IconPhone size={15} stroke={1.5} />} label="Teléfono" value={costurero.telefono} />
            <InfoRow icon={<IconMail size={15} stroke={1.5} />} label="Email" value={costurero.email} />
            <InfoRow icon={<IconMapPin size={15} stroke={1.5} />} label="Dirección" value={costurero.direccion} />
            {!costurero.telefono && !costurero.email && !costurero.direccion && (
              <p className="text-sm text-brand-ink-faint">Sin datos de contacto cargados.</p>
            )}
          </div>
        </div>

        {/* Datos bancarios */}
        <div className="space-y-4 overflow-hidden rounded-xl bg-white p-5 shadow-sm ring-1 ring-black/4">
          <h2 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brand-ink-faint">
            <IconWallet size={13} stroke={1.5} aria-hidden />
            Datos bancarios
          </h2>
          {costurero.cbu_alias ? (
            <InfoRow icon={<IconWallet size={15} stroke={1.5} />} label="CBU / Alias" value={costurero.cbu_alias} />
          ) : (
            <p className="text-sm text-brand-ink-faint">Sin datos bancarios. Se usarán cuando se active el módulo de pagos.</p>
          )}
        </div>

        {/* Notas */}
        {costurero.notas && (
          <div className="space-y-3 overflow-hidden rounded-xl bg-white p-5 shadow-sm ring-1 ring-black/4">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-brand-ink-faint">Notas internas</h2>
            <p className="text-sm leading-relaxed text-brand-ink-muted">{costurero.notas}</p>
          </div>
        )}
      </div>

      {/* Sección futura: cortes */}
      <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-black/4">
        <header className="border-b border-[#f0eef5] bg-[#f8f7fa] px-5 py-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-[#b9b6c3]">
            Historial de cortes
          </h2>
        </header>
        <div className="px-5 py-8 text-center">
          <p className="text-sm text-brand-ink-faint">
            El historial de cortes y pagos estará disponible próximamente.
          </p>
        </div>
      </div>

      {/* Zona peligrosa */}
      <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-red-100">
        <header className="border-b border-red-100 bg-red-50 px-5 py-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-red-400">Zona peligrosa</h2>
        </header>
        <div className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-brand-ink">Eliminar costurero</p>
            <p className="mt-0.5 text-xs text-brand-ink-faint">Esta acción es permanente y no se puede deshacer.</p>
          </div>
          {confirmDelete ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-red-600 font-medium">¿Confirmar eliminación?</span>
              <button
                type="button"
                onClick={() => {
                  deleteMutation.mutate(costurero.id, {
                    onSuccess: () => navigate('/produccion/costureros', { replace: true }),
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
              Eliminar costurero
            </button>
          )}
        </div>
      </div>

      {/* Meta */}
      <div className="flex flex-wrap gap-4 text-xs text-brand-ink-faint">
        <span>Creado: {new Date(costurero.created_at).toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
        <span>Actualizado: {new Date(costurero.updated_at).toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
      </div>
    </div>
  )
}
