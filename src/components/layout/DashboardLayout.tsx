import { PropsWithChildren } from 'react'
import { Link } from 'react-router-dom'

export function DashboardLayout({ children }: PropsWithChildren) {
  return (
    <main className="min-h-screen p-6">
      <header className="mb-6 flex gap-4">
        <Link to="/dashboard" className="underline">
          Dashboard
        </Link>
        <Link to="/productos" className="underline">
          Productos
        </Link>
      </header>
      {children}
    </main>
  )
}
