import type { ReactNode } from 'react'

type PageHeaderProps = {
  title: string
  description: string
  icon?: ReactNode
}

export function PageHeader({ title, description, icon }: PageHeaderProps) {
  if (!icon) {
    return (
      <div>
        <h2 className="text-3xl font-semibold tracking-tight text-brand-ink">{title}</h2>
        <p className="mt-1 max-w-2xl text-brand-ink-muted">{description}</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-4">
      <div
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-brand-border bg-brand-blush/30 text-brand-primary-hover"
        aria-hidden
      >
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <h2 className="text-3xl font-semibold tracking-tight text-brand-ink">{title}</h2>
        <p className="mt-1 max-w-2xl text-brand-ink-muted">{description}</p>
      </div>
    </div>
  )
}
