import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'https://inventory-system-backend-production-51be.up.railway.app/api/v1'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Interceptor de solicitudes para agregar el token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Interceptor de respuestas mejorado
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Solo manejar 401 si no es la ruta de login
      if (!error.config.url.includes('/login')) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        // Usar window.location solo si no estás en la página de login
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login'
        }
      }
    }
    return Promise.reject(error)
  }
)

export default api