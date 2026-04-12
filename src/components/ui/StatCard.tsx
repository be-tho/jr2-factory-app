import type { ReactNode } from 'react'

type StatCardProps = {
  label: string
  value: string
  icon?: ReactNode
}

export function StatCard({ label, value, icon }: StatCardProps) {
  return (
    <article className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-black/4">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm text-brand-ink-muted">{label}</p>
        {icon ? <span className="shrink-0 text-brand-ink-faint">{icon}</span> : null}
      </div>
      <p className="mt-2 text-2xl font-semibold tabular-nums text-brand-ink">{value}</p>
    </article>
  )
}
