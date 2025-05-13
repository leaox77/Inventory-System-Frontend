import api from './api';

const orderService = {
    getOrders: async (params = {}) => {
        try {
            const cleanParams = Object.fromEntries(
                Object.entries(params)
                    .filter(([_, v]) => v !== undefined && v !== null && v !== '')
            );

            const response = await api.get('/orders', {
                params: cleanParams,
                paramsSerializer: { indexes: null }
            });

            return {
                items: response.data.items,
                total: Number(response.data.total) || 0,
                skip: Number(response.data.skip) || 0,
                limit: Number(response.data.limit) || (params.limit || 10)
            };
        } catch (error) {
            console.error('Error in orderService.getOrders:', error);
            const errorMessage = error.response?.data?.detail || 
                                                 error.response?.data?.message || 
                                                 error.message || 
                                                 'Unknown error while fetching orders';
            throw new Error(errorMessage);
        }
    },

    getOrderById: async (id) => {
        const response = await api.get(`/orders/${id}`);
        return response.data;
    },
    updateOrderStatus: async (orderId, status, notes = '') => {
        const response = await api.patch(`/orders/${orderId}/status`, {
            status,
            notes
        });
        return response.data;
    },

    getProducts: async (params = {}) => {
        try {
            const cleanParams = Object.fromEntries(
                Object.entries(params)
                    .filter(([_, v]) => v !== undefined && v !== null && v !== '')
            );

            const response = await api.get('/products', {
                params: cleanParams,
                paramsSerializer: { indexes: null }
            });

            // Ensure all products have cost_price
            const processedItems = response.data.items.map(item => ({
                ...item,
                cost_price: item.cost_price || item.cost || 0 // Use cost_price, cost, or 0 as fallback
            }));

            return {
                items: processedItems,
                total: Number(response.data.total) || 0,
                skip: Number(response.data.skip) || 0,
                limit: Number(response.data.limit) || (params.limit || 10)
            };
        } catch (error) {
            console.error('Error in productService.getProducts:', error);
            const errorMessage = error.response?.data?.detail || 
                                                     error.response?.data?.message || 
                                                     error.message || 
                                                     'Unknown error while fetching products';
            throw new Error(errorMessage);
        }
    }
};
export default orderService;