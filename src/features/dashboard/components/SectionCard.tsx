import type { ReactNode } from 'react'

export function SectionCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-black/4">
      <header className="border-b border-[#f0eef5] bg-[#f8f7fa] px-5 py-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-[#b9b6c3]">{title}</h2>
      </header>
      {children}
    </div>
  )
}
