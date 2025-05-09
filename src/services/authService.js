import api from './api'

const authService = {
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

      // Asegurarse de que la respuesta contiene el token en el formato correcto
      const token = response.data.access_token || response.data.token
      if (!token) {
        throw new Error('No se recibió token en la respuesta')
      }

      localStorage.setItem('token', token)
      
      // Obtener información del usuario si está disponible
      const user = response.data.user || { username: credentials.username }
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