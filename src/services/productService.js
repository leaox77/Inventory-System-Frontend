import { getUnit } from '@mui/material/styles/cssUtils'
import api from './api'

const productService = {
  getProducts: async (params = {}) => {
    const response = await api.get('/products', { params })
    return response.data
  },

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
      id: category.id,
      name: category.name
    }))
  },

  getBranches: async () => {
    const response = await api.get('/inventory/branches')
    return response.data.map(branch => ({
      id: branch.branch_id,
      name: branch.name
    }))
  },

  searchProducts: async (filters) => {
    const response = await api.get('/products', { params: filters })
    return response.data
  },

  getProductByName: async (name) => {
    const response = await api.get('/products/search/', { params: { name } })
    if (!response.data) {
      throw new Error('Producto no encontrado')
    }
    return response.data
  },

  getMinStock: async (id) => {
    const response = await api.get(`/products/${id}/min_stock`)
    return response.data.min_stock
  }
}

export default productService