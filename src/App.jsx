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

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return null // O un componente de carga
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
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
          <Route path="productos" element={<Products />} />
          <Route path="productos/nuevo" element={<ProductForm />} />
          <Route path="productos/editar/:id" element={<ProductForm />} />
          <Route path="ventas" element={<Sales />} />
          <Route path="ventas/nueva" element={<NewSale />} />
          <Route path="ventas/editar/:id" element={<NewSale />} />
          <Route path="proveedores" element={<SuppliersPage/>}></Route>
          <Route path="proveedores/nuevo" element={<SuppliersForm/>}></Route>
          <Route path="proveedores/editar/:id" element={<SuppliersForm/>}></Route>
          <Route path="sucursales" element={<BranchesPage />} />
          <Route path="sucursales/nueva" element={<BranchForm />} />
          <Route path="sucursales/editar/:id" element={<BranchForm />} />
          <Route path="ventas/:id" element={<SaleDetail />} />
          <Route path="clientes" element={<ClientsPage />} />
          <Route path="clientes/nuevo" element={<ClientForm />} />
          <Route path="clientes/editar/:id" element={<ClientForm />} />
          <Route path="usuarios" element={<UsersPage />} />
          <Route path="usuarios/nuevo" element={<UserForm />} />
          <Route path="usuarios/editar/:id" element={<UserForm />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  )
}

export default App