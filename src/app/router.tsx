import { Navigate, Route, Routes } from 'react-router-dom'
import { DashboardLayout } from '../components/layout/DashboardLayout'
import { CuentaPage } from '../features/account/pages/CuentaPage'
import { DashboardPage } from '../features/dashboard/pages/DashboardPage'
import { LoginPage } from '../features/auth/pages/LoginPage'
import { RegisterPage } from '../features/auth/pages/RegisterPage'
import { ArticuloDetailPage } from '../features/inventory/pages/ArticuloDetailPage'
import { ArticulosPage } from '../features/inventory/pages/ArticulosPage'
import { EditarArticuloPage } from '../features/inventory/pages/EditarArticuloPage'
import { NuevoArticuloPage } from '../features/inventory/pages/NuevoArticuloPage'
import { CategoriasPage } from '../features/inventory/pages/CategoriasPage'
import { EditarTemporadaPage } from '../features/inventory/pages/EditarTemporadaPage'
import { NuevaTemporadaPage } from '../features/inventory/pages/NuevaTemporadaPage'
import { TemporadasPage } from '../features/inventory/pages/TemporadasPage'
import { CortesPage } from '../features/production/pages/CortesPage'
import { CosturerosPage } from '../features/production/pages/CosturerosPage'
import { ProtectedRoute, PublicRoute } from './guards'

export function AppRouter() {
  return (
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
          <Route path="/inventario/temporadas" element={<TemporadasPage />} />
          <Route path="/inventario/temporadas/nueva" element={<NuevaTemporadaPage />} />
          <Route path="/inventario/temporadas/:id/editar" element={<EditarTemporadaPage />} />
          <Route path="/cuenta" element={<CuentaPage />} />
        </Route>
        <Route path="/productos" element={<Navigate to="/inventario/articulos" replace />} />
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}
