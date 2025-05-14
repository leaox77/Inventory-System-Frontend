import { useState, useEffect } from 'react'
import { 
  Grid, 
  Card, 
  CardContent, 
  Typography, 
  Paper, 
  Box,
  Divider,
  TextField,
  MenuItem
} from '@mui/material'
import {
  TrendingUp as TrendingUpIcon,
  Inventory as InventoryIcon,
  ShoppingCart as ShoppingCartIcon,
  AttachMoney as AttachMoneyIcon
} from '@mui/icons-material'
import { Line, Bar, Doughnut } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import PageHeader from '../components/ui/PageHeader'
import LoadingIndicator from '../components/ui/LoadingIndicator'
import productService from '../services/productService'
import salesService from '../services/salesService'

// Registrar componentes de ChartJS
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
)

function Dashboard() {
  const [loading, setLoading] = useState(true)
  const [dashboardData, setDashboardData] = useState({
    totalSales: 0,
    salesCount: 0,
    averageSale: 0,
    productsCount: 0,
    lowStockCount: 0,
    salesByDate: [],
    salesByCategory: [],
    salesByBranch: [],
    topProducts: [],
    leastProducts: [],
    branchSales: []
  })
  const [sales, setSales] = useState([])

  const [error, setError] = useState(null)
  const [reportData, setReportData] = useState(null)
  const [filters, setFilters] = useState({
      dateRange: 'week',
      status: 'all',
      branch: 'all'
    })
  
    useEffect(() => {
      fetchReportData()
    }, [])
  
   useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        const [salesData, branchesData] = await Promise.all([
          salesService.getSales()
        ]);
        setSales(salesData);
        await fetchReportData();
      } catch (err) {
        console.error('Error al cargar datos iniciales:', err);
        setError('Error al cargar los datos');
      } finally {
        setLoading(false);
      }
    };
    
    fetchInitialData();
  }, []);

  useEffect(() => {
    // Modifica la función fetchData en tu Dashboard.jsx
const fetchData = async () => {
  try {
    setLoading(true);
    
    // Obtener todos los datos necesarios en paralelo
    const [
      products, 
      salesReport, 
      salesSummary,
      topProducts, 
      leastProducts, 
      branchSales
    ] = await Promise.all([
      productService.getProducts(),
      salesService.getSalesReport(),
      salesService.getSalesSummary(),
      salesService.getTopProducts({ limit: 5 }),
      salesService.getTopProducts({ limit: 5, order: 'asc' }),
      salesService.getSalesByBranch('all')
    ]);
    
    setDashboardData({
      totalSales: salesSummary.totalSales,
      salesCount: salesSummary.salesCount,
      averageSale: salesSummary.averageSale,
      productsCount: products.length,
      lowStockCount: products.filter(p => p.stock < 10).length,
      salesByDate: salesReport.salesByDate,
      salesByCategory: salesReport.salesByCategory,
      salesByBranch: salesReport.salesByBranch,
      topProducts: topProducts,
      leastProducts: leastProducts,
      branchSales: branchSales
    });
    
  } catch (error) {
    console.error('Error al cargar datos del dashboard:', error);
    setError('Error al cargar los datos del dashboard');
  } finally {
    setLoading(false);
  }
};
    
    fetchData()
  }, [])

  const fetchReportData = async () => {
    try {
      setLoading(true)
      
      // Obtener datos para los reportes
      const [byDate] = await Promise.all([
        salesService.getSalesByDate(filters.dateRange),
      ])
      
      // Calcular totales
      const totalSales = byDate.reduce((sum, item) => sum + item.total, 0)
      const salesCount = sales.length
      
      setReportData({
        totalSales,
        salesCount,
        averageSale: salesCount ? totalSales / salesCount : 0,
        salesByDate: byDate
      })
      
    } catch (err) {
      console.error('Error al obtener datos del reporte:', err)
      // Puedes mostrar un mensaje de error más específico si lo deseas
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => {
    if (filters.dateRange) {
      fetchReportData()
    }
  }, [filters.dateRange])

  const handleFilterChange = async (event) => {
    const { name, value } = event.target;
    
    // Actualiza los filtros primero
    const newFilters = {
      ...filters,
      [name]: value
    };
    setFilters(newFilters);
  
    // Si es el filtro de sucursal y no es "all", usa getSalesByBranch
    if (name === 'branch' && value !== 'all') {
      try {
        setLoading(true);
        const data = await salesService.getSalesByBranch(value);
        setSales(data);
      } catch (err) {
        console.error('Error al filtrar por sucursal:', err);
        setError(err.message || 'Error al filtrar ventas');
      } finally {
        setLoading(false);
      }
    } else {
      // Para otros filtros o "all", usa el método normal
      fetchSales(newFilters);
    }
  };
  
    // Configuración del gráfico de ventas por fecha
  const salesChartData = {
    labels: reportData?.salesByDate.map(item => {
      const date = new Date(item.date)
      return date.toLocaleDateString('es-MX', { 
        month: 'short', 
        day: 'numeric' 
      })
    }) || [],
    datasets: [
      {
        label: 'Ventas Diarias',
        data: reportData?.salesByDate.map(item => item.total) || [],
        backgroundColor: 'rgba(25, 118, 210, 0.6)',
        borderColor: 'rgba(25, 118, 210, 1)',
        borderWidth: 1
      }
    ]
  }

  // Configuración de gráficos
  const salesLineChartData = {
    labels: dashboardData.salesByDate.map(item => item.date),
    datasets: [
      {
        label: 'Ventas por Día',
        data: dashboardData.salesByDate.map(item => item.total),
        fill: true,
        backgroundColor: 'rgba(25, 118, 210, 0.2)',
        borderColor: 'rgba(25, 118, 210, 1)',
        tension: 0.3
      }
    ]
  }
  
  const salesCategoryChartData = {
    labels: dashboardData.salesByCategory.map(item => item.category),
    datasets: [
      {
        label: 'Ventas por Categoría',
        data: dashboardData.salesByCategory.map(item => item.total),
        backgroundColor: [
          'rgba(54, 162, 235, 0.8)',
          'rgba(255, 99, 132, 0.8)',
          'rgba(255, 206, 86, 0.8)',
          'rgba(75, 192, 192, 0.8)',
          'rgba(153, 102, 255, 0.8)',
        ],
        borderWidth: 1
      }
    ]
  }
  
  const salesBranchChartData = {
    labels: dashboardData.salesByBranch.map(item => item.branch),
    datasets: [
      {
        label: 'Ventas por Sucursal',
        data: dashboardData.salesByBranch.map(item => item.total),
        backgroundColor: [
          'rgba(75, 192, 192, 0.8)',
          'rgba(153, 102, 255, 0.8)',
          'rgba(255, 159, 64, 0.8)',
          'rgba(255, 99, 132, 0.8)',
          'rgba(54, 162, 235, 0.8)',
        ],
      }
    ]
  }

  if (loading) {
    return <LoadingIndicator message="Cargando datos del dashboard..." />
  }

  return (
    <>
      <PageHeader 
        title="Dashboard" 
        subtitle="Resumen del rendimiento de ventas y productos"
      />
      
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} lg={3}>
          <Card 
            elevation={2}
            sx={{ 
              height: '100%',
              borderRadius: 2,
              transition: 'transform 0.3s',
              '&:hover': {
                transform: 'translateY(-5px)'
              }
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box 
                  sx={{ 
                    backgroundColor: 'primary.light', 
                    borderRadius: '50%',
                    width: 40,
                    height: 40,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mr: 2
                  }}
                >
                  <AttachMoneyIcon sx={{ color: 'white' }} />
                </Box>
                <Box>
                  <Typography color="textSecondary" variant="body2" gutterBottom>
                    Ventas Totales
                  </Typography>
                  <Typography variant="h5" component="div">
                    ${dashboardData.totalSales.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
                <TrendingUpIcon sx={{ color: 'success.main', fontSize: 16, mr: 0.5 }} />
                <Typography variant="body2" color="success.main">
                  +15% vs mes anterior
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} lg={3}>
          <Card 
            elevation={2}
            sx={{ 
              height: '100%',
              borderRadius: 2,
              transition: 'transform 0.3s',
              '&:hover': {
                transform: 'translateY(-5px)'
              }
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box 
                  sx={{ 
                    backgroundColor: 'success.light', 
                    borderRadius: '50%',
                    width: 40,
                    height: 40,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mr: 2
                  }}
                >
                  <ShoppingCartIcon sx={{ color: 'white' }} />
                </Box>
                <Box>
                  <Typography color="textSecondary" variant="body2" gutterBottom>
                    Total de Ventas
                  </Typography>
                  <Typography variant="h5" component="div">
                    {dashboardData.salesCount}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  Promedio: ${dashboardData.averageSale.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} lg={3}>
          <Card 
            elevation={2}
            sx={{ 
              height: '100%',
              borderRadius: 2,
              transition: 'transform 0.3s',
              '&:hover': {
                transform: 'translateY(-5px)'
              }
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box 
                  sx={{ 
                    backgroundColor: 'info.light', 
                    borderRadius: '50%',
                    width: 40,
                    height: 40,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mr: 2
                  }}
                >
                  <InventoryIcon sx={{ color: 'white' }} />
                </Box>
                <Box>
                  <Typography color="textSecondary" variant="body2" gutterBottom>
                    Total de Productos
                  </Typography>
                  <Typography variant="h5" component="div">
                    {dashboardData.productsCount}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
                <Typography variant="body2" color={dashboardData.lowStockCount > 0 ? 'warning.main' : 'success.main'}>
                  {dashboardData.lowStockCount} producto(s) con bajo stock
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
       
      </Grid>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
                  <Paper
                    elevation={2}
                    sx={{ 
                      p: 3, 
                      height: '100%', 
                      borderRadius: 2 
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h6" gutterBottom component="div">
                        Ventas por Día
                      </Typography>
                      <TextField
                        select
                        size="small"
                        name="dateRange"
                        value={filters.dateRange}
                        onChange={handleFilterChange}
                        sx={{ minWidth: 150 }}
                      >
                        <MenuItem value="week">Última Semana</MenuItem>
                        <MenuItem value="month">Último Mes</MenuItem>
                        <MenuItem value="year">Último Año</MenuItem>
                      </TextField>
                    </Box>
                    <Box sx={{ height: 220 }}>
                      <Bar 
                        data={salesChartData}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: {
                              display: false
                            },
                            tooltip: {
                              callbacks: {
                                label: function(context) {
                                  return '$' + context.raw.toLocaleString('es-MX', { minimumFractionDigits: 2 });
                                }
                              }
                            }
                          },
                          scales: {
                            y: {
                              beginAtZero: true,
                              ticks: {
                                callback: function(value) {
                                  return '$' + value.toLocaleString('es-MX');
                                }
                              }
                            }
                          }
                        }}
                      />
                    </Box>
                  </Paper>
                </Grid>
        
        <Grid item xs={12} lg={4}>
  <Paper 
    elevation={2}
    sx={{ 
      p: 3, 
      height: '100%', 
      borderRadius: 2,
      display: 'flex',
      flexDirection: 'column'
    }}
  >
    <Typography variant="h6" gutterBottom component="div">
      Productos más vendidos
    </Typography>
    <Divider sx={{ mb: 2 }} />
    <Box sx={{ mb: 3 }}>
      {dashboardData.topProducts.map((product, index) => (
        <Box key={index} sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          mb: 1,
          p: 1,
          backgroundColor: index % 2 === 0 ? 'action.hover' : 'background.paper',
          borderRadius: 1
        }}>
          <Typography variant="body1">
            {product.name}
          </Typography>
          <Typography variant="body1" fontWeight="bold">
            {product.total_sold} unidades
          </Typography>
        </Box>
      ))}
    </Box>
    
    <Typography variant="h6" gutterBottom component="div">
      Productos menos vendidos
    </Typography>
    <Divider sx={{ mb: 2 }} />
    <Box>
      {dashboardData.leastProducts.map((product, index) => (
        <Box key={index} sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          mb: 1,
          p: 1,
          backgroundColor: index % 2 === 0 ? 'action.hover' : 'background.paper',
          borderRadius: 1
        }}>
          <Typography variant="body1">
            {product.name}
          </Typography>
          <Typography variant="body1" fontWeight="bold">
            {product.total_sold} unidades
          </Typography>
        </Box>
      ))}
    </Box>
  </Paper>
</Grid>
        
        <Grid item xs={12}>
  <Paper 
    elevation={2}
    sx={{ 
      p: 3, 
      borderRadius: 2, 
      mt: 2 
    }}
  >
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <Typography variant="h6" gutterBottom component="div">
        Ventas por Sucursal
      </Typography>
      <TextField
        select
        size="small"
        name="branch"
        value={filters.branch}
        onChange={handleFilterChange}
        sx={{ minWidth: 150 }}
      >
        <MenuItem value="all">Todas las sucursales</MenuItem>
        {dashboardData.branchSales.map((branch) => (
          <MenuItem key={branch.branch_id} value={branch.branch_id}>
            {branch.branch_name}
          </MenuItem>
        ))}
      </TextField>
    </Box>
    <Divider sx={{ mb: 2 }} />
    <Box sx={{ height: 300 }}>
      <Bar 
        data={salesBranchChartData}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                callback: function(value) {
                  return '$' + value.toLocaleString('es-MX');
                }
              }
            }
          },
          plugins: {
            tooltip: {
              callbacks: {
                label: function(context) {
                  return '$' + context.raw.toLocaleString('es-MX', { minimumFractionDigits: 2 });
                }
              }
            }
          }
        }}
        height={300}
      />
    </Box>
  </Paper>
</Grid>
      </Grid>
    </>
  )
}

export default Dashboard