import { lazy, Suspense, useEffect } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { DashboardLayout } from '../components/layout/DashboardLayout'
import { AdminRoute, ProtectedRoute, PublicRoute } from './guards'

const APP_NAME = 'JR2-MODA'

const ROUTE_TITLES: Array<{ pattern: RegExp | string; title: string }> = [
  { pattern: '/login', title: 'Ingresar' },
  { pattern: '/registro', title: 'Registro' },
  { pattern: '/dashboard', title: 'Dashboard' },
  { pattern: /^\/produccion\/cortes\/[^/]+\/editar$/, title: 'Editar Corte' },
  { pattern: /^\/produccion\/cortes\/[^/]+$/, title: 'Detalle Corte' },
  { pattern: '/produccion/cortes/nuevo', title: 'Nuevo Corte' },
  { pattern: '/produccion/cortes', title: 'Cortes' },
  { pattern: /^\/produccion\/costureros\/[^/]+\/editar$/, title: 'Editar Costurero' },
  { pattern: /^\/produccion\/costureros\/[^/]+$/, title: 'Detalle Costurero' },
  { pattern: '/produccion/costureros/nuevo', title: 'Nuevo Costurero' },
  { pattern: '/produccion/costureros', title: 'Costureros' },
  { pattern: /^\/produccion\/patrones\/[^/]+\/editar$/, title: 'Editar Patrón' },
  { pattern: /^\/produccion\/patrones\/[^/]+$/, title: 'Detalle Patrón' },
  { pattern: '/produccion/patrones/nuevo', title: 'Nuevo Patrón' },
  { pattern: '/produccion/patrones', title: 'Patrones' },
  { pattern: /^\/inventario\/articulos\/[^/]+\/editar$/, title: 'Editar Artículo' },
  { pattern: /^\/inventario\/articulos\/[^/]+$/, title: 'Detalle Artículo' },
  { pattern: '/inventario/articulos/nuevo', title: 'Nuevo Artículo' },
  { pattern: '/inventario/articulos', title: 'Artículos' },
  { pattern: /^\/inventario\/categorias\/[^/]+\/editar$/, title: 'Editar Categoría' },
  { pattern: '/inventario/categorias/nueva', title: 'Nueva Categoría' },
  { pattern: '/inventario/categorias', title: 'Categorías' },
  { pattern: /^\/inventario\/temporadas\/[^/]+\/editar$/, title: 'Editar Temporada' },
  { pattern: '/inventario/temporadas/nueva', title: 'Nueva Temporada' },
  { pattern: '/inventario/temporadas', title: 'Temporadas' },
  { pattern: '/cuenta', title: 'Mi Cuenta' },
  { pattern: '/usuarios', title: 'Usuarios' },
]

function resolveTitle(pathname: string): string {
  for (const { pattern, title } of ROUTE_TITLES) {
    if (typeof pattern === 'string' ? pathname === pattern : pattern.test(pathname)) {
      return title
    }
  }
  return ''
}

function PageTitleManager() {
  const { pathname } = useLocation()
  useEffect(() => {
    const section = resolveTitle(pathname)
    document.title = section ? `${APP_NAME} | ${section}` : APP_NAME
  }, [pathname])
  return null
}

const CuentaPage = lazy(() =>
  import('../features/account/pages/CuentaPage').then((m) => ({ default: m.CuentaPage })),
)
const DashboardPage = lazy(() =>
  import('../features/dashboard/pages/DashboardPage').then((m) => ({ default: m.DashboardPage })),
)
const LoginPage = lazy(() =>
  import('../features/auth/pages/LoginPage').then((m) => ({ default: m.LoginPage })),
)
const RegisterPage = lazy(() =>
  import('../features/auth/pages/RegisterPage').then((m) => ({ default: m.RegisterPage })),
)
const ArticuloDetailPage = lazy(() =>
  import('../features/inventory/pages/ArticuloDetailPage').then((m) => ({ default: m.ArticuloDetailPage })),
)
const ArticulosPage = lazy(() =>
  import('../features/inventory/pages/ArticulosPage').then((m) => ({ default: m.ArticulosPage })),
)
const EditarArticuloPage = lazy(() =>
  import('../features/inventory/pages/EditarArticuloPage').then((m) => ({ default: m.EditarArticuloPage })),
)
const NuevoArticuloPage = lazy(() =>
  import('../features/inventory/pages/NuevoArticuloPage').then((m) => ({ default: m.NuevoArticuloPage })),
)
const CategoriasPage = lazy(() =>
  import('../features/inventory/pages/CategoriasPage').then((m) => ({ default: m.CategoriasPage })),
)
const EditarCategoriaPage = lazy(() =>
  import('../features/inventory/pages/EditarCategoriaPage').then((m) => ({ default: m.EditarCategoriaPage })),
)
const NuevaCategoriaPage = lazy(() =>
  import('../features/inventory/pages/NuevaCategoriaPage').then((m) => ({ default: m.NuevaCategoriaPage })),
)
const EditarTemporadaPage = lazy(() =>
  import('../features/inventory/pages/EditarTemporadaPage').then((m) => ({ default: m.EditarTemporadaPage })),
)
const NuevaTemporadaPage = lazy(() =>
  import('../features/inventory/pages/NuevaTemporadaPage').then((m) => ({ default: m.NuevaTemporadaPage })),
)
const TemporadasPage = lazy(() =>
  import('../features/inventory/pages/TemporadasPage').then((m) => ({ default: m.TemporadasPage })),
)
const CortesPage = lazy(() =>
  import('../features/production/pages/CortesPage').then((m) => ({ default: m.CortesPage })),
)
const NuevoCortePage = lazy(() =>
  import('../features/production/pages/NuevoCortePage').then((m) => ({ default: m.NuevoCortePage })),
)
const EditarCortePage = lazy(() =>
  import('../features/production/pages/EditarCortePage').then((m) => ({ default: m.EditarCortePage })),
)
const CorteDetailPage = lazy(() =>
  import('../features/production/pages/CorteDetailPage').then((m) => ({ default: m.CorteDetailPage })),
)
const CosturerosPage = lazy(() =>
  import('../features/production/pages/CosturerosPage').then((m) => ({ default: m.CosturerosPage })),
)
const NuevoCostureroPage = lazy(() =>
  import('../features/production/pages/NuevoCostureroPage').then((m) => ({ default: m.NuevoCostureroPage })),
)
const EditarCostureroPage = lazy(() =>
  import('../features/production/pages/EditarCostureroPage').then((m) => ({ default: m.EditarCostureroPage })),
)
const CostureroDetailPage = lazy(() =>
  import('../features/production/pages/CostureroDetailPage').then((m) => ({ default: m.CostureroDetailPage })),
)
const PatronesPage = lazy(() =>
  import('../features/patterns/pages/PatronesPage').then((m) => ({ default: m.PatronesPage })),
)
const NuevoPatronPage = lazy(() =>
  import('../features/patterns/pages/NuevoPatronPage').then((m) => ({ default: m.NuevoPatronPage })),
)
const PatronDetailPage = lazy(() =>
  import('../features/patterns/pages/PatronDetailPage').then((m) => ({ default: m.PatronDetailPage })),
)
const EditarPatronPage = lazy(() =>
  import('../features/patterns/pages/EditarPatronPage').then((m) => ({ default: m.EditarPatronPage })),
)
const AdminUsersPage = lazy(() =>
  import('../features/admin/pages/AdminUsersPage').then((m) => ({ default: m.AdminUsersPage })),
)

function RouteFallback() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center px-4">
      <p className="text-sm text-brand-ink-muted">Cargando vista…</p>
    </div>
  )
}

export function AppRouter() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <PageTitleManager />
      <Routes>
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/registro" element={<RegisterPage />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/produccion/cortes" element={<CortesPage />} />
            <Route path="/produccion/cortes/nuevo" element={<NuevoCortePage />} />
            <Route path="/produccion/cortes/:id" element={<CorteDetailPage />} />
            <Route path="/produccion/cortes/:id/editar" element={<EditarCortePage />} />
            <Route path="/produccion/costureros" element={<CosturerosPage />} />
            <Route path="/produccion/costureros/nuevo" element={<NuevoCostureroPage />} />
            <Route path="/produccion/costureros/:id" element={<CostureroDetailPage />} />
            <Route path="/produccion/costureros/:id/editar" element={<EditarCostureroPage />} />
            <Route path="/produccion/patrones" element={<PatronesPage />} />
            <Route path="/produccion/patrones/nuevo" element={<NuevoPatronPage />} />
            <Route path="/produccion/patrones/:id/editar" element={<EditarPatronPage />} />
            <Route path="/produccion/patrones/:id" element={<PatronDetailPage />} />
            <Route path="/inventario/articulos" element={<ArticulosPage />} />
            <Route path="/inventario/articulos/nuevo" element={<NuevoArticuloPage />} />
            <Route path="/inventario/articulos/:id/editar" element={<EditarArticuloPage />} />
            <Route path="/inventario/articulos/:id" element={<ArticuloDetailPage />} />
            <Route path="/inventario/categorias" element={<CategoriasPage />} />
            <Route path="/inventario/categorias/nueva" element={<NuevaCategoriaPage />} />
            <Route path="/inventario/categorias/:id/editar" element={<EditarCategoriaPage />} />
            <Route path="/inventario/temporadas" element={<TemporadasPage />} />
            <Route path="/inventario/temporadas/nueva" element={<NuevaTemporadaPage />} />
            <Route path="/inventario/temporadas/:id/editar" element={<EditarTemporadaPage />} />
            <Route path="/cuenta" element={<CuentaPage />} />
            <Route element={<AdminRoute />}>
              <Route path="/usuarios" element={<AdminUsersPage />} />
            </Route>
          </Route>
          <Route path="/productos" element={<Navigate to="/inventario/articulos" replace />} />
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Suspense>
  )
}
