import api from './api'

export const getBranches = async (params = {}) => {
  try {
    const response = await api.get('/branches', { params })
    return response.data
  } catch (error) {
    console.error('Error fetching branches:', error)
    throw error.response?.data?.detail || 
          error.response?.data?.message || 
          error.message || 
          'Error al obtener sucursales'
  }
}

export const getBranch = async (branchId) => {
  try {
    const response = await api.get(`/branches/${branchId}`)
    return response.data
  } catch (error) {
    console.error('Error fetching branch:', error)
    throw error.response?.data?.detail || 
          error.response?.data?.message || 
          error.message || 
          'Error al obtener sucursal'
  }
}

export const createBranch = async (branchData) => {
  try {
    const response = await api.post('/branches/', branchData)
    return response.data
  } catch (error) {
    console.error('Error creating branch:', error)
    throw error.response?.data?.detail || 
          error.response?.data?.message || 
          error.message || 
          'Error al crear sucursal'
  }
}

export const updateBranch = async (branchId, branchData) => {
  try {
    const response = await api.put(`/branches/${branchId}`, branchData)
    return response.data
  } catch (error) {
    console.error('Error updating branch:', error)
    throw error.response?.data?.detail || 
          error.response?.data?.message || 
          error.message || 
          'Error al actualizar sucursal'
  }
}

export const deleteBranch = async (branchId) => {
  try {
    const response = await api.delete(`/branches/${branchId}`)
    return response.data
  } catch (error) {
    console.error('Error deleting branch:', error)
    throw error.response?.data?.detail || 
          error.response?.data?.message || 
          error.message || 
          'Error al eliminar sucursal'
  }
}