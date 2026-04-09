type PageHeaderProps = {
  title: string
  description: string
}

export function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <div>
      <h2 className="text-3xl font-semibold tracking-tight text-brand-ink">{title}</h2>
      <p className="mt-1 max-w-2xl text-brand-ink-muted">{description}</p>
    </div>
  )
}
