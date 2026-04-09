import { useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { supabase } from '../../lib/supabase/client'

type NavBlockProps = {
  onNavigate?: () => void
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      aria-hidden
      className={`ml-auto h-4 w-4 shrink-0 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`}
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke="currentColor"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
    </svg>
  )
}

function SidebarNav({ onNavigate }: NavBlockProps) {
  const location = useLocation()
  const [produccionOpen, setProduccionOpen] = useState(() =>
    location.pathname.startsWith('/produccion'),
  )
  const [inventarioOpen, setInventarioOpen] = useState(() =>
    location.pathname.startsWith('/inventario'),
  )

  const itemClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center rounded-md px-3 py-2 text-sm transition ${
      isActive
        ? 'bg-slate-900 text-white'
        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
    }`

  const subItemClass = ({ isActive }: { isActive: boolean }) =>
    `ml-2 flex items-center rounded-md border-l-2 py-2 pl-3 pr-2 text-sm transition ${
      isActive
        ? 'border-slate-900 bg-slate-100 font-medium text-slate-900'
        : 'border-transparent text-slate-600 hover:border-slate-200 hover:bg-slate-50 hover:text-slate-900'
    }`

  return (
    <nav className="flex flex-col gap-1">
      <NavLink to="/dashboard" end className={itemClass} onClick={onNavigate}>
        Dashboard
      </NavLink>

      <div>
        <button
          type="button"
          className={`flex w-full items-center rounded-md px-3 py-2 text-left text-sm font-medium transition ${
            location.pathname.startsWith('/produccion')
              ? 'bg-slate-100 text-slate-900'
              : 'text-slate-700 hover:bg-slate-50'
          }`}
          aria-expanded={produccionOpen}
          onClick={() => setProduccionOpen((o) => !o)}
        >
          Producción
          <ChevronIcon open={produccionOpen} />
        </button>
        {produccionOpen && (
          <div className="mt-1 flex flex-col gap-0.5">
            <NavLink to="/produccion/cortes" className={subItemClass} onClick={onNavigate}>
              Cortes
            </NavLink>
            <NavLink to="/produccion/costureros" className={subItemClass} onClick={onNavigate}>
              Costureros
            </NavLink>
          </div>
        )}
      </div>

      <div>
        <button
          type="button"
          className={`flex w-full items-center rounded-md px-3 py-2 text-left text-sm font-medium transition ${
            location.pathname.startsWith('/inventario')
              ? 'bg-slate-100 text-slate-900'
              : 'text-slate-700 hover:bg-slate-50'
          }`}
          aria-expanded={inventarioOpen}
          onClick={() => setInventarioOpen((o) => !o)}
        >
          Inventario
          <ChevronIcon open={inventarioOpen} />
        </button>
        {inventarioOpen && (
          <div className="mt-1 flex flex-col gap-0.5">
            <NavLink to="/inventario/articulos" className={subItemClass} onClick={onNavigate}>
              Artículos
            </NavLink>
            <NavLink to="/inventario/categorias" className={subItemClass} onClick={onNavigate}>
              Categorías
            </NavLink>
            <NavLink to="/inventario/temporadas" className={subItemClass} onClick={onNavigate}>
              Temporadas
            </NavLink>
          </div>
        )}
      </div>

      <NavLink to="/cuenta" className={itemClass} onClick={onNavigate}>
        Cuenta
      </NavLink>
    </nav>
  )
}

export function DashboardLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const location = useLocation()

  async function handleLogout() {
    await supabase.auth.signOut()
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl md:max-w-none">
        <aside className="hidden w-56 shrink-0 flex-col border-r border-slate-200 bg-white sm:flex sm:sticky sm:top-0 sm:h-screen">
          <div className="border-b border-slate-200 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">JR2 Factory</p>
            <p className="mt-0.5 text-base font-semibold text-slate-900">Panel interno</p>
          </div>
          <div className="flex flex-1 flex-col overflow-y-auto p-3">
            <SidebarNav key={location.pathname} />
          </div>
          <div className="border-t border-slate-200 p-3">
            <button
              type="button"
              className="w-full rounded-md px-3 py-2 text-left text-sm text-slate-600 transition hover:bg-red-50 hover:text-red-700"
              onClick={handleLogout}
            >
              Cerrar sesión
            </button>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header
            className={`sticky top-0 z-40 border-b border-slate-200 bg-white sm:hidden ${mobileMenuOpen ? 'shadow-sm' : ''}`}
          >
            <div className="flex items-center justify-between gap-3 px-4 py-3">
              <div className="min-w-0">
                <p className="truncate text-xs font-medium uppercase tracking-wide text-slate-500">
                  JR2 Factory
                </p>
                <p className="truncate text-sm font-semibold text-slate-900">Panel interno</p>
              </div>
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
                aria-expanded={mobileMenuOpen}
                aria-controls="mobile-dashboard-nav"
                onClick={() => setMobileMenuOpen((o) => !o)}
              >
                Menú
                <svg
                  aria-hidden
                  className={`h-4 w-4 text-slate-500 transition-transform ${mobileMenuOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                </svg>
              </button>
            </div>

            {mobileMenuOpen && (
              <div
                id="mobile-dashboard-nav"
                role="navigation"
                className="max-h-[calc(100vh-4.5rem)] overflow-y-auto border-t border-slate-100 bg-white px-4 py-4"
              >
                <SidebarNav
                  key={location.pathname}
                  onNavigate={() => setMobileMenuOpen(false)}
                />
                <button
                  type="button"
                  className="mt-4 w-full rounded-md border border-slate-200 px-3 py-2 text-left text-sm text-slate-600 transition hover:bg-red-50 hover:text-red-700"
                  onClick={handleLogout}
                >
                  Cerrar sesión
                </button>
              </div>
            )}
          </header>

          <main className="flex-1 px-4 py-6 sm:px-6 sm:py-8">
            <div className="mx-auto w-full max-w-6xl">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
