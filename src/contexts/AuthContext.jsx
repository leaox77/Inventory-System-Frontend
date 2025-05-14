import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import authService from '../services/authService'

const AuthContext = createContext()

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  const login = async (credentials) => {
    try {
      setLoading(true)
      setError(null)
      const { token, user } = await authService.login(credentials)
      
      // Verificación adicional de datos
      if (!user || user.role_id === undefined || user.role_id === null) {
        console.error('Datos de usuario incompletos:', user)
        throw new Error('Información de rol no recibida')
      }

      setCurrentUser(user)
      setIsAuthenticated(true)
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))
      navigate('/')
      return { token, user }
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 
                         err.message || 
                         'Error al iniciar sesión'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const logout = useCallback(() => {
    authService.logout()
    setCurrentUser(null)
    setIsAuthenticated(false)
    navigate('/login')
  }, [navigate])

  const checkAuth = useCallback(async () => {
    try {
      setLoading(true)
      const isAuth = await authService.verifyToken()
      if (isAuth) {
        const user = authService.getCurrentUser()
        if (user) {
          setCurrentUser(user)
          setIsAuthenticated(true)
        } else {
          logout()
        }
      } else {
        logout()
      }
    } catch (err) {
      console.error('Error al verificar autenticación:', err)
      logout()
    } finally {
      setLoading(false)
    }
  }, [logout])

  // Función para verificar permisos
  const hasPermission = useCallback((requiredPermission) => {
    if (!currentUser) return false
    
    // Admin (rol_id 1) tiene acceso a todo
    if (currentUser.role_id === 1) return true
    
    return currentUser.permissions[requiredPermission] === true || 
           currentUser.permissions.all === true
  }, [currentUser])

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  const value = {
    currentUser,
    isAuthenticated,
    loading,
    error,
    login,
    logout,
    checkAuth,
    hasPermission
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}