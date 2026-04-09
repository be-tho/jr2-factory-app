import { PageHeader } from '../../../components/ui/PageHeader'
import { useSession } from '../../../hooks/useSession'

export function CuentaPage() {
  const { session } = useSession()
  const user = session?.user

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cuenta"
        description="Datos de tu sesión en JR2 Factory."
      />

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <header className="border-b border-slate-200 px-5 py-3">
          <h3 className="font-medium text-slate-800">Usuario registrado</h3>
        </header>
        <dl className="grid gap-4 px-5 py-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Correo</dt>
            <dd className="mt-1 text-sm text-slate-900">{user?.email ?? '—'}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">ID</dt>
            <dd className="mt-1 break-all font-mono text-xs text-slate-700">{user?.id ?? '—'}</dd>
          </div>
          {user?.created_at && (
            <div className="sm:col-span-2">
              <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Alta en la aplicación
              </dt>
              <dd className="mt-1 text-sm text-slate-900">
                {new Date(user.created_at).toLocaleString()}
              </dd>
            </div>
          )}
        </dl>
      </section>
    </div>
  )
}
