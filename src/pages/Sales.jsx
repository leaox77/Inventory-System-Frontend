import { useState, useEffect } from 'react'
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  IconButton,
  Collapse,
  Box,
  Typography,
  Grid,
  Divider,
  Button,
  TextField,
  MenuItem
} from '@mui/material'
import {
  KeyboardArrowDown as KeyboardArrowDownIcon,
  KeyboardArrowUp as KeyboardArrowUpIcon,
  Visibility as VisibilityIcon,
  Download as DownloadIcon,
  FilterList as FilterListIcon
} from '@mui/icons-material'
import { Bar } from 'react-chartjs-2'
import PageHeader from '../components/ui/PageHeader'
import LoadingIndicator from '../components/ui/LoadingIndicator'
import salesService from '../services/salesService'

// Componente de fila expandible para detalles de venta
function SaleRow({ sale }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <TableRow sx={{ '& > *': { borderBottom: 'unset' }, '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' } }}>
        <TableCell>
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => setOpen(!open)}
          >
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell>
          {new Date(sale.date).toLocaleDateString('es-MX', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </TableCell>
        <TableCell>{sale.client}</TableCell>
        <TableCell align="right">
          ${sale.total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
        </TableCell>
        <TableCell>{sale.payment_method}</TableCell>
        <TableCell>
          <Chip
            label={sale.status}
            color={sale.status === 'Completada' ? 'success' : 'warning'}
            size="small"
          />
        </TableCell>
        <TableCell>{sale.branch}</TableCell>
        <TableCell align="center">
          <IconButton size="small" color="primary">
            <VisibilityIcon fontSize="small" />
          </IconButton>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={8}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 2 }}>
              <Typography variant="h6" gutterBottom component="div">
                Detalles de Venta
              </Typography>
              <Table size="small" aria-label="purchases">
                <TableHead>
                  <TableRow>
                    <TableCell>Producto</TableCell>
                    <TableCell align="right">Cantidad</TableCell>
                    <TableCell align="right">Precio Unitario</TableCell>
                    <TableCell align="right">Subtotal</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sale.items.map((item) => (
                    <TableRow key={item.product_id}>
                      <TableCell component="th" scope="row">
                        {item.product_name}
                      </TableCell>
                      <TableCell align="right">{item.quantity}</TableCell>
                      <TableCell align="right">
                        ${item.price.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell align="right">
                        ${item.subtotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell colSpan={2} />
                    <TableCell align="right"><strong>Total:</strong></TableCell>
                    <TableCell align="right">
                      <Typography variant="subtitle2">
                        ${sale.total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                      </Typography>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  )
}

function Sales() {
  const [sales, setSales] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [reportData, setReportData] = useState(null)
  const [filters, setFilters] = useState({
    dateRange: 'week',
    status: 'all',
    branch: 'all'
  })

  useEffect(() => {
    fetchSales()
    fetchReportData()
  }, [])

  const fetchSales = async () => {
    try {
      setLoading(true)
      const data = await salesService.getSales()
      setSales(data)
    } catch (err) {
      console.error('Error al obtener ventas:', err)
      setError('Error al cargar las ventas. Por favor, intente de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  const fetchReportData = async () => {
    try {
      const data = await salesService.getSalesReport()
      setReportData(data)
    } catch (err) {
      console.error('Error al obtener datos del reporte:', err)
    }
  }

  const handleChangePage = (event, newPage) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  const handleFilterChange = (event) => {
    const { name, value } = event.target
    setFilters({
      ...filters,
      [name]: value
    })
  }

  // Configuración del gráfico de ventas por fecha
  const salesChartData = {
    labels: reportData?.salesByDate.map(item => item.date) || [],
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

  // Configuración para el gráfico de ventas por categoría
  const categorySalesChartData = {
    labels: reportData?.salesByCategory.map(item => item.category) || [],
    datasets: [
      {
        label: 'Ventas por Categoría',
        data: reportData?.salesByCategory.map(item => item.total) || [],
        backgroundColor: [
          'rgba(54, 162, 235, 0.8)',
          'rgba(255, 99, 132, 0.8)',
          'rgba(255, 206, 86, 0.8)',
        ],
        borderWidth: 1
      }
    ]
  }

  // Paginación de ventas
  const paginatedSales = sales.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)

  return (
    <>
      <PageHeader 
        title="Ventas" 
        subtitle="Administra y analiza las ventas realizadas"
        breadcrumbs={[
          { label: 'Dashboard', path: '/' },
          { label: 'Ventas' }
        ]}
      />

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Paper
            elevation={2}
            sx={{ 
              p: 3, 
              height: '100%', 
              borderRadius: 2,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center'
            }}
          >
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Ventas Totales
            </Typography>
            <Typography variant="h3" component="div" sx={{ mb: 1 }}>
              ${reportData?.totalSales.toLocaleString('es-MX', { minimumFractionDigits: 2 }) || '0.00'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total de {reportData?.salesCount || 0} ventas
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Promedio por Venta
            </Typography>
            <Typography variant="h5" component="div">
              ${reportData?.averageSale.toLocaleString('es-MX', { minimumFractionDigits: 2 }) || '0.00'}
            </Typography>
          </Paper>
        </Grid>
        
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

        <Grid item xs={12}>
          <Paper 
            elevation={2}
            sx={{ 
              p: 3, 
              borderRadius: 2 
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" component="div">
                Registro de Ventas
              </Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  select
                  size="small"
                  name="status"
                  label="Estado"
                  value={filters.status}
                  onChange={handleFilterChange}
                  sx={{ minWidth: 150 }}
                >
                  <MenuItem value="all">Todos</MenuItem>
                  <MenuItem value="completed">Completadas</MenuItem>
                  <MenuItem value="pending">Pendientes</MenuItem>
                </TextField>
                <TextField
                  select
                  size="small"
                  name="branch"
                  label="Sucursal"
                  value={filters.branch}
                  onChange={handleFilterChange}
                  sx={{ minWidth: 150 }}
                >
                  <MenuItem value="all">Todas</MenuItem>
                  <MenuItem value="central">Central</MenuItem>
                  <MenuItem value="norte">Norte</MenuItem>
                  <MenuItem value="sur">Sur</MenuItem>
                  <MenuItem value="este">Este</MenuItem>
                  <MenuItem value="oeste">Oeste</MenuItem>
                </TextField>
                <Button 
                  variant="outlined"
                  startIcon={<FilterListIcon />}
                >
                  Filtrar
                </Button>
                <Button 
                  variant="contained" 
                  startIcon={<DownloadIcon />}
                >
                  Exportar
                </Button>
              </Box>
            </Box>

            {loading ? (
              <LoadingIndicator message="Cargando ventas..." />
            ) : (
              <TableContainer>
                <Table aria-label="collapsible table">
                  <TableHead>
                    <TableRow>
                      <TableCell width={50} />
                      <TableCell>Fecha</TableCell>
                      <TableCell>Cliente</TableCell>
                      <TableCell align="right">Total</TableCell>
                      <TableCell>Método de Pago</TableCell>
                      <TableCell>Estado</TableCell>
                      <TableCell>Sucursal</TableCell>
                      <TableCell align="center">Acciones</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginatedSales.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} align="center">
                          No se encontraron ventas
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedSales.map((sale) => (
                        <SaleRow key={sale.id} sale={sale} />
                      ))
                    )}
                  </TableBody>
                </Table>
                <TablePagination
                  rowsPerPageOptions={[5, 10, 25]}
                  component="div"
                  count={sales.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                  labelRowsPerPage="Filas por página:"
                  labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
                />
              </TableContainer>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper 
            elevation={2}
            sx={{ 
              p: 3, 
              borderRadius: 2 
            }}
          >
            <Typography variant="h6" gutterBottom component="div">
              Ventas por Categoría
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Box sx={{ height: 300 }}>
                  <Bar 
                    data={categorySalesChartData}
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
              </Grid>
              <Grid item xs={12} md={6}>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Categoría</TableCell>
                        <TableCell align="right">Ventas</TableCell>
                        <TableCell align="right">Porcentaje</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {reportData?.salesByCategory.map((item) => {
                        const percentage = (item.total / reportData.totalSales) * 100;
                        return (
                          <TableRow key={item.category}>
                            <TableCell>{item.category}</TableCell>
                            <TableCell align="right">
                              ${item.total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                            </TableCell>
                            <TableCell align="right">
                              {percentage.toFixed(2)}%
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </>
  )
}

export default Sales