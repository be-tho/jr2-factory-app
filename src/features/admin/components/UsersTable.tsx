import { useState } from 'react'
import { IconCheck, IconLoader2, IconPencil, IconUserOff, IconUserCheck, IconX } from '@tabler/icons-react'
import { useSession } from '../../../hooks/useSession'
import { useAdminUsersQuery, useUpdateUserRoleMutation, useSetUserActiveMutation } from '../hooks/useAdminUsers'
import type { Profile } from '../../../types/database'

const ROLES: { value: string; label: string }[] = [
  { value: 'admin', label: 'Admin' },
  { value: 'gerente', label: 'Gerente' },
  { value: 'ventas', label: 'Ventas' },
  { value: 'produccion', label: 'Producción' },
  { value: 'inventario', label: 'Inventario' },
  { value: 'costurero', label: 'Costurero' },
  { value: 'cortador', label: 'Cortador' },
]

const ROLE_COLORS: Record<string, string> = {
  admin: 'bg-purple-100 text-purple-700 ring-purple-200',
  gerente: 'bg-blue-100 text-blue-700 ring-blue-200',
  ventas: 'bg-green-100 text-green-700 ring-green-200',
  produccion: 'bg-orange-100 text-orange-700 ring-orange-200',
  inventario: 'bg-yellow-100 text-yellow-700 ring-yellow-200',
  costurero: 'bg-pink-100 text-pink-700 ring-pink-200',
  cortador: 'bg-teal-100 text-teal-700 ring-teal-200',
}

function RoleBadge({ role }: { role: string | null }) {
  if (!role) {
    return (
      <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset bg-gray-100 text-gray-500 ring-gray-200">
        Sin rol
      </span>
    )
  }
  const colors = ROLE_COLORS[role] ?? 'bg-gray-100 text-gray-700 ring-gray-200'
  const label = ROLES.find((r) => r.value === role)?.label ?? role
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${colors}`}>
      {label}
    </span>
  )
}

function StatusBadge({ active }: { active: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${
        active
          ? 'bg-emerald-50 text-emerald-700 ring-emerald-200'
          : 'bg-red-50 text-red-600 ring-red-200'
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${active ? 'bg-emerald-500' : 'bg-red-400'}`} />
      {active ? 'Activo' : 'Inactivo'}
    </span>
  )
}

function UserInitials({ name }: { name: string | null }) {
  const initials = name
    ?.trim()
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('') ?? '?'

  return (
    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-brand-border bg-brand-primary-ghost text-xs font-bold text-brand-primary">
      {initials}
    </div>
  )
}

function RoleEditor({
  user,
  onClose,
}: {
  user: Profile
  onClose: () => void
}) {
  const [selected, setSelected] = useState(user.role ?? '')
  const { mutate, isPending } = useUpdateUserRoleMutation()

  function handleSave() {
    mutate(
      { userId: user.id, role: selected || null },
      { onSuccess: onClose },
    )
  }

  return (
    <div className="flex items-center gap-2">
      <select
        className="rounded-md border border-brand-border bg-white px-2 py-1 text-sm text-brand-ink focus:outline-none focus:ring-2 focus:ring-brand-primary"
        value={selected}
        onChange={(e) => setSelected(e.target.value)}
        disabled={isPending}
        autoFocus
      >
        <option value="">Sin rol</option>
        {ROLES.map((r) => (
          <option key={r.value} value={r.value}>
            {r.label}
          </option>
        ))}
      </select>
      <button
        type="button"
        onClick={handleSave}
        disabled={isPending}
        className="flex items-center justify-center rounded-md bg-brand-primary p-1.5 text-brand-on-primary transition hover:bg-brand-primary-hover disabled:opacity-60"
        aria-label="Guardar rol"
      >
        {isPending ? (
          <IconLoader2 size={14} stroke={1.5} className="animate-spin" />
        ) : (
          <IconCheck size={14} stroke={2} />
        )}
      </button>
      <button
        type="button"
        onClick={onClose}
        disabled={isPending}
        className="flex items-center justify-center rounded-md border border-brand-border p-1.5 text-brand-ink-muted transition hover:bg-brand-primary-ghost disabled:opacity-60"
        aria-label="Cancelar"
      >
        <IconX size={14} stroke={1.5} />
      </button>
    </div>
  )
}

function UserRow({ user, currentUserId }: { user: Profile; currentUserId: string }) {
  const [editingRole, setEditingRole] = useState(false)
  const { mutate: setActive, isPending: togglingActive } = useSetUserActiveMutation()
  const isSelf = user.id === currentUserId

  const displayName = user.full_name?.trim() || '(sin nombre)'
  const registeredDate = new Date(user.created_at).toLocaleDateString('es-AR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })

  function handleToggleActive() {
    setActive({ userId: user.id, is_active: !user.is_active })
  }

  return (
    <tr className="border-b border-brand-border transition hover:bg-brand-primary-ghost/40">
      <td className="px-4 py-3">
        <div className="flex items-center gap-2.5">
          <UserInitials name={user.full_name} />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-brand-ink">{displayName}</p>
            {isSelf && (
              <p className="text-xs text-brand-ink-faint">Tú</p>
            )}
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        {editingRole ? (
          <RoleEditor user={user} onClose={() => setEditingRole(false)} />
        ) : (
          <RoleBadge role={user.role} />
        )}
      </td>
      <td className="px-4 py-3">
        <StatusBadge active={user.is_active} />
      </td>
      <td className="px-4 py-3 text-sm text-brand-ink-muted">{registeredDate}</td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          {!editingRole && (
            <button
              type="button"
              onClick={() => setEditingRole(true)}
              className="flex items-center gap-1.5 rounded-md border border-brand-border px-2.5 py-1.5 text-xs font-medium text-brand-ink-muted transition hover:border-brand-primary hover:text-brand-primary"
              title="Editar rol"
            >
              <IconPencil size={13} stroke={1.5} />
              Editar rol
            </button>
          )}
          {!isSelf && (
            <button
              type="button"
              onClick={handleToggleActive}
              disabled={togglingActive}
              className={`flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs font-medium transition disabled:opacity-60 ${
                user.is_active
                  ? 'border-red-200 text-red-600 hover:bg-red-50'
                  : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'
              }`}
              title={user.is_active ? 'Desactivar usuario' : 'Activar usuario'}
            >
              {togglingActive ? (
                <IconLoader2 size={13} stroke={1.5} className="animate-spin" />
              ) : user.is_active ? (
                <IconUserOff size={13} stroke={1.5} />
              ) : (
                <IconUserCheck size={13} stroke={1.5} />
              )}
              {user.is_active ? 'Desactivar' : 'Activar'}
            </button>
          )}
        </div>
      </td>
    </tr>
  )
}

export function UsersTable() {
  const { data: users = [], isPending, isError } = useAdminUsersQuery()
  const { session } = useSession()
  const currentUserId = session?.user.id ?? ''

  if (isPending) {
    return (
      <div className="flex min-h-[200px] items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-black/4">
        <div className="flex items-center gap-2 text-sm text-brand-ink-muted">
          <IconLoader2 size={18} stroke={1.5} className="animate-spin" />
          Cargando usuarios…
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex min-h-[200px] items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-black/4">
        <p className="text-sm text-red-600">No se pudieron cargar los usuarios. Verificá los permisos en Supabase.</p>
      </div>
    )
  }

  if (users.length === 0) {
    return (
      <div className="flex min-h-[200px] items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-black/4">
        <p className="text-sm text-brand-ink-muted">No hay usuarios registrados.</p>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-black/4">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[600px] text-left">
          <thead>
            <tr className="border-b border-brand-border bg-brand-primary-ghost/60">
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-brand-ink-muted">
                Usuario
              </th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-brand-ink-muted">
                Rol
              </th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-brand-ink-muted">
                Estado
              </th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-brand-ink-muted">
                Registrado
              </th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-brand-ink-muted">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <UserRow key={user.id} user={user} currentUserId={currentUserId} />
            ))}
          </tbody>
        </table>
      </div>
      <div className="border-t border-brand-border px-4 py-2.5">
        <p className="text-xs text-brand-ink-faint">
          {users.length} {users.length === 1 ? 'usuario' : 'usuarios'} en total
        </p>
      </div>
    </div>
  )
}
