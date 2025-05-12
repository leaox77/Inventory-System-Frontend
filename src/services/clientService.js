import api from './api'; // Asegúrate de tener tu instancia de axios configurada

const clientService = {
  getClientByNit: async (nit) => {
    try {
      const response = await api.get(`/clients/by_nit/${nit}`);
      return response.data;
    } catch (error) {
      console.error('Error in clientService.getClientByNit:', error);
      throw error.response?.data?.detail || error.message || 'Error al buscar cliente por NIT';
    }
  },
  // ... otras funciones de cliente si las tienes
};

export default clientService;