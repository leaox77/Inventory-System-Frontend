import api from './api'

const authService = {
  // authService.js - Versión corregida
login: async (credentials) => {
    try {
      const formData = new URLSearchParams()
      formData.append('username', credentials.username)
      formData.append('password', credentials.password)

      const response = await api.post('/login', formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      })

      const token = response.data.access_token
      if (!token) {
        throw new Error('No se recibió token en la respuesta')
      }

      // Decodificar el token JWT para obtener los datos del usuario
      const payload = JSON.parse(atob(token.split('.')[1]))
      
      const user = {
        username: payload.sub,
        role_id: payload.role_id,
        permissions: payload.permissions || {}
      }

      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))
      
      return { token, user }
    } catch (error) {
      console.error('Error en login:', error)
      throw error
    }
  },

  logout: () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  },

  getCurrentUser: () => {
    const user = localStorage.getItem('user')
    return user ? JSON.parse(user) : null
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('token')
  },

  // Función para verificar si el token es válido
  verifyToken: async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return false
      
      // Puedes hacer una petición a un endpoint de verificación si lo tienes
      // o simplemente verificar que el token existe
      return true
    } catch (error) {
      return false
    }
  }
}

export default authService