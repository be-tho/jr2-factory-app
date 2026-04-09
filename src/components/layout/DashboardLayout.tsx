import { useEffect, useState, type ReactNode } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { NavLink, useLocation } from 'react-router-dom'
import { supabase } from '../../lib/supabase/client'
import { PageTransition } from './PageTransition'

const menuEase = [0.22, 1, 0.36, 1] as const

type NavBlockProps = {
  onNavigate?: () => void
}

function NavCollapsible({ open, children }: { open: boolean; children: ReactNode }) {
  const reduceMotion = useReducedMotion()

  if (reduceMotion) {
    return open ? <div className="overflow-hidden">{children}</div> : null
  }

  return (
    <AnimatePresence initial={false}>
      {open && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.22, ease: menuEase }}
          className="overflow-hidden"
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      aria-hidden
      className={`ml-auto h-4 w-4 shrink-0 text-brand-ink-faint transition-transform ${open ? 'rotate-180' : ''}`}
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
    `flex items-center rounded-md px-3 py-2 text-sm font-medium transition ${
      isActive
        ? 'bg-brand-primary text-brand-ink shadow-sm'
        : 'text-brand-ink-muted hover:bg-brand-blush/50 hover:text-brand-ink'
    }`

  const subItemClass = ({ isActive }: { isActive: boolean }) =>
    `ml-2 flex items-center rounded-md border-l-2 py-2 pl-3 pr-2 text-sm transition ${
      isActive
        ? 'border-brand-primary bg-brand-primary/35 font-medium text-brand-ink'
        : 'border-transparent text-brand-ink-muted hover:border-brand-border hover:bg-brand-canvas hover:text-brand-ink'
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
              ? 'bg-brand-blush/70 text-brand-ink'
              : 'text-brand-ink-muted hover:bg-brand-canvas'
          }`}
          aria-expanded={produccionOpen}
          onClick={() => setProduccionOpen((o) => !o)}
        >
          Producción
          <ChevronIcon open={produccionOpen} />
        </button>
        <NavCollapsible open={produccionOpen}>
          <div className="mt-1 flex flex-col gap-0.5">
            <NavLink to="/produccion/cortes" className={subItemClass} onClick={onNavigate}>
              Cortes
            </NavLink>
            <NavLink to="/produccion/costureros" className={subItemClass} onClick={onNavigate}>
              Costureros
            </NavLink>
          </div>
        </NavCollapsible>
      </div>

      <div>
        <button
          type="button"
          className={`flex w-full items-center rounded-md px-3 py-2 text-left text-sm font-medium transition ${
            location.pathname.startsWith('/inventario')
              ? 'bg-brand-blush/70 text-brand-ink'
              : 'text-brand-ink-muted hover:bg-brand-canvas'
          }`}
          aria-expanded={inventarioOpen}
          onClick={() => setInventarioOpen((o) => !o)}
        >
          Inventario
          <ChevronIcon open={inventarioOpen} />
        </button>
        <NavCollapsible open={inventarioOpen}>
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
        </NavCollapsible>
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
  const reduceMotion = useReducedMotion()

  useEffect(() => {
    if (!mobileMenuOpen) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [mobileMenuOpen])

  useEffect(() => {
    if (!mobileMenuOpen) return
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setMobileMenuOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [mobileMenuOpen])

  async function handleLogout() {
    await supabase.auth.signOut()
  }

  return (
    <div className="min-h-screen bg-brand-canvas">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl md:max-w-none">
        <aside className="hidden w-56 shrink-0 flex-col border-r border-brand-border bg-brand-surface sm:flex sm:sticky sm:top-0 sm:h-screen">
          <div className="border-b border-brand-border bg-brand-blush/20 p-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-brand-primary-hover">
              JR2 Factory
            </p>
            <p className="mt-0.5 text-base font-semibold text-brand-ink">Panel interno</p>
          </div>
          <div className="flex flex-1 flex-col overflow-y-auto p-3">
            <SidebarNav key={location.pathname} />
          </div>
          <div className="border-t border-brand-border p-3">
            <button
              type="button"
              className="w-full rounded-md px-3 py-2 text-left text-sm text-brand-ink-muted transition hover:bg-red-50 hover:text-red-700"
              onClick={handleLogout}
            >
              Cerrar sesión
            </button>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-40 border-b border-brand-border bg-brand-surface sm:hidden">
            <div className="flex items-center justify-between gap-3 px-4 py-3">
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold uppercase tracking-widest text-brand-primary-hover">
                  JR2 Factory
                </p>
                <p className="truncate text-sm font-semibold text-brand-ink">Panel interno</p>
              </div>
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-md border border-brand-border-strong bg-brand-primary px-3 py-2 text-sm font-medium text-brand-ink shadow-sm transition hover:bg-brand-primary-hover"
                aria-expanded={mobileMenuOpen}
                aria-controls="mobile-dashboard-nav"
                onClick={() => setMobileMenuOpen((o) => !o)}
              >
                Menú
                <svg
                  aria-hidden
                  className={`h-4 w-4 text-brand-ink/70 transition-transform duration-200 ${mobileMenuOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                </svg>
              </button>
            </div>
          </header>

          <AnimatePresence>
            {mobileMenuOpen && (
              <>
                <motion.button
                  key="mobile-drawer-backdrop"
                  type="button"
                  className="fixed inset-0 z-50 cursor-default border-0 bg-brand-ink/40 p-0 backdrop-blur-[2px] sm:hidden"
                  aria-label="Cerrar menú"
                  initial={reduceMotion ? false : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: reduceMotion ? 0 : 0.22, ease: menuEase }}
                  onClick={() => setMobileMenuOpen(false)}
                />
                <motion.aside
                  key="mobile-drawer-panel"
                  id="mobile-dashboard-nav"
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="mobile-drawer-title"
                  className="fixed inset-y-0 left-0 z-50 flex w-[min(92vw,26rem)] flex-col border-r border-brand-border bg-brand-surface pt-[env(safe-area-inset-top)] shadow-[4px_0_28px_-6px_rgba(44,40,41,0.14)] sm:hidden"
                  initial={reduceMotion ? false : { x: '-105%' }}
                  animate={{ x: 0 }}
                  exit={{ x: '-105%' }}
                  transition={{
                    duration: reduceMotion ? 0 : 0.3,
                    ease: menuEase,
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex shrink-0 items-start justify-between gap-3 border-b border-brand-border bg-brand-blush/25 px-4 py-4">
                    <div id="mobile-drawer-title" className="min-w-0">
                      <p className="text-xs font-semibold uppercase tracking-widest text-brand-primary-hover">
                        JR2 Factory
                      </p>
                      <p className="mt-0.5 text-sm font-semibold text-brand-ink">Panel interno</p>
                    </div>
                    <button
                      type="button"
                      className="rounded-md p-2 text-brand-ink-muted transition hover:bg-brand-blush/60 hover:text-brand-ink"
                      aria-label="Cerrar menú"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <div className="flex flex-1 flex-col overflow-y-auto p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
                    <SidebarNav
                      key={location.pathname}
                      onNavigate={() => setMobileMenuOpen(false)}
                    />
                    <button
                      type="button"
                      className="mt-6 w-full rounded-md px-3 py-2 text-left text-sm text-brand-ink-muted transition hover:bg-red-50 hover:text-red-700"
                      onClick={handleLogout}
                    >
                      Cerrar sesión
                    </button>
                  </div>
                </motion.aside>
              </>
            )}
          </AnimatePresence>

          <main className="flex-1 px-4 py-6 sm:px-6 sm:py-8">
            <div className="mx-auto w-full max-w-6xl">
              <PageTransition />
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
