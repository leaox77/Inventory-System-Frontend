// NewSale.jsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Paper,
  Grid,
  TextField,
  Button,
  Box,
  Typography,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Autocomplete
} from '@mui/material'
import {
  Save as SaveIcon,
  Cancel as CancelIcon,
  Add as AddIcon,
  Delete as DeleteIcon
} from '@mui/icons-material'
import { debounce } from 'lodash'
import PageHeader from '../components/ui/PageHeader'
import LoadingIndicator from '../components/ui/LoadingIndicator'
import ClientSearch from '../components/ui/ClientSearch'
import salesService from '../services/salesService'
import productService from '../services/productService'
import clientService from '../services/clientService'

function NewSale() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    client_id: '',
    branch_id: '',
    payment_method_id: '',
    discount: 0,
    items: []
  })
  const [products, setProducts] = useState([])
  const [branches, setBranches] = useState([])
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [clientNit, setClientNit] = useState('');
  const [selectedClient, setSelectedClient] = useState(null);
  const [paymentMethods, setPaymentMethods] = useState([]);

  // Agregar función debounce para búsqueda de productos
const [productSearch, setProductSearch] = useState('')

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
  const fetchPaymentMethods = async () => {
    try {
      const methods = await salesService.getPaymentMethods();
      setPaymentMethods(methods);
    } catch (err) {
      console.error('Error loading payment methods:', err);
    }
  };
  fetchPaymentMethods();
}, []);

  useEffect(() => {
  const fetchData = async () => {
    try {
      const [productsData, branchesData] = await Promise.all([
        productService.getProducts({ limit: 1000 }),
        productService.getBranches()
      ]);
      
      console.log('Branches data:', branchesData); // Verifica la estructura
      setProducts(productsData.items);
      setBranches(branchesData);
    } catch (err) {
      console.error('Error al cargar datos:', err);
      setError('Error al cargar los datos necesarios');
    }
  };
  
  fetchData();
}, []);

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
    
    // Si cambia el producto, actualizar el precio unitario
    if (field === 'product_id') {
      const product = products.find(p => p.product_id === value)
      if (product) {
        newItems[index].unit_price = product.price
      }
    }
    
    setFormData({ ...formData, items: newItems })
  }

  // Actualiza el handleSubmit para verificar stock
const handleSubmit = async (e) => {
  e.preventDefault()
  try {
    setLoading(true)
    setError(null)
    
    // Validación básica
    if (!formData.branch_id) {
      throw new Error('Debes seleccionar una sucursal')
    }
    
    if (formData.items.length === 0) {
      throw new Error('Debes agregar al menos un producto')
    }
    
    // Verificar stock antes de crear la venta
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

    if (!formData.payment_method_id) {
      setError('Debes seleccionar un método de pago');
      return;
    }

    // Convertir los IDs a números
     // Preparar datos para enviar
    const saleData = {
      client_id: formData.client_id || null,
      branch_id: formData.branch_id,
      payment_method_id: formData.payment_method_id,
      discount: formData.discount,
      items: formData.items.map(item => ({
        product_id: item.product_id,
        quantity: item.quantity.toString(),
        unit_price: item.unit_price.toString(),
        discount: (item.discount || 0).toString() 
      }))
    };

    const createdSale = await salesService.createSale(saleData)
    setSuccess('Venta creada exitosamente')
    setTimeout(() => {
      navigate(`/ventas/`)
    }, 1500)
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
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {success}
        </Alert>
      )}

      <Paper component="form" elevation={2} sx={{ p: 3, borderRadius: 2 }} onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <ClientSearch 
                value={selectedClient}
                onChange={(client) => {
                    console.log('Client selected:', client);
                    setSelectedClient(client); // Actualizar el estado selectedClient
                    setFormData({...formData, client_id: client?.client_id || null});
                }}
            />
            </Grid>
            <Grid item xs={12} md={6}>

            <FormControl fullWidth>
                <InputLabel id="branch-label">Sucursal *</InputLabel>
                <Select
                    labelId="branch-label"
                    id="branch_id"
                    name="branch_id"
                    value={formData.branch_id}
                    onChange={(e) => setFormData({...formData, branch_id: e.target.value})}
                    label="Sucursal *"
                    required
                >
                    {branches.map((branch) => (
                    <MenuItem 
                        key={`branch-${branch.id}`} 
                        value={branch.id} // Usa branch_id directamente
                    >
                        {branch.name}
                    </MenuItem>
                    ))}
                </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel id="payment-label">Método de Pago *</InputLabel>
             <Select
                labelId="payment-label"
                id="payment_method_id"
                name="payment_method_id"
                value={formData.payment_method_id} // Asegúrate que esto coincide
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

          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" gutterBottom>
              Productos
            </Typography>
            
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={handleAddItem}
              sx={{ mb: 2 }}
            >
              Agregar Producto
            </Button>

            <TableContainer component={Paper} elevation={0} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Producto</TableCell>
                    <TableCell align="right">Cantidad</TableCell>
                    <TableCell align="right">Precio Unitario</TableCell>
                    <TableCell align="right">Descuento</TableCell>
                    <TableCell align="right">Subtotal</TableCell>
                    <TableCell width={50}></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {formData.items.map((item, index) => (
                    <TableRow key={`row-${index}-${item.product_id || 'new'}`}>
                        <TableCell>
                            <Autocomplete
                            key={`product-${index}`}
                            options={products}
                            value={products.find(p => p.product_id === item.product_id) || null}
                            onChange={(_, newValue) => handleItemChange(index, 'product_id', newValue?.product_id || '')}
                            getOptionLabel={(option) => `${option.name} - $${option.price.toFixed(2)}`}
                            isOptionEqualToValue={(option, value) => option.product_id === value?.product_id}
                            renderInput={(params) => (
                                <TextField
                                {...params}
                                label="Producto"
                                size="small"
                                fullWidth
                                />
                            )}
                            noOptionsText="No hay productos"
                            />
                        </TableCell>
                      <TableCell>
                        <TextField
                          type="number"
                          size="small"
                          fullWidth
                          value={item.quantity}
                          onChange={(e) => handleItemChange(index, 'quantity', parseFloat(e.target.value) || 0)}
                          inputProps={{ min: 1, step: 1 }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        ${item.unit_price.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <TextField
                          type="number"
                          size="small"
                          fullWidth
                          value={item.discount}
                          onChange={(e) => handleItemChange(index, 'discount', parseFloat(e.target.value) || 0)}
                          inputProps={{ min: 0, step: 0.01 }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        ${((item.unit_price * item.quantity) - item.discount).toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <IconButton onClick={() => handleRemoveItem(index)} color="error">
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Descuento General"
              type="number"
              value={formData.discount}
              onChange={(e) => setFormData({...formData, discount: parseFloat(e.target.value) || 0})}
              inputProps={{ min: 0, step: 0.01 }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
              <Typography variant="subtitle1">
                Subtotal: ${subtotal.toFixed(2)}
              </Typography>
              <Typography variant="subtitle1">
                Descuento: ${formData.discount.toFixed(2)}
              </Typography>
              <Typography variant="h6" sx={{ mt: 1 }}>
                Total: ${total.toFixed(2)}
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <Button
                variant="outlined"
                color="inherit"
                onClick={() => navigate('/ventas')}
                startIcon={<CancelIcon />}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                startIcon={<SaveIcon />}
                disabled={loading || formData.items.length === 0}
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