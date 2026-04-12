import { IconAt, IconCalendar, IconHash, IconUser } from '@tabler/icons-react'
import { ic } from '../../../lib/tabler'
import { useSession } from '../../../hooks/useSession'

export function CuentaPage() {
  const { session } = useSession()
  const user = session?.user

  return (
    <div className="space-y-6">
      {/* Page title */}
      <div>
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-primary-ghost text-brand-primary">
            <IconUser {...ic.headerSm} aria-hidden />
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-[#3d3b4f]">Cuenta</h1>
        </div>
        <p className="mt-1.5 text-sm text-[#6e6b7b]">Datos de tu sesión en JR2 Factory.</p>
      </div>

      {/* User info islands */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="flex items-start gap-3 rounded-xl bg-white p-4 shadow-sm ring-1 ring-black/4">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-primary-ghost text-brand-primary">
            <IconAt size={16} stroke={1.5} aria-hidden />
          </span>
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[#b9b6c3]">Correo</p>
            <p className="mt-0.5 truncate text-sm font-medium text-[#3d3b4f]">{user?.email ?? '—'}</p>
          </div>
        </div>

        <div className="flex items-start gap-3 rounded-xl bg-white p-4 shadow-sm ring-1 ring-black/4 sm:col-span-2 lg:col-span-1">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#f8f7fa] text-[#b9b6c3]">
            <IconHash size={16} stroke={1.5} aria-hidden />
          </span>
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[#b9b6c3]">ID de usuario</p>
            <p className="mt-0.5 break-all font-mono text-xs text-[#6e6b7b]">{user?.id ?? '—'}</p>
          </div>
        </div>

        {user?.created_at ? (
          <div className="flex items-start gap-3 rounded-xl bg-white p-4 shadow-sm ring-1 ring-black/4">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#f8f7fa] text-[#b9b6c3]">
              <IconCalendar size={16} stroke={1.5} aria-hidden />
            </span>
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[#b9b6c3]">Alta en la app</p>
              <p className="mt-0.5 text-sm font-medium text-[#3d3b4f]">
                {new Date(user.created_at).toLocaleString('es-AR', {
                  dateStyle: 'medium',
                  timeStyle: 'short',
                })}
              </p>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}
