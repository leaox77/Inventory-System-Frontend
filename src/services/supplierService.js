// src/services/supplierService.js
import api from './api';

export const getSuppliers = async () => {
  const response = await api.get('/suppliers');
  return response.data;
};

// En services/supplierService.js
export const createSupplier = async (supplierData) => {
  try {
    const response = await api.post('/suppliers', {
      name: supplierData.name,
      contact_name: supplierData.contact_name || null,
      phone: supplierData.phone || null,
      email: supplierData.email || null,
      address: supplierData.address || null,
      is_active: supplierData.is_active !== false // Default true
    });
    return response.data;
  } catch (error) {
    console.error('Error details:', error.response?.data);
    throw error;
  }
};

export const updateSupplier = async (id, supplierData) => {
  const response = await api.put(`/suppliers/${id}`, supplierData);
  return response.data;
};

export const deleteSupplier = async (id) => {
  const response = await api.delete(`/suppliers/${id}`);
  return response.data;
};

export const getSupplierProducts = async (supplierId) => {
  const response = await api.get(`/suppliers/${supplierId}/products`);
  return response.data;
};

export const createPurchaseOrder = async (orderData) => {
    try {
        // Validación adicional en el cliente
        if (!orderData.items || orderData.items.length === 0) {
            throw new Error('El pedido debe contener al menos un producto');
        }
        
        const response = await api.post('/suppliers/orders/', orderData, {
            headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            }
        });
        
        return response.data;
    } catch (error) {
        console.error('Error details:', error.response?.data);
        throw error;
    }
};

export const approvePurchaseOrder = async (orderId) => {
  const response = await api.post(`/suppliers/orders/${orderId}/approve`);
  return response.data;
};