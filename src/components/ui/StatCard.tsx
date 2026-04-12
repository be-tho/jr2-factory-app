import type { ReactNode } from 'react'

type StatCardProps = {
  label: string
  value: string
  icon?: ReactNode
}

export function StatCard({ label, value, icon }: StatCardProps) {
  return (
    <article className="rounded-xl border border-brand-border bg-brand-surface p-5 shadow-sm shadow-brand-ink/5 ring-1 ring-brand-border-subtle">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm text-brand-ink-muted">{label}</p>
        {icon ? <span className="shrink-0 text-brand-ink-faint">{icon}</span> : null}
      </div>
      <p className="mt-2 text-2xl font-semibold tabular-nums text-brand-ink">{value}</p>
    </article>
  )
}
