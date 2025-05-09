import { useState, useEffect } from 'react'
import { 
  Grid, 
  Card, 
  CardContent, 
  Typography, 
  Paper, 
  Box,
  Divider
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
    salesByBranch: []
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        // En implementación real, obtendríamos estos datos con una sola llamada a un endpoint de dashboard
        const [products, salesReport] = await Promise.all([
          productService.getProducts(),
          salesService.getSalesReport()
        ])
        
        setDashboardData({
          totalSales: salesReport.totalSales,
          salesCount: salesReport.salesCount,
          averageSale: salesReport.averageSale,
          productsCount: products.length,
          lowStockCount: products.filter(p => p.stock < 10).length,
          salesByDate: salesReport.salesByDate,
          salesByCategory: salesReport.salesByCategory,
          salesByBranch: salesReport.salesByBranch
        })
      } catch (error) {
        console.error('Error al cargar datos del dashboard:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchData()
  }, [])

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
                    backgroundColor: 'warning.light', 
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
                    Ventas de Hoy
                  </Typography>
                  <Typography variant="h5" component="div">
                    2
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  Total: $2,799.98
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      <Grid container spacing={3}>
        <Grid item xs={12} lg={8}>
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
              Ventas Diarias
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}>
              <Line 
                data={salesLineChartData} 
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
              Ventas por Categoría
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Doughnut 
                data={salesCategoryChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
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
        
        <Grid item xs={12}>
          <Paper 
            elevation={2}
            sx={{ 
              p: 3, 
              borderRadius: 2, 
              mt: 2 
            }}
          >
            <Typography variant="h6" gutterBottom component="div">
              Ventas por Sucursal
            </Typography>
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