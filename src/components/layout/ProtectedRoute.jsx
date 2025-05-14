// components/ProtectedRoute.js
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

function ProtectedRoute({ children, requiredPermission }) {
  const { currentUser } = useAuth()
  const location = useLocation()

  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Admin tiene acceso a todo
  if (currentUser.role_id === 1) {
    return children
  }

  // Verificar permiso
  const hasPermission = (permission) => {
    if (!currentUser) return false
    if (currentUser.role_id === 1) return true // Admin tiene acceso a todo

    return currentUser.permissions?.[permission] === true || currentUser.permissions?.all === true;
  }

  const filteredMenuItems = menuItems.filter(item =>
    hasPermission(item.permission)
  )
}

export default ProtectedRoute