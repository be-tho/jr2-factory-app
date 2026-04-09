import type { PropsWithChildren } from 'react'

type AuthCardProps = PropsWithChildren<{
  title: string
  subtitle: string
}>

export function AuthCard({ title, subtitle, children }: AuthCardProps) {
  return (
    <section className="grid min-h-screen place-items-center bg-linear-to-b from-slate-100 to-white px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-6">
          <p className="text-sm font-medium text-slate-500">JR2 Factory</p>
          <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
          <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
        </div>
        {children}
      </div>
    </section>
  )
}
