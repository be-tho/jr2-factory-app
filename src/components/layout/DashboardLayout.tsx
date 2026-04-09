import type { PropsWithChildren } from 'react'
import { NavLink } from 'react-router-dom'
import { supabase } from '../../lib/supabase/client'

export function DashboardLayout({ children }: PropsWithChildren) {
  async function handleLogout() {
    await supabase.auth.signOut()
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
          <div>
            <p className="text-sm font-medium text-slate-500">JR2 Factory</p>
            <h1 className="text-lg font-semibold text-slate-900">Panel interno</h1>
          </div>

          <nav className="flex items-center gap-2">
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                `rounded-md px-3 py-2 text-sm transition ${
                  isActive
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`
              }
            >
              Dashboard
            </NavLink>
            <NavLink
              to="/productos"
              className={({ isActive }) =>
                `rounded-md px-3 py-2 text-sm transition ${
                  isActive
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`
              }
            >
              Productos
            </NavLink>
            <button
              type="button"
              className="rounded-md px-3 py-2 text-sm text-slate-600 transition hover:bg-red-50 hover:text-red-700"
              onClick={handleLogout}
            >
              Cerrar sesion
            </button>
          </nav>
        </div>
      </header>
      <section className="mx-auto w-full max-w-6xl px-6 py-8">{children}</section>
    </main>
  )
}
