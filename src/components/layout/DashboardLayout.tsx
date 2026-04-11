import { useEffect, useState, type ReactNode } from 'react'
import {
  IconBuildingFactory2,
  IconCalendar,
  IconChevronDown,
  IconLayoutDashboard,
  IconStack,
  IconLogout,
  IconMenu2,
  IconPackage,
  IconScissors,
  IconTag,
  IconUser,
  IconUsers,
  IconX,
} from '@tabler/icons-react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { NavLink, useLocation } from 'react-router-dom'
import { ic } from '../../lib/tabler'
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

function SidebarNav({ onNavigate }: NavBlockProps) {
  const location = useLocation()
  const [produccionOpen, setProduccionOpen] = useState(() =>
    location.pathname.startsWith('/produccion'),
  )
  const [inventarioOpen, setInventarioOpen] = useState(() =>
    location.pathname.startsWith('/inventario'),
  )

  const itemClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-2.5 rounded-md px-3 py-2.5 text-base font-bold transition ${
      isActive
        ? 'bg-brand-primary text-brand-on-primary shadow-sm'
        : 'text-brand-ink-muted hover:bg-brand-primary-subtle hover:text-brand-primary'
    }`

  const subItemClass = ({ isActive }: { isActive: boolean }) =>
    `ml-2 flex items-center gap-2 rounded-md border-l-2 py-2.5 pl-3 pr-2 text-base transition ${
      isActive
        ? 'border-brand-primary bg-brand-primary-subtle font-bold text-brand-primary'
        : 'border-transparent font-bold text-brand-ink-muted hover:border-brand-border hover:bg-brand-primary-ghost hover:text-brand-primary'
    }`

  return (
    <nav className="flex flex-col gap-1">
      <NavLink to="/dashboard" end className={itemClass} onClick={onNavigate}>
        <IconLayoutDashboard {...ic.nav} aria-hidden />
        Dashboard
      </NavLink>

      <div>
        <button
          type="button"
          className={`flex w-full items-center gap-2.5 rounded-md px-3 py-2.5 text-left text-base font-bold transition ${
            location.pathname.startsWith('/produccion')
              ? 'bg-brand-primary-subtle text-brand-primary'
              : 'text-brand-ink-muted hover:bg-brand-primary-ghost hover:text-brand-primary'
          }`}
          aria-expanded={produccionOpen}
          onClick={() => setProduccionOpen((o) => !o)}
        >
          <IconBuildingFactory2 {...ic.nav} aria-hidden />
          <span className="min-w-0 flex-1">Producción</span>
          <IconChevronDown
            aria-hidden
            size={16}
            stroke={1.5}
            className={`shrink-0 text-brand-ink-faint transition-transform ${produccionOpen ? 'rotate-180' : ''}`}
          />
        </button>
        <NavCollapsible open={produccionOpen}>
          <div className="mt-1 flex flex-col gap-0.5">
            <NavLink to="/produccion/cortes" className={subItemClass} onClick={onNavigate}>
              <IconScissors {...ic.navSub} aria-hidden />
              Cortes
            </NavLink>
            <NavLink to="/produccion/costureros" className={subItemClass} onClick={onNavigate}>
              <IconUsers {...ic.navSub} aria-hidden />
              Costureros
            </NavLink>
          </div>
        </NavCollapsible>
      </div>

      <div>
        <button
          type="button"
          className={`flex w-full items-center gap-2.5 rounded-md px-3 py-2.5 text-left text-base font-bold transition ${
            location.pathname.startsWith('/inventario')
              ? 'bg-brand-primary-subtle text-brand-primary'
              : 'text-brand-ink-muted hover:bg-brand-primary-ghost hover:text-brand-primary'
          }`}
          aria-expanded={inventarioOpen}
          onClick={() => setInventarioOpen((o) => !o)}
        >
          <IconPackage {...ic.nav} aria-hidden />
          <span className="min-w-0 flex-1">Inventario</span>
          <IconChevronDown
            aria-hidden
            size={16}
            stroke={1.5}
            className={`shrink-0 text-brand-ink-faint transition-transform ${inventarioOpen ? 'rotate-180' : ''}`}
          />
        </button>
        <NavCollapsible open={inventarioOpen}>
          <div className="mt-1 flex flex-col gap-0.5">
            <NavLink to="/inventario/articulos" className={subItemClass} onClick={onNavigate}>
              <IconStack {...ic.navSub} aria-hidden />
              Artículos
            </NavLink>
            <NavLink to="/inventario/categorias" className={subItemClass} onClick={onNavigate}>
              <IconTag {...ic.navSub} aria-hidden />
              Categorías
            </NavLink>
            <NavLink to="/inventario/temporadas" className={subItemClass} onClick={onNavigate}>
              <IconCalendar {...ic.navSub} aria-hidden />
              Temporadas
            </NavLink>
          </div>
        </NavCollapsible>
      </div>

      <NavLink to="/cuenta" className={itemClass} onClick={onNavigate}>
        <IconUser {...ic.nav} aria-hidden />
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
          <div className="border-b border-brand-border bg-brand-primary-ghost p-4">
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-brand-border/80 bg-brand-surface text-brand-primary-hover">
                <IconBuildingFactory2 size={20} stroke={1.5} aria-hidden />
              </span>
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-widest text-brand-primary-hover">
                  JR2 Factory
                </p>
                <p className="mt-0.5 truncate text-base font-semibold text-brand-ink">Panel interno</p>
              </div>
            </div>
          </div>
          <div className="flex flex-1 flex-col overflow-y-auto p-3">
            <SidebarNav key={location.pathname} />
          </div>
          <div className="border-t border-brand-border p-3">
            <button
              type="button"
              className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-left text-base font-bold text-brand-ink-muted transition hover:bg-red-50 hover:text-red-700"
              onClick={handleLogout}
            >
              <IconLogout {...ic.nav} aria-hidden />
              Cerrar sesión
            </button>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-40 border-b border-brand-border bg-brand-surface sm:hidden">
            <div className="flex items-center justify-between gap-3 px-4 py-3">
              <div className="flex min-w-0 items-center gap-2">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-brand-border bg-brand-blush/30 text-brand-primary-hover">
                  <IconBuildingFactory2 size={18} stroke={1.5} aria-hidden />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold uppercase tracking-widest text-brand-primary-hover">
                    JR2 Factory
                  </p>
                  <p className="truncate text-sm font-semibold text-brand-ink">Panel interno</p>
                </div>
              </div>
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-md border border-brand-primary-hover bg-brand-primary px-3 py-2 text-sm font-bold text-brand-on-primary shadow-sm transition hover:bg-brand-primary-hover"
                aria-expanded={mobileMenuOpen}
                aria-controls="mobile-dashboard-nav"
                onClick={() => setMobileMenuOpen((o) => !o)}
              >
                <IconMenu2 size={18} stroke={1.5} aria-hidden />
                Menú
                <IconChevronDown
                  aria-hidden
                  size={16}
                  stroke={1.5}
                  className={`text-brand-on-primary/85 transition-transform duration-200 ${mobileMenuOpen ? 'rotate-180' : ''}`}
                />
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
                  <div className="flex shrink-0 items-start justify-between gap-3 border-b border-brand-border bg-brand-primary-ghost px-4 py-4">
                    <div id="mobile-drawer-title" className="flex min-w-0 items-center gap-2">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-brand-border bg-brand-surface text-brand-primary-hover">
                        <IconBuildingFactory2 size={18} stroke={1.5} aria-hidden />
                      </span>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold uppercase tracking-widest text-brand-primary-hover">
                          JR2 Factory
                        </p>
                        <p className="mt-0.5 text-sm font-semibold text-brand-ink">Panel interno</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="rounded-md p-2 text-brand-ink-muted transition hover:bg-brand-blush/60 hover:text-brand-ink"
                      aria-label="Cerrar menú"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <IconX size={22} stroke={1.5} aria-hidden />
                    </button>
                  </div>
                  <div className="flex flex-1 flex-col overflow-y-auto p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
                    <SidebarNav
                      key={location.pathname}
                      onNavigate={() => setMobileMenuOpen(false)}
                    />
                    <button
                      type="button"
                      className="mt-6 flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-left text-base font-bold text-brand-ink-muted transition hover:bg-red-50 hover:text-red-700"
                      onClick={handleLogout}
                    >
                      <IconLogout {...ic.nav} aria-hidden />
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
