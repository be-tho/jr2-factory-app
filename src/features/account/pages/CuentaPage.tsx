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

      <section className="overflow-hidden rounded-xl border border-brand-border bg-brand-surface shadow-sm shadow-brand-ink/5 ring-1 ring-brand-border-subtle">
        <header className="border-b border-brand-border bg-brand-blush/20 px-5 py-3">
          <h3 className="font-medium text-brand-ink">Usuario registrado</h3>
        </header>
        <dl className="grid gap-4 px-5 py-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-brand-ink-muted">Correo</dt>
            <dd className="mt-1 text-sm text-brand-ink">{user?.email ?? '—'}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-brand-ink-muted">ID</dt>
            <dd className="mt-1 break-all font-mono text-xs text-brand-ink-muted">{user?.id ?? '—'}</dd>
          </div>
          {user?.created_at && (
            <div className="sm:col-span-2">
              <dt className="text-xs font-medium uppercase tracking-wide text-brand-ink-muted">
                Alta en la aplicación
              </dt>
              <dd className="mt-1 text-sm text-brand-ink">
                {new Date(user.created_at).toLocaleString()}
              </dd>
            </div>
          )}
        </dl>
      </section>
    </div>
  )
}
