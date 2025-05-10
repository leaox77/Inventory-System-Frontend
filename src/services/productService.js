import api from './api'

const productService = {
  getProducts: async (params = {}) => {
    try {
      // Limpiar parámetros undefined/null/empty
      const cleanParams = Object.fromEntries(
        Object.entries(params)
          .filter(([_, v]) => v !== undefined && v !== null && v !== '')
      );

      const response = await api.get('/products', {
        params: cleanParams,
        paramsSerializer: {
          indexes: null // Para arrays, pero no es necesario en este caso
        }
      });

      // Validar estructura de respuesta
      if (!response.data || typeof response.data !== 'object') {
        throw new Error('Respuesta del servidor inválida');
      }

      return {
        items: Array.isArray(response.data.items) ? response.data.items : [],
        total: Number(response.data.total) || 0,
        skip: Number(response.data.skip) || 0,
        limit: Number(response.data.limit) || (params.limit || 10)
      };
    } catch (error) {
      console.error('Error en productService.getProducts:', error);
      // Mejorar el mensaje de error para el usuario
      const errorMessage = error.response?.data?.detail || 
                         error.response?.data?.message || 
                         error.message || 
                         'Error desconocido al obtener productos';
      throw new Error(errorMessage);
    }
  },

  searchProducts: async (filters) => {
    const response = await api.get('/products/search', { 
      params: {
        name: filters.search,
        skip: filters.skip,
        limit: filters.limit
      }
    })
    return {
      items: response.data.items,
      total: response.data.total,
      skip: response.data.skip,
      limit: response.data.limit
    }
  },

  // Mantener los demás métodos igual...
  getProduct: async (id) => {
    const response = await api.get(`/products/${id}`)
    return response.data
  },

  createProduct: async (productData) => {
    const response = await api.post('/products', productData)
    return response.data
  },

  updateProduct: async (id, productData) => {
    const response = await api.put(`/products/${id}`, productData)
    return response.data
  },

  deleteProduct: async (id) => {
    const response = await api.delete(`/products/${id}`)
    return response.status === 204
  },

  getCategories: async () => {
    const response = await api.get('/categories')
    return response.data.map(category => ({
      id: category.id || category.category_id,
      name: category.name || category.category_name
    }))
  },

  getBranches: async () => {
    const response = await api.get('/inventory/branches')
    return response.data.map(branch => ({
      id: branch.branch_id || branch.id,
      name: branch.name
    }))
  },

  getUnitTypes: async () => {
    const response = await api.get('/unit-types')
    return response.data.map(unitType => ({
      id: unitType.id || unitType.unit_type_id,
      name: unitType.name || unitType.unit_type_name
    }))
  },

  getMinStock: async (id) => {
    const response = await api.get(`/products/${id}/min_stock`)
    return response.data.min_stock || response.data
  }
}

export default productService