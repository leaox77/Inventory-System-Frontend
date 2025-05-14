import api from './api'

export default {
  getUsers: async (params = {}) => {
    try {
      const response = await api.get('/users', { params })
      return response.data
    } catch (error) {
      console.error('Error fetching users:', error)
      throw error.response?.data?.detail || 
            error.response?.data?.message || 
            error.message || 
            'Error al obtener usuarios'
    }
  },

  getUser: async (id) => {
    try {
      const response = await api.get(`/users/${id}`)
      return response.data
    } catch (error) {
      console.error('Error fetching user:', error)
      throw error.response?.data?.detail || 
            error.response?.data?.message || 
            error.message || 
            'Error al obtener usuario'
    }
  },

  createUser: async (userData) => {
    try {
      const response = await api.post('/users', userData)
      return response.data
    } catch (error) {
      console.error('Error creating user:', error)
      throw error.response?.data?.detail || 
            error.response?.data?.message || 
            error.message || 
            'Error al crear usuario'
    }
  },

  updateUser: async (id, userData) => {
    try {
      const response = await api.put(`/users/${id}`, userData)
      console.log('User updated successfully:', response.data)
      return response.data
    } catch (error) {
      console.error('Error updating user:', error)
      throw error.response?.data?.detail || 
            error.response?.data?.message || 
            error.message || 
            'Error al actualizar usuario'
    }
  },

  deleteUser: async (id) => {
    try {
      const response = await api.delete(`/users/${id}`)
      return response.data
    } catch (error) {
      console.error('Error deleting user:', error)
      throw error.response?.data?.detail || 
            error.response?.data?.message || 
            error.message || 
            'Error al eliminar usuario'
    }
  },

  getRoles: async () => {
    try {
      const response = await api.get('/roles')
      return response.data
    } catch (error) {
      console.error('Error fetching roles:', error)
      throw error.response?.data?.detail || 
            error.response?.data?.message || 
            error.message || 
            'Error al obtener roles'
    }
  }
}