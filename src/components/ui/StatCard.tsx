type StatCardProps = {
  label: string
  value: string
}

export function StatCard({ label, value }: StatCardProps) {
  return (
    <article className="rounded-xl border border-brand-border bg-brand-surface p-5 shadow-sm shadow-brand-ink/5 ring-1 ring-brand-border-subtle">
      <p className="text-sm text-brand-ink-muted">{label}</p>
      <p className="mt-2 text-2xl font-semibold tabular-nums text-brand-ink">{value}</p>
    </article>
  )
}
