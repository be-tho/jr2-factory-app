import { useEffect, useState, type ReactNode } from 'react'
import { toast } from 'sonner'
import {
  IconBuildingFactory2,
  IconCalendar,
  IconChevronDown,
  IconClipboardList,
  IconCreditCard,
  IconHistory,
  IconLayoutDashboard,
  IconStack,
  IconLogout,
  IconMenu2,
  IconPackage,
  IconRuler,
  IconScissors,
  IconShoppingBag,
  IconShoppingCart,
  IconTag,
  IconTruck,
  IconUser,
  IconUsers,
  IconX,
} from '@tabler/icons-react'
import { BrandLogo } from '../ui/BrandLogo'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { NavLink, useLocation } from 'react-router-dom'
import { ic } from '../../lib/tabler'
import { supabase } from '../../lib/supabase/client'
import { useSession } from '../../hooks/useSession'
import { ProfileAvatarImage } from '../../features/account/components/ProfileAvatarImage'
import { useProfileQuery } from '../../features/account/hooks/useProfile'
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
  const [ventasOpen, setVentasOpen] = useState(() => location.pathname.startsWith('/ventas'))
  const { data: profile } = useProfileQuery()

  const itemClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-2.5 rounded-md px-3 py-2.5 text-base font-bold transition-colors duration-150 ${
      isActive
        ? 'bg-brand-primary text-brand-on-primary shadow-sm'
        : 'text-brand-ink-muted hover:bg-brand-primary-subtle hover:text-brand-primary'
    }`

  const subItemClass = ({ isActive }: { isActive: boolean }) =>
    `ml-2 flex items-center gap-2 rounded-md border-l-2 py-2.5 pl-3 pr-2 text-base transition-colors duration-150 ${
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
          className={`flex w-full items-center gap-2.5 rounded-md px-3 py-2.5 text-left text-base font-bold transition-colors duration-150 ${
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
            className={`shrink-0 text-brand-ink-faint transition-transform duration-200 ease-out ${produccionOpen ? 'rotate-180' : ''}`}
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
            <NavLink to="/produccion/patrones" className={subItemClass} onClick={onNavigate}>
              <IconRuler {...ic.navSub} aria-hidden />
              Patrones
            </NavLink>
          </div>
        </NavCollapsible>
      </div>

      <div>
        <button
          type="button"
          className={`flex w-full items-center gap-2.5 rounded-md px-3 py-2.5 text-left text-base font-bold transition-colors duration-150 ${
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
            className={`shrink-0 text-brand-ink-faint transition-transform duration-200 ease-out ${inventarioOpen ? 'rotate-180' : ''}`}
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

      <NavLink to="/envios" className={itemClass} onClick={onNavigate}>
        <IconTruck {...ic.nav} aria-hidden />
        Envíos
      </NavLink>

      <div>
        <button
          type="button"
          className={`flex w-full items-center gap-2.5 rounded-md px-3 py-2.5 text-left text-base font-bold transition-colors duration-150 ${
            location.pathname.startsWith('/ventas')
              ? 'bg-brand-primary-subtle text-brand-primary'
              : 'text-brand-ink-muted hover:bg-brand-primary-ghost hover:text-brand-primary'
          }`}
          aria-expanded={ventasOpen}
          onClick={() => setVentasOpen((o) => !o)}
        >
          <IconShoppingCart {...ic.nav} aria-hidden />
          <span className="min-w-0 flex-1">Ventas</span>
          <IconChevronDown
            aria-hidden
            size={16}
            stroke={1.5}
            className={`shrink-0 text-brand-ink-faint transition-transform duration-200 ease-out ${ventasOpen ? 'rotate-180' : ''}`}
          />
        </button>
        <NavCollapsible open={ventasOpen}>
          <div className="mt-1 flex flex-col gap-0.5">
            <NavLink to="/ventas" end className={subItemClass} onClick={onNavigate}>
              <IconShoppingBag {...ic.navSub} aria-hidden />
              Catálogo
            </NavLink>
            <NavLink to="/ventas/checkout" className={subItemClass} onClick={onNavigate}>
              <IconCreditCard {...ic.navSub} aria-hidden />
              Checkout
            </NavLink>
            <NavLink to="/ventas/ordenes" className={subItemClass} onClick={onNavigate}>
              <IconClipboardList {...ic.navSub} aria-hidden />
              Órdenes
            </NavLink>
            <NavLink to="/ventas/historial" className={subItemClass} onClick={onNavigate}>
              <IconHistory {...ic.navSub} aria-hidden />
              Historial
            </NavLink>
          </div>
        </NavCollapsible>
      </div>

      {profile?.role === 'admin' && (
        <NavLink to="/usuarios" className={itemClass} onClick={onNavigate}>
          <IconUsers {...ic.nav} aria-hidden />
          Usuarios
        </NavLink>
      )}

      <NavLink to="/cuenta" className={itemClass} onClick={onNavigate}>
        <IconUser {...ic.nav} aria-hidden />
        Cuenta
      </NavLink>
    </nav>
  )
}

function SidebarUserCard() {
  const { session } = useSession()
  const { data: profile } = useProfileQuery()
  const displayName =
    profile?.full_name?.trim() || session?.user.email?.split('@')[0] || 'Usuario'
  const email = session?.user.email ?? ''
  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w: string) => w[0].toUpperCase())
    .join('')

  return (
    <NavLink
      to="/cuenta"
      className="flex items-center gap-2.5 rounded-lg px-2 py-2 transition-colors duration-150 hover:bg-brand-primary-ghost"
    >
      <div className="h-8 w-8 shrink-0 overflow-hidden rounded-full border border-brand-border bg-brand-primary-ghost">
        <ProfileAvatarImage
          storagePath={profile?.avatar_path}
          alt={displayName}
          className="h-full w-full"
          initials={initials}
          iconSize={14}
        />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-[#3d3b4f]">{displayName}</p>
        <p className="truncate text-xs text-[#b9b6c3]">{email}</p>
      </div>
    </NavLink>
  )
}

export function DashboardLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
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
    toast.success('Sesión cerrada', {
      description: '¡Hasta la próxima!',
    })
  }

  return (
    <div className="min-h-screen bg-[#f8f7fa]">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl md:max-w-none">
        <aside className="hidden w-56 shrink-0 flex-col border-r border-brand-border bg-brand-surface sm:flex sm:sticky sm:top-0 sm:h-screen">
          <div className="border-b border-brand-border bg-brand-primary-ghost p-4">
            <BrandLogo size="md" showText subtitle="Panel interno" />
          </div>
          <div className="flex flex-1 flex-col overflow-y-auto p-3">
            <SidebarNav />
          </div>
          <div className="border-t border-brand-border p-3 space-y-1">
            <SidebarUserCard />
            <button
              type="button"
              className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-left text-sm font-semibold text-brand-ink-muted transition-colors duration-150 hover:bg-red-50 hover:text-red-700"
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
              <BrandLogo size="sm" showText subtitle="Panel interno" className="min-w-0" />
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-md border border-brand-primary-hover bg-brand-primary px-3 py-2 text-sm font-bold text-brand-on-primary shadow-sm transition-colors duration-150 hover:bg-brand-primary-hover active:scale-95"
                style={{ WebkitTapHighlightColor: 'transparent' }}
                aria-expanded={mobileMenuOpen}
                aria-controls="mobile-dashboard-nav"
                onClick={() => setMobileMenuOpen((o) => !o)}
              >
                <span className="relative flex h-[18px] w-[18px] shrink-0 items-center justify-center overflow-hidden">
                  <AnimatePresence mode="wait" initial={false}>
                    {mobileMenuOpen ? (
                      <motion.span
                        key="icon-x"
                        initial={{ rotate: 90, opacity: 0, scale: 0.7 }}
                        animate={{ rotate: 0, opacity: 1, scale: 1 }}
                        exit={{ rotate: -90, opacity: 0, scale: 0.7 }}
                        transition={{ duration: 0.18, ease: menuEase }}
                        className="absolute"
                      >
                        <IconX size={18} stroke={2} aria-hidden />
                      </motion.span>
                    ) : (
                      <motion.span
                        key="icon-menu"
                        initial={{ rotate: -90, opacity: 0, scale: 0.7 }}
                        animate={{ rotate: 0, opacity: 1, scale: 1 }}
                        exit={{ rotate: 90, opacity: 0, scale: 0.7 }}
                        transition={{ duration: 0.18, ease: menuEase }}
                        className="absolute"
                      >
                        <IconMenu2 size={18} stroke={1.5} aria-hidden />
                      </motion.span>
                    )}
                  </AnimatePresence>
                </span>
                <motion.span
                  key={mobileMenuOpen ? 'label-close' : 'label-open'}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.15, ease: menuEase }}
                >
                  {mobileMenuOpen ? 'Cerrar' : 'Menú'}
                </motion.span>
              </button>
            </div>
          </header>

          <AnimatePresence>
            {mobileMenuOpen && (
              <>
                <motion.button
                  key="mobile-drawer-backdrop"
                  type="button"
                  className="fixed inset-0 z-50 cursor-default border-0 bg-modal-scrim p-0 sm:hidden"
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
                    <div id="mobile-drawer-title" className="flex min-w-0 items-center">
                      <BrandLogo size="md" showText subtitle="Panel interno" />
                    </div>
                    <button
                      type="button"
                      className="rounded-md p-2 text-brand-ink-muted transition-colors duration-150 hover:bg-brand-blush/60 hover:text-brand-ink"
                      style={{ WebkitTapHighlightColor: 'transparent' }}
                      aria-label="Cerrar menú"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <IconX size={22} stroke={1.5} aria-hidden />
                    </button>
                  </div>
                  <div className="flex flex-1 flex-col overflow-y-auto p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
                    <SidebarNav
                      onNavigate={() => {
                        setTimeout(() => setMobileMenuOpen(false), 80)
                      }}
                    />
                    <button
                      type="button"
                      className="mt-6 flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-left text-base font-bold text-brand-ink-muted transition-colors duration-150 hover:bg-red-50 hover:text-red-700"
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
