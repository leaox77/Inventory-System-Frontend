// services/salesService.js
import api from './api'

const salesService = {
  // Obtener todas las ventas
  // Get all sales with filters
  getSales: async (params = {}) => {
  try {
    // Limpia parámetros undefined
    const cleanParams = Object.fromEntries(
      Object.entries(params)
        .filter(([_, v]) => v !== undefined && v !== 'all')
    );
    
    const response = await api.get('/sales', { params: cleanParams });
    return response.data.map(sale => ({
      ...sale,
      client: {
        full_name: sale.client?.full_name || 'Cliente no especificado',
        ci_nit: sale.client?.ci_nit || 'N/A'
      },
      branch: {
        name: sale.branch?.name || 'Sucursal no especificada'
      },
      status: sale.status?.label || sale.status || 'COMPLETADA',
      payment_method: sale.payment_method?.name || 'Método de pago no especificado',
    }));
  } catch (error) {
    console.error('Error in salesService.getSales:', error);
    throw error.response?.data?.detail || 
          error.response?.data?.message || 
          error.message || 
          'Error fetching sales';
  }
},
  // Get a single sale by ID
  getSale: async (id) => {
    try {
      const response = await api.get(`/sales/${id}`)
      return response.data
    } catch (error) {
      console.error('Error in salesService.getSale:', error)
      throw error.response?.data?.detail || 
            error.response?.data?.message || 
            error.message || 
            'Error fetching sale'
    }
  },

  getPaymentMethods: async () => {
    const response = await api.get('/payment-methods');
    return response.data;
  },
  // Create a new sale
  createSale: async (saleData) => {
    try {
      const response = await api.post('/sales', saleData)
      return response.data
    } catch (error) {
      console.error('Error in salesService.createSale:', error)
      throw error.response?.data?.detail || 
            error.response?.data?.message || 
            error.message || 
            'Error creating sale'
    }
  },

  // Update a sale
  updateSale: async (id, saleData) => {
    try {
      const response = await api.put(`/sales/${id}`, saleData)
      return response.data
    } catch (error) {
      console.error('Error in salesService.updateSale:', error)
      throw error.response?.data?.detail || 
            error.response?.data?.message || 
            error.message || 
            'Error updating sale'
    }
  },
  // Delete a sale
  deleteSale: async (id) => {
    try {
      await api.delete(`/sales/${id}`)
      return { success: true, message: 'Sale deleted successfully' }
    } catch (error) {
      console.error('Error in salesService.deleteSale:', error)
      throw error.response?.data?.detail || 
            error.response?.data?.message || 
            error.message || 
            'Error deleting sale'
    }
  },
  // Generate invoice PDF
  generateInvoice: async (id) => {
    try {
      const response = await api.get(`/sales/${id}/invoice`, {
        responseType: 'blob',
        headers: {
          'Accept': 'application/pdf'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error in salesService.generateInvoice:', error);
      throw error.response?.data?.detail || 
            error.response?.data?.message || 
            error.message || 
            'Error generating invoice';
    }
},
  // Get sales summary
  getSalesSummary: async ({ start_date, end_date, branch_id } = {}) => {
    try {
      const response = await api.get('/sales/report/summary', { 
        params: { start_date, end_date, branch_id } 
      })
      return response.data
    } catch (error) {
      console.error('Error in salesService.getSalesSummary:', error)
      throw error.response?.data?.detail || 
            error.response?.data?.message || 
            error.message || 
            'Error fetching sales summary'
    }
  },
  // Export sales data
  // Método para exportar ventas
exportSales: async (format, filters = {}) => {
  try {
    const response = await api.get(`/sales/export/${format}`, {
      responseType: format === 'pdf' ? 'blob' : 'arraybuffer',
      params: {
        status: filters.status,
        branch_id: filters.branch_id,
        start_date: filters.start_date,
        end_date: filters.end_date
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error in salesService.exportSales:', error);
    throw error.response?.data?.detail || 
          error.response?.data?.message || 
          error.message || 
          'Error exporting sales data';
  }
},

  // Get top products report
  getTopProducts: async ({ category_id, start_date, end_date, limit } = {}) => {
    try {
      const response = await api.get('/sales/report/top-products', { 
        params: { category_id, start_date, end_date, limit } 
      })
      return response.data
    } catch (error) {
      console.error('Error in salesService.getTopProducts:', error)
      throw error.response?.data?.detail || 
            error.response?.data?.message || 
            error.message || 
            'Error fetching top products report'
    }
  },
  // Get sales by date
  getSalesByDate: async (dateRange = 'week') => {
    try {
      const response = await api.get('/sales/report/by-date', { 
        params: { date_range: dateRange } 
      })
      return response.data
    } catch (error) {
      console.error('Error in salesService.getSalesByDate:', error)
      throw error.response?.data?.detail || 
            error.response?.data?.message || 
            error.message || 
            'Error fetching sales by date'
    }
  },

  // obtener ventas por sucursal mediante un filtro, no reporte
  getSalesByBranch: async (branch_id) => {
    try {
      const response = await api.get('/sales/by-branch', { 
        params: { branch_id } 
      })
      return response.data
    } catch (error) {
      console.error('Error in salesService.getSalesByBranch:', error)
      throw error.response?.data?.detail || 
            error.response?.data?.message || 
            error.message || 
            'Error fetching sales by branch'
    }
  }
  
}

export default salesService