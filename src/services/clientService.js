// clientService.js
import api from './api'

export default {
  // Buscar clientes (puedes usar nit o name)
  searchClients: async (query) => {
  try {
    const response = await api.get('/clients/search', {
      params: { 
        search_term: query  // Usamos el nuevo parámetro
      }
    })
    return response.data
  } catch (error) {
    console.error('Error searching clients:', error)
    throw error
  }
},

  // Otros métodos del servicio...
  getClient: async (id) => {
    const response = await api.get(`/clients/${id}`)
    return response.data
  },
  
  createClient: async (clientData) => {
    const response = await api.post('/clients', clientData)
    return response.data
  },
  
  updateClient: async (id, clientData) => {
    const response = await api.put(`/clients/${id}`, clientData)
    return response.data
  }
}