type PageHeaderProps = {
  title: string
  description: string
}

export function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <div>
      <h2 className="text-3xl font-semibold text-slate-900">{title}</h2>
      <p className="mt-1 text-slate-600">{description}</p>
    </div>
  )
}
