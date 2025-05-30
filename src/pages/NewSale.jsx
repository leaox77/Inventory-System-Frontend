import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Paper, Grid, TextField, Button, Box, Typography, 
  Divider, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, IconButton, FormControl, InputLabel,
  Select, MenuItem, Alert, Autocomplete, useTheme, useMediaQuery
} from '@mui/material'
import { 
  Save as SaveIcon, Cancel as CancelIcon, 
  Add as AddIcon, Delete as DeleteIcon 
} from '@mui/icons-material'
import { debounce } from 'lodash'
import PageHeader from '../components/ui/PageHeader'
import LoadingIndicator from '../components/ui/LoadingIndicator'
import ClientSearch from '../components/ui/ClientSearch'
import salesService from '../services/salesService'
import productService from '../services/productService'

function NewSale() {
  const navigate = useNavigate()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  
  const [formData, setFormData] = useState({
    client_id: '',
    branch_id: '',
    payment_method_id: '',
    discount: 0,
    items: []
  })
  
  const [products, setProducts] = useState([])
  const [branches, setBranches] = useState([])
  const [paymentMethods, setPaymentMethods] = useState([])
  const [selectedClient, setSelectedClient] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [productSearch, setProductSearch] = useState('')

  // Búsqueda debounceada de productos
  const fetchProducts = debounce(async (search) => {
    try {
      const data = await productService.getProducts({ 
        limit: 200,
        search 
      })
      setProducts(data.items)
    } catch (err) {
      console.error('Error fetching products:', err)
    }
  }, 300)

  useEffect(() => {
    fetchProducts(productSearch)
    return () => fetchProducts.cancel()
  }, [productSearch])

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [branchesData, methodsData] = await Promise.all([
          productService.getBranches(),
          salesService.getPaymentMethods()
        ])
        setBranches(branchesData)
        setPaymentMethods(methodsData)
      } catch (err) {
        console.error('Error al cargar datos:', err)
        setError('Error al cargar los datos necesarios')
      }
    }
    fetchInitialData()
  }, [])

  const handleAddItem = () => {
    setFormData({
      ...formData,
      items: [
        ...formData.items,
        { product_id: '', quantity: 1, unit_price: 0, discount: 0 }
      ]
    })
  }

  const handleRemoveItem = (index) => {
    const newItems = [...formData.items]
    newItems.splice(index, 1)
    setFormData({ ...formData, items: newItems })
  }

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items]
    newItems[index][field] = value
    
    if (field === 'product_id') {
      const product = products.find(p => p.product_id === value)
      if (product) {
        newItems[index].unit_price = product.price
      }
    }
    
    setFormData({ ...formData, items: newItems })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      setError(null)
      
      if (!formData.branch_id) {
        throw new Error('Debes seleccionar una sucursal')
      }
      
      if (formData.items.length === 0) {
        throw new Error('Debes agregar al menos un producto')
      }

      if (!formData.payment_method_id) {
        throw new Error('Debes seleccionar un método de pago')
      }

      // Verificar stock
      const stockErrors = []
      for (const item of formData.items) {
        const productStock = await productService.getProductInventory(item.product_id)
        const branchStock = productStock.find(s => s.branch_id === formData.branch_id)
        
        if (!branchStock || branchStock.quantity < item.quantity) {
          const product = products.find(p => p.product_id === item.product_id)
          stockErrors.push(
            `Stock insuficiente para ${product?.name || 'producto'}. ` +
            `Disponible: ${branchStock?.quantity || 0}, ` +
            `Solicitado: ${item.quantity}`
          )
        }
      }
      
      if (stockErrors.length > 0) {
        throw new Error(stockErrors.join('\n'))
      }

      const saleData = {
        client_id: formData.client_id || null,
        branch_id: formData.branch_id,
        payment_method_id: formData.payment_method_id,
        discount: formData.discount.toString(),
        items: formData.items.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity.toString(),
          unit_price: item.unit_price.toString(),
          discount: (item.discount || 0).toString() 
        }))
      }

      const createdSale = await salesService.createSale(saleData)
      setSuccess('Venta creada exitosamente')
      setTimeout(() => navigate('/ventas/'), 1500)
    } catch (err) {
      console.error('Error al crear venta:', err)
      setError(err.message || 'Error al crear la venta')
    } finally {
      setLoading(false)
    }
  }

  // Calcular totales
  const subtotal = formData.items.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0)
  const total = subtotal - formData.discount

  return (
    <>
      <PageHeader 
        title="Nueva Venta" 
        subtitle="Registra una nueva venta en el sistema"
        breadcrumbs={[
          { label: 'Dashboard', path: '/' },
          { label: 'Ventas', path: '/ventas' },
          { label: 'Nueva Venta' }
        ]}
      />

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      <Paper component="form" elevation={2} sx={{ p: 2, borderRadius: 2 }} onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          {/* Sección Cliente y Sucursal */}
          <Grid item xs={12} sm={6}>
            <ClientSearch 
              value={selectedClient}
              onChange={(client) => {
                setSelectedClient(client)
                setFormData({...formData, client_id: client?.client_id || null})
              }}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth size="small">
              <InputLabel id="branch-label">Sucursal *</InputLabel>
              <Select
                labelId="branch-label"
                value={formData.branch_id}
                onChange={(e) => setFormData({...formData, branch_id: e.target.value})}
                label="Sucursal *"
                required
              >
                {branches.map((branch) => (
                  <MenuItem key={`branch-${branch.id}`} value={branch.id}>
                    {branch.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Método de Pago */}
          <Grid item xs={12}>
            <FormControl fullWidth size="small">
              <InputLabel id="payment-label">Método de Pago *</InputLabel>
              <Select
                labelId="payment-label"
                value={formData.payment_method_id}
                onChange={(e) => setFormData({...formData, payment_method_id: e.target.value})}
                label="Método de Pago *"
                required
              >
                {paymentMethods.map((method) => (
                  <MenuItem key={`payment-${method.payment_method_id}`} value={method.payment_method_id}>
                    {method.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Productos */}
          <Grid item xs={12}>
            <Divider sx={{ my: 1 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="subtitle1">Productos</Typography>
              <Button
                variant="outlined"
                size="small"
                startIcon={<AddIcon />}
                onClick={handleAddItem}
              >
                Agregar
              </Button>
            </Box>

            <TableContainer component={Paper} elevation={0} variant="outlined" sx={{ maxHeight: isMobile ? '300px' : 'none' }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>Producto</TableCell>
                    {!isMobile && <TableCell align="right">Precio</TableCell>}
                    <TableCell align="right">Cant</TableCell>
                    {!isMobile && <TableCell align="right">Desc.</TableCell>}
                    <TableCell align="right">Total</TableCell>
                    <TableCell width={40}></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {formData.items.map((item, index) => (
                    <TableRow key={`row-${index}-${item.product_id || 'new'}`}>
                      <TableCell sx={{ p: 1 }}>
                        <Autocomplete
                          options={products}
                          value={products.find(p => p.product_id === item.product_id) || null}
                          onChange={(_, newValue) => handleItemChange(index, 'product_id', newValue?.product_id || '')}
                          getOptionLabel={(option) => isMobile ? option.name : `${option.name} - $${option.price.toFixed(2)}`}
                          isOptionEqualToValue={(option, value) => option.product_id === value?.product_id}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              size="small"
                              fullWidth
                              placeholder="Buscar producto"
                            />
                          )}
                          noOptionsText="No hay productos"
                        />
                      </TableCell>
                      {!isMobile && (
                        <TableCell align="right">
                          ${item.unit_price.toFixed(2)}
                        </TableCell>
                      )}
                      <TableCell sx={{ p: 1 }}>
                        <TextField
                          type="number"
                          size="small"
                          fullWidth
                          value={item.quantity}
                          onChange={(e) => handleItemChange(index, 'quantity', parseFloat(e.target.value) || 0)}
                          inputProps={{ min: 1, step: 1 }}
                          sx={{ maxWidth: '80px' }}
                        />
                      </TableCell>
                      {!isMobile && (
                        <TableCell sx={{ p: 1 }}>
                          <TextField
                            type="number"
                            size="small"
                            fullWidth
                            value={item.discount}
                            onChange={(e) => handleItemChange(index, 'discount', parseFloat(e.target.value) || 0)}
                            inputProps={{ min: 0, step: 0.01 }}
                            sx={{ maxWidth: '80px' }}
                          />
                        </TableCell>
                      )}
                      <TableCell align="right" sx={{ p: 1 }}>
                        ${((item.unit_price * item.quantity) - item.discount).toFixed(2)}
                      </TableCell>
                      <TableCell sx={{ p: 1 }}>
                        <IconButton 
                          onClick={() => handleRemoveItem(index)} 
                          size="small"
                          color="error"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>

          {/* Totales */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              size="small"
              label="Descuento General"
              type="number"
              value={formData.discount}
              onChange={(e) => setFormData({...formData, discount: parseFloat(e.target.value) || 0})}
              inputProps={{ min: 0, step: 0.01 }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <Box sx={{ 
              p: 1, 
              bgcolor: theme.palette.grey[100], 
              borderRadius: 1,
              textAlign: 'right'
            }}>
              <Typography variant="body2">
                Subtotal: ${subtotal.toFixed(2)}
              </Typography>
              <Typography variant="body2">
                Descuento: ${formData.discount.toFixed(2)}
              </Typography>
              <Typography variant="subtitle1" sx={{ mt: 0.5, fontWeight: 'bold' }}>
                Total: ${total.toFixed(2)}
              </Typography>
            </Box>
          </Grid>

          {/* Botones */}
          <Grid item xs={12}>
            <Divider sx={{ my: 1 }} />
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
              <Button
                variant="outlined"
                size={isMobile ? "small" : "medium"}
                onClick={() => navigate('/ventas')}
                startIcon={<CancelIcon />}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="contained"
                size={isMobile ? "small" : "medium"}
                startIcon={<SaveIcon />}
                disabled={loading || formData.items.length === 0}
                sx={{
                  bgcolor: theme.palette.success.main,
                  '&:hover': { bgcolor: theme.palette.success.dark }
                }}
              >
                {loading ? 'Guardando...' : 'Guardar Venta'}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </>
  )
}

export default NewSale