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
  MenuItem,
  Alert
} from '@mui/material'
import {
  KeyboardArrowDown as KeyboardArrowDownIcon,
  KeyboardArrowUp as KeyboardArrowUpIcon,
  Visibility as VisibilityIcon,
  Download as DownloadIcon,
  FilterList as FilterListIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Receipt as ReceiptIcon
} from '@mui/icons-material'
import { Bar } from 'react-chartjs-2'
import { useNavigate } from 'react-router-dom'
import PageHeader from '../components/ui/PageHeader'
import LoadingIndicator from '../components/ui/LoadingIndicator'
import salesService from '../services/salesService'
import productService from '../services/productService'
import { formatQuantity } from '../utils/format'

// Componente de fila expandible para detalles de venta
function SaleRow({ sale, onDelete }) {
  const [open, setOpen] = useState(false)
   const navigate = useNavigate()

  const handleViewDetails = () => {
    navigate(`/ventas/${sale.sale_id}`)
  }

  const handleGenerateInvoice = async () => {
    try {
      const pdfBlob = await salesService.generateInvoice(sale.sale_id);
      const url = window.URL.createObjectURL(new Blob([pdfBlob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `factura_${sale.invoice_number}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (error) {
      console.error('Error al generar factura:', error);
      alert(error.message);
    }
  };

  const actions = [
    {
      icon: <VisibilityIcon fontSize="small" />,
      color: 'primary',
      handler: () => navigate(`/ventas/${sale.sale_id}`)
    },
    {
      icon: <EditIcon fontSize="small" />,
      color: 'secondary',
      handler: () => navigate(`/ventas/editar/${sale.sale_id}`)
    },
    {
      icon: <DeleteIcon fontSize="small" />,
      color: 'error',
      handler: async () => {
        if (window.confirm('¿Estás seguro de eliminar esta venta?')) {
          try {
            await onDelete(sale.sale_id);
          } catch (error) {
            console.error('Error al eliminar venta:', error);
          }
        }
      }
    },
    {
      icon: <ReceiptIcon fontSize="small" />,
      color: 'success',
      handler: handleGenerateInvoice
    }
  ];

  const handleEdit = () => {
    navigate(`/ventas/editar/${sale.sale_id}`)
  }

  const handleDelete = async () => {
    if (window.confirm('¿Estás seguro de eliminar esta venta?')) {
      try {
        await onDelete(sale.sale_id) // Usamos la prop onDelete
      } catch (error) {
        console.error('Error al eliminar venta:', error)
      }
    }
  }

  const getStatusInfo = (status) => {
    if (typeof status === 'object') {
      return {
        label: status.label,
        color: status.color
      };
    }
    
    return {
      label: status || 'COMPLETADA',
      color: status === 'COMPLETADA' 
        ? 'success' 
        : status === 'CANCELADA' 
          ? 'error' 
          : 'warning'
    };
  };

  // En tu componente:
  const statusInfo = getStatusInfo(sale.status);

  

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
          {new Date(sale.sale_date).toLocaleDateString('es-MX', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </TableCell>
        <TableCell>{sale.client?.full_name || sale || 'Cliente no especificado'}</TableCell>
        <TableCell>{sale.client?.ci_nit || sale.client?.nit || 'N/A'}</TableCell>
        <TableCell align="right">
          ${sale.total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
        </TableCell>
        <TableCell>
          {sale.payment_method?.name || 
          sale.payment_method || 
          'Método no especificado'}
        </TableCell>
        <TableCell>
          <Chip
            label={statusInfo.label}
            color={statusInfo.color}
            size="small"
          />
        </TableCell>
        <TableCell>{sale.branch?.name || 'Sucursal no especificada'}</TableCell>
        <TableCell align="center">
          <IconButton size="small" color="primary" onClick={handleViewDetails}>
            <VisibilityIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" color="error" onClick={handleDelete}>
            <DeleteIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" color="success" onClick={handleGenerateInvoice}>
            <ReceiptIcon fontSize="small" />
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
                  {sale.details.map((item) => (
                    <TableRow key={`${sale.sale_id}-${item.product_id}`}>
                      <TableCell component="th" scope="row">
                        {item.product?.name || 'Producto no encontrado'}
                      </TableCell>
                      <TableCell align="right">{formatQuantity(item.quantity)}</TableCell>
                      <TableCell align="right">
                        ${item.unit_price.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell align="right">
                        ${item.total_line.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
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
  const navigate = useNavigate()
  const [sales, setSales] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [reportData, setReportData] = useState(null)
  const [branches, setBranches] = useState([])
  const [filters, setFilters] = useState({
    dateRange: 'week',
    status: 'all',
    branch: 'all'
  })

  useEffect(() => {
    fetchSales()
    fetchReportData()
  }, [])

 useEffect(() => {
  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [salesData, branchesData] = await Promise.all([
        salesService.getSales(),
        productService.getBranches()
      ]);
      setSales(salesData);
      setBranches(branchesData);
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
  const fetchBranches = async () => {
    try {
      const data = await productService.getBranches();
      setBranches(data);
    } catch (err) {
      console.error('Error al obtener sucursales:', err);
    }
  };
  
  fetchBranches();
}, []);

const fetchSales = async () => {
  try {
    setLoading(true);
    const params = {
      status: filters.status !== 'all' ? filters.status : undefined,
      branch_id: filters.branch !== 'all' ? filters.branch : undefined,
      skip: page * rowsPerPage,
      limit: rowsPerPage
    };
    
    const data = await salesService.getSales(params);
    setSales(data);
  } catch (err) {
    console.error('Error al obtener ventas:', err);
    setError(err.message || 'Error al cargar las ventas');
  } finally {
    setLoading(false);
  }
};

// Añade función para manejar eliminación
const handleDeleteSale = async (saleId) => {
  try {
    await salesService.deleteSale(saleId)
    fetchSales() // Refrescar la lista
    fetchReportData() // Actualizar reportes
  } catch (err) {
    console.error('Error al eliminar venta:', err)
    setError(err.message || 'Error al eliminar la venta')
  }
}

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
// Añade esto al useEffect que maneja cambios en los filtros
useEffect(() => {
  if (filters.dateRange) {
    fetchReportData()
  }
}, [filters.dateRange])

  const handleaddSale = () => {
    navigate('/ventas/nueva')
  }

  const handleChangePage = (event, newPage) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

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

  // Paginación de ventas
  const paginatedSales = sales.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)

  return (
    <>
      <PageHeader 
        title="Ventas" 
        subtitle="Administra y analiza las ventas realizadas"
        action={handleaddSale}
        actionLabel="Nueva Venta"
        actionIcon={<AddIcon />}
        breadcrumbs={[
          { label: 'Dashboard', path: '/' },
          { label: 'Ventas' }
        ]}
        
      />

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

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
                    {branches.map(branch => (
                      <MenuItem key={branch.id} value={branch.id}>
                        {branch.name}
                      </MenuItem>
                    ))}
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
                      <TableCell>NIT</TableCell>
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
                        <SaleRow 
                          key={sale.sale_id}  // Cambiado de id a sale_id
                          sale={sale} 
                          onDelete={handleDeleteSale}  // Añadido esta prop
                        />
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
      </Grid>
    </>
  )
}

export default Sales