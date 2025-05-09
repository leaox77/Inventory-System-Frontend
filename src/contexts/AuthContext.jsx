import { createContext, useContext, useState, useCallback } from 'react'
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
      const userData = await authService.login(credentials)
      setCurrentUser(userData)
      setIsAuthenticated(true)
      localStorage.setItem('token', userData.token)
      navigate('/')
      return userData
    } catch (err) {
      setError(err.response?.data?.detail || 'Error al iniciar sesión')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const logout = useCallback(() => {
    setCurrentUser(null)
    setIsAuthenticated(false)
    localStorage.removeItem('token')
    navigate('/login')
  }, [navigate])

  const checkAuth = useCallback(() => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      if (token) {
        // En un escenario real, verificaríamos el token con el backend
        setIsAuthenticated(true)
        // Simular datos del usuario
        setCurrentUser({ 
          name: 'Usuario Demo',
          email: 'demo@example.com',
          role: 'admin'
        })
      } else {
        setIsAuthenticated(false)
      }
    } catch (err) {
      console.error('Error al verificar autenticación:', err)
      setIsAuthenticated(false)
    } finally {
      setLoading(false)
    }
  }, [])

  const value = {
    currentUser,
    isAuthenticated,
    loading,
    error,
    login,
    logout,
    checkAuth
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}