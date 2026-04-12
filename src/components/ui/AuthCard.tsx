import type { PropsWithChildren, ReactNode } from 'react'

type AuthCardProps = PropsWithChildren<{
  title: string
  subtitle: string
  icon?: ReactNode
}>

export function AuthCard({ title, subtitle, icon, children }: AuthCardProps) {
  return (
    <section className="grid min-h-screen place-items-center bg-linear-to-b from-brand-canvas via-brand-surface to-brand-blush/25 px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-brand-border bg-brand-surface p-8 shadow-sm shadow-brand-ink/5 ring-1 ring-brand-border-subtle">
        <div className="mb-6 border-b border-brand-border-subtle pb-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-primary-hover">JR2 Factory</p>
          <div className="mt-2 flex items-start gap-3">
            {icon ? (
              <span
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-brand-border bg-brand-blush/25 text-brand-primary-hover"
                aria-hidden
              >
                {icon}
              </span>
            ) : null}
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl font-semibold tracking-tight text-brand-ink">{title}</h1>
              <p className="mt-1 text-sm text-brand-ink-muted">{subtitle}</p>
            </div>
          </div>
        </div>
        {children}
      </div>
    </section>
  )
}
