import api from './api'

// Datos de ejemplo para simulación
const mockSales = [
  {
    id: 1,
    date: '2023-10-15T14:30:00Z',
    client: 'Juan Pérez',
    total: 13499.98,
    status: 'Completada',
    branch: 'Central',
    payment_method: 'Tarjeta',
    items: [
      { product_id: 1, product_name: 'Laptop HP Pavilion', quantity: 1, price: 12999.99, subtotal: 12999.99 },
      { product_id: 5, product_name: 'Cable HDMI', quantity: 2, price: 199.99, subtotal: 399.98 }
    ]
  },
  {
    id: 2,
    date: '2023-10-15T16:45:00Z',
    client: 'María Rodríguez',
    total: 7499.97,
    status: 'Completada',
    branch: 'Norte',
    payment_method: 'Efectivo',
    items: [
      { product_id: 3, product_name: 'Monitor Samsung', quantity: 1, price: 5999.99, subtotal: 5999.99 },
      { product_id: 4, product_name: 'Teclado Mecánico', quantity: 1, price: 899.99, subtotal: 899.99 },
      { product_id: 5, product_name: 'Cable HDMI', quantity: 3, price: 199.99, subtotal: 599.97 }
    ]
  },
  {
    id: 3,
    date: '2023-10-16T09:15:00Z',
    client: 'Carlos López',
    total: 1499.99,
    status: 'Completada',
    branch: 'Sur',
    payment_method: 'Tarjeta',
    items: [
      { product_id: 2, product_name: 'Mouse Logitech', quantity: 1, price: 1499.99, subtotal: 1499.99 }
    ]
  },
  {
    id: 4,
    date: '2023-10-16T11:30:00Z',
    client: 'Ana García',
    total: 12999.99,
    status: 'Pendiente',
    branch: 'Central',
    payment_method: 'Transferencia',
    items: [
      { product_id: 1, product_name: 'Laptop HP Pavilion', quantity: 1, price: 12999.99, subtotal: 12999.99 }
    ]
  },
  {
    id: 5,
    date: '2023-10-16T15:00:00Z',
    client: 'Roberto Sánchez',
    total: 1799.98,
    status: 'Completada',
    branch: 'Este',
    payment_method: 'Efectivo',
    items: [
      { product_id: 4, product_name: 'Teclado Mecánico', quantity: 2, price: 899.99, subtotal: 1799.98 }
    ]
  }
]

// Datos para gráficos y reportes
const mockSalesByDate = [
  { date: '2023-10-10', total: 8500.50 },
  { date: '2023-10-11', total: 12300.75 },
  { date: '2023-10-12', total: 15200.30 },
  { date: '2023-10-13', total: 9800.25 },
  { date: '2023-10-14', total: 11400.80 },
  { date: '2023-10-15', total: 20999.95 },
  { date: '2023-10-16', total: 16299.96 },
]

const mockSalesByCategory = [
  { category: 'Electrónica', total: 31999.97 },
  { category: 'Accesorios', total: 5699.94 },
  { category: 'Cables', total: 999.95 },
]

const mockSalesByBranch = [
  { branch: 'Central', total: 26499.97 },
  { branch: 'Norte', total: 7499.97 },
  { branch: 'Sur', total: 1499.99 },
  { branch: 'Este', total: 1799.98 },
  { branch: 'Oeste', total: 0 },
]

const salesService = {
  // Obtener todas las ventas
  getSales: async () => {
    // Para implementación real:
    // const response = await api.get('/sales')
    // return response.data
    
    // Mock para pruebas:
    return mockSales
  },
  
  // Obtener una venta por ID
  getSale: async (id) => {
    // Para implementación real:
    // const response = await api.get(`/sales/${id}`)
    // return response.data
    
    // Mock para pruebas:
    const sale = mockSales.find(s => s.id === parseInt(id))
    if (!sale) throw new Error('Venta no encontrada')
    return sale
  },
  
  // Crear una nueva venta
  createSale: async (saleData) => {
    // Para implementación real:
    // const response = await api.post('/sales', saleData)
    // return response.data
    
    // Mock para pruebas:
    return {
      ...saleData,
      id: Math.floor(Math.random() * 1000) + 6,
      date: new Date().toISOString(),
      status: 'Completada'
    }
  },
  
  // Obtener datos para reportes
  getSalesReport: async (params) => {
    // Para implementación real:
    // const response = await api.get('/sales/report', { params })
    // return response.data
    
    // Mock para pruebas:
    return {
      totalSales: 37299.91,
      salesCount: 5,
      averageSale: 7459.98,
      salesByDate: mockSalesByDate,
      salesByCategory: mockSalesByCategory,
      salesByBranch: mockSalesByBranch
    }
  }
}

export default salesService