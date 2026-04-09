import type { PropsWithChildren } from 'react'

type AuthCardProps = PropsWithChildren<{
  title: string
  subtitle: string
}>

export function AuthCard({ title, subtitle, children }: AuthCardProps) {
  return (
    <section className="grid min-h-screen place-items-center bg-linear-to-b from-brand-canvas via-brand-surface to-brand-blush/25 px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-brand-border bg-brand-surface p-8 shadow-sm shadow-brand-ink/5 ring-1 ring-brand-border-subtle">
        <div className="mb-6 border-b border-brand-border-subtle pb-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-primary-hover">JR2 Factory</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-brand-ink">{title}</h1>
          <p className="mt-1 text-sm text-brand-ink-muted">{subtitle}</p>
        </div>
        {children}
      </div>
    </section>
  )
}
