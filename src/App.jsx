import { useEffect } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { CssBaseline } from '@mui/material'
import { useAuth } from './contexts/AuthContext'

// Pages
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Products from './pages/Products'
import ProductForm from './pages/ProductForm'
import Sales from './pages/Sales'
import NewSale from './pages/NewSale'
import SaleDetail from './pages/SaleDetail'
import SuppliersPage from './pages/SuppliersPage'
import SuppliersForm from './components/ui/SupplierForm'
import NotFound from './pages/NotFound'
import BranchesPage from './pages/BranchesPage'
import BranchForm from './pages/BranchForm'
import ClientsPage from './pages/ClientsPage'
import ClientForm from './pages/ClientForm'
import UsersPage from './pages/UsersPage'
import UserForm from './pages/UserForm'

// Layout
import Layout from './components/layout/Layout'

function ProtectedRoute({ children, requiredPermission }) {
  const { isAuthenticated, loading, hasPermission } = useAuth()
  const location = useLocation()

  if (loading) {
    return null // O un componente de carga
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (requiredPermission && !hasPermission(requiredPermission)) {
    return <Navigate to="/" state={{ from: location }} replace />
  }

  return children
}

function App() {
  const { checkAuth } = useAuth()
  
  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  return (
    <>
      <CssBaseline />
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route path="/" element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          <Route index element={<Dashboard />} />
          
          {/* Productos - Requiere permiso 'inventory' */}
          <Route path="/productos" element={
            <ProtectedRoute requiredPermission="inventory">
              <Products />
            </ProtectedRoute>
          } />
          <Route path="productos/nuevo" element={
            <ProtectedRoute requiredPermission="inventory">
              <ProductForm />
            </ProtectedRoute>
          } />
          <Route path="productos/editar/:id" element={
            <ProtectedRoute requiredPermission="inventory">
              <ProductForm />
            </ProtectedRoute>
          } />
          
          {/* Ventas - Requiere permiso 'sales' */}
          <Route path="ventas" element={
            <ProtectedRoute requiredPermission="sales">
              <Sales />
            </ProtectedRoute>
          } />
          <Route path="ventas/nueva" element={
            <ProtectedRoute requiredPermission="sales">
              <NewSale />
            </ProtectedRoute>
          } />
          <Route path="ventas/editar/:id" element={
            <ProtectedRoute requiredPermission="sales">
              <NewSale />
            </ProtectedRoute>
          } />
          <Route path="ventas/:id" element={
            <ProtectedRoute requiredPermission="sales">
              <SaleDetail />
            </ProtectedRoute>
          } />
          
          {/* Proveedores - Requiere permiso 'inventory' */}
          <Route path="proveedores" element={
            <ProtectedRoute requiredPermission="inventory">
              <SuppliersPage />
            </ProtectedRoute>
          } />
          <Route path="proveedores/nuevo" element={
            <ProtectedRoute requiredPermission="inventory">
              <SuppliersForm />
            </ProtectedRoute>
          } />
          <Route path="proveedores/editar/:id" element={
            <ProtectedRoute requiredPermission="inventory">
              <SuppliersForm />
            </ProtectedRoute>
          } />
          
          {/* Sucursales - Requiere permiso 'reports' */}
          <Route path="sucursales" element={
            <ProtectedRoute requiredPermission="reports">
              <BranchesPage />
            </ProtectedRoute>
          } />
          <Route path="sucursales/nueva" element={
            <ProtectedRoute requiredPermission="reports">
              <BranchForm />
            </ProtectedRoute>
          } />
          <Route path="sucursales/editar/:id" element={
            <ProtectedRoute requiredPermission="reports">
              <BranchForm />
            </ProtectedRoute>
          } />
          
          {/* Clientes - Requiere permiso 'reports' */}
          <Route path="clientes" element={
            <ProtectedRoute requiredPermission="sales">
              <ClientsPage />
            </ProtectedRoute>
          } />
          <Route path="clientes/nuevo" element={
            <ProtectedRoute requiredPermission="sales">
              <ClientForm />
            </ProtectedRoute>
          } />
          <Route path="clientes/editar/:id" element={
            <ProtectedRoute requiredPermission="reports">
              <ClientForm />
            </ProtectedRoute>
          } />
          
          {/* Usuarios - Solo admin (rol_id 1) */}
          <Route path="usuarios" element={
            <ProtectedRoute requiredPermission="all">
              <UsersPage />
            </ProtectedRoute>
          } />
          <Route path="usuarios/nuevo" element={
            <ProtectedRoute requiredPermission="all">
              <UserForm />
            </ProtectedRoute>
          } />
          <Route path="usuarios/editar/:id" element={
            <ProtectedRoute requiredPermission="all">
              <UserForm />
            </ProtectedRoute>
          } />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  )
}

export default App