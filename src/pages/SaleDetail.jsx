import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Paper,
  Typography,
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Divider,
  Grid
} from '@mui/material'
import {
  ArrowBack as ArrowBackIcon,
  Receipt as ReceiptIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material'
import PageHeader from '../components/ui/PageHeader'
import LoadingIndicator from '../components/ui/LoadingIndicator'
import salesService from '../services/salesService'

function SaleDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [sale, setSale] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchSale = async () => {
      try {
        setLoading(true)
        const data = await salesService.getSale(id)
        setSale(data)
      } catch (err) {
        console.error('Error al obtener venta:', err)
        setError('Error al cargar los detalles de la venta')
      } finally {
        setLoading(false)
      }
    }
    
    fetchSale()
  }, [id])

  // Mejorar manejo de factura:
const handleGenerateInvoice = async () => {
  try {
    setLoading(true)
    const pdfBlob = await salesService.generateInvoice(id)
    const url = window.URL.createObjectURL(new Blob([pdfBlob]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `factura_${sale.invoice_number}.pdf`)
    document.body.appendChild(link)
    link.click()
    link.parentNode.removeChild(link)
  } catch (error) {
    console.error('Error al generar factura:', error)
    setError(error.message || 'Error al generar la factura')
  } finally {
    setLoading(false)
  }
}

  const handleEdit = () => {
    navigate(`/ventas/editar/${id}`)
  }

  const handleDelete = async () => {
    if (window.confirm('¿Estás seguro de eliminar esta venta?')) {
      try {
        await salesService.deleteSale(id)
        navigate('/ventas')
      } catch (error) {
        console.error('Error al eliminar venta:', error)
        setError(error.message)
      }
    }
  }

  if (loading) return <LoadingIndicator message="Cargando detalles de venta..." />
  if (error) return <Alert severity="error">{error}</Alert>
  if (!sale) return <Alert severity="warning">Venta no encontrada</Alert>

  return (
    <>
      <PageHeader 
        title={`Venta #${sale.invoice_number}`} 
        subtitle="Detalles completos de la venta"
        breadcrumbs={[
          { label: 'Dashboard', path: '/' },
          { label: 'Ventas', path: '/ventas' },
          { label: `Venta #${sale.invoice_number}` }
        ]}
        action={
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<ReceiptIcon />}
              onClick={handleGenerateInvoice}
            >
              Generar Factura
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              startIcon={<EditIcon />}
              onClick={handleEdit}
            >
              Editar
            </Button>
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={handleDelete}
            >
              Eliminar
            </Button>
          </Box>
        }
      />

      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>Información General</Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Typography><strong>Fecha:</strong> {new Date(sale.sale_date).toLocaleString('es-MX')}</Typography>
            <Typography><strong>Cliente:</strong> {sale.client?.full_name || 'No especificado'}</Typography>
            <Typography><strong>NIT/CI:</strong> {sale.client?.ci_nit || 'No especificado'}</Typography>
            <Typography><strong>Sucursal:</strong> {sale.branch?.name || 'No especificada'}</Typography>
            <Typography><strong>Método de Pago:</strong> {sale.payment_method}</Typography>
            <Typography>
              <strong>Estado:</strong> 
              <Chip 
                label={sale.status} 
                color={sale.status === 'COMPLETADA' ? 'success' : 'warning'} 
                size="small" 
                sx={{ ml: 1 }}
              />
            </Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>Totales</Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Typography><strong>Subtotal:</strong> ${sale.subtotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</Typography>
            <Typography><strong>Descuento:</strong> ${sale.discount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</Typography>
            <Typography variant="h6">
              <strong>Total:</strong> ${sale.total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>Productos</Typography>
            <Divider sx={{ mb: 2 }} />
            
            <TableContainer component={Paper} elevation={0} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Producto</TableCell>
                    <TableCell align="right">Cantidad</TableCell>
                    <TableCell align="right">Precio Unitario</TableCell>
                    <TableCell align="right">Descuento</TableCell>
                    <TableCell align="right">Subtotal</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sale.details.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{item.product?.name || 'Producto no encontrado'}</TableCell>
                      <TableCell align="right">{item.quantity}</TableCell>
                      <TableCell align="right">
                        ${item.unit_price.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell align="right">
                        ${item.discount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell align="right">
                        ${item.total_line.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
        </Grid>
      </Paper>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/ventas')}
        >
          Volver a Ventas
        </Button>
      </Box>
    </>
  )
}

export default SaleDetail