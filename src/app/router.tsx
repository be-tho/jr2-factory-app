import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { DashboardLayout } from '../components/layout/DashboardLayout'
import { ProtectedRoute, PublicRoute } from './guards'

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
const CosturerosPage = lazy(() =>
  import('../features/production/pages/CosturerosPage').then((m) => ({ default: m.CosturerosPage })),
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
      <Routes>
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/registro" element={<RegisterPage />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/produccion/cortes" element={<CortesPage />} />
            <Route path="/produccion/costureros" element={<CosturerosPage />} />
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
          </Route>
          <Route path="/productos" element={<Navigate to="/inventario/articulos" replace />} />
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Suspense>
  )
}
