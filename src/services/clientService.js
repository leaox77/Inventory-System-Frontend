// clientService.js
import api from './api'

export default {
  // Buscar clientes (puedes usar nit o name)
  searchClients: async (query, limit = 20) => {
    try {
      const response = await api.get('/clients/search', {
        params: { 
          search_term: query,
          limit
        }
      })
      return response.data
    } catch (error) {
      console.error('Error searching clients:', error)
      throw error.response?.data?.detail || 
            error.response?.data?.message || 
            error.message || 
            'Error al buscar clientes'
    }
  },

  // Otros métodos del servicio...
  getClients: async (params = {}) => {
    try {
      const response = await api.get('/clients', { params })
      return response.data
    } catch (error) {
      console.error('Error fetching clients:', error)
      throw error.response?.data?.detail || 
            error.response?.data?.message || 
            error.message || 
            'Error al obtener clientes'
    }
  },

  getClient: async (id) => {
    try {
      const response = await api.get(`/clients/${id}`)
      return response.data
    } catch (error) {
      console.error('Error fetching client:', error)
      throw error.response?.data?.detail || 
            error.response?.data?.message || 
            error.message || 
            'Error al obtener cliente'
    }
  },

  createClient: async (clientData) => {
    try {
      const response = await api.post('/clients', clientData)
      return response.data
    } catch (error) {
      console.error('Error creating client:', error)
      throw error.response?.data?.detail || 
            error.response?.data?.message || 
            error.message || 
            'Error al crear cliente'
    }
  },

  updateClient: async (id, clientData) => {
    try {
      const response = await api.put(`/clients/${id}`, clientData)
      return response.data
    } catch (error) {
      console.error('Error updating client:', error)
      throw error.response?.data?.detail || 
            error.response?.data?.message || 
            error.message || 
            'Error al actualizar cliente'
    }
  },

  deleteClient: async (id) => {
    try {
      const response = await api.delete(`/clients/${id}`)
      return response.data
    } catch (error) {
      console.error('Error deleting client:', error)
      throw error.response?.data?.detail || 
            error.response?.data?.message || 
            error.message || 
            'Error al eliminar cliente'
    }
  }
}