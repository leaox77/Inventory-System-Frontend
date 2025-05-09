import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Paper,
  Grid,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  FormHelperText,
  InputAdornment,
  Typography,
  Divider,
  Switch,
  FormControlLabel
} from '@mui/material'
import {
  Save as SaveIcon,
  Cancel as CancelIcon
} from '@mui/icons-material'
import PageHeader from '../components/ui/PageHeader'
import LoadingIndicator from '../components/ui/LoadingIndicator'
import AlertMessage from '../components/ui/AlertMessage'
import productService from '../services/productService'

function ProductForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEditing = !!id
  
  const [formData, setFormData] = useState({
    barcode: '',
    name: '',
    description: '',
    price: '',
    cost: '',
    min_stock: '5',
    category_id: '',
    unit_type: '',
    is_active: true,
    image_url: ''
  })
  
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(isEditing)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  
  const [categories, setCategories] = useState([])
  const [unitTypes, setUnitTypes] = useState([])
  
  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        const [categoriesData, unitTypesData] = await Promise.all([
          productService.getCategories(),
          productService.getUnitTypes()
        ])
        
        setCategories(categoriesData)
        setUnitTypes(unitTypesData)
      } catch (err) {
        console.error('Error al obtener opciones de filtrado:', err)
        setError('Error al cargar los datos de referencia')
      }
    }
    
    fetchFilterOptions()
  }, [])
  
  useEffect(() => {
    const fetchProduct = async () => {
      if (isEditing) {
        try {
          setInitialLoading(true)
          const product = await productService.getProduct(id)
          setFormData({
            barcode: product.barcode || '',
            name: product.name || '',
            description: product.description || '',
            price: product.price ? product.price.toString() : '',
            cost: product.cost ? product.cost.toString() : '',
            min_stock: product.min_stock ? product.min_stock.toString() : '5',
            category_id: product.category_id || '',
            unit_type: product.unit_type || '',
            is_active: product.is_active !== undefined ? product.is_active : true,
            image_url: product.image_url || ''
          })
        } catch (err) {
          console.error('Error al obtener producto:', err)
          setError('Error al cargar los datos del producto')
          navigate('/productos')
        } finally {
          setInitialLoading(false)
        }
      }
    }
    
    fetchProduct()
  }, [id, isEditing, navigate])
  
  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.barcode.trim()) {
      newErrors.barcode = 'El código de barras es requerido'
    }
    
    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido'
    }
    
    if (!formData.price.trim()) {
      newErrors.price = 'El precio es requerido'
    } else if (isNaN(formData.price) || parseFloat(formData.price) <= 0) {
      newErrors.price = 'El precio debe ser un número positivo'
    }
    
    if (formData.cost && (isNaN(formData.cost) || parseFloat(formData.cost) < 0)) {
      newErrors.cost = 'El costo debe ser un número positivo'
    }
    
    if (!formData.min_stock.trim()) {
      newErrors.min_stock = 'El stock mínimo es requerido'
    } else if (isNaN(formData.min_stock) || parseInt(formData.min_stock) < 0) {
      newErrors.min_stock = 'El stock mínimo debe ser un número positivo o cero'
    }
    
    if (!formData.category_id) {
      newErrors.category_id = 'La categoría es requerida'
    }
    
    if (!formData.unit_type) {
      newErrors.unit_type = 'El tipo de unidad es requerido'
    }
    
    if (formData.image_url && !/^https?:\/\/.+/.test(formData.image_url)) {
      newErrors.image_url = 'La URL de la imagen debe ser válida'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }
  
  const handleChange = (e) => {
    const { name, value } = e.target
    
    setFormData({
      ...formData,
      [name]: value
    })
    
    // Limpiar error al escribir
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      })
    }
  }
  
  const handleSwitchChange = (e) => {
    const { name, checked } = e.target
    setFormData({
      ...formData,
      [name]: checked
    })
  }
  
  const handleNumberChange = (e) => {
    const { name, value } = e.target
    // Permitir solo números y un punto decimal para precios y costos
    if ((name === 'price' || name === 'cost') && !/^(\d*\.?\d*)$/.test(value)) {
      return
    }
    // Permitir solo números enteros para stock mínimo
    if (name === 'min_stock' && !/^\d*$/.test(value)) {
      return
    }
    handleChange(e)
  }
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    // Convertir valores numéricos
    const productData = {
      barcode: formData.barcode,
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price),
      cost: formData.cost ? parseFloat(formData.cost) : null,
      min_stock: parseInt(formData.min_stock),
      category_id: formData.category_id,
      unit_type: formData.unit_type,
      is_active: formData.is_active,
      image_url: formData.image_url || null
    }
    
    try {
      setLoading(true)
      
      if (isEditing) {
        await productService.updateProduct(id, productData)
        setSuccess('Producto actualizado correctamente')
      } else {
        await productService.createProduct(productData)
        setSuccess('Producto creado correctamente')
        // Reset form after successful creation
        setFormData({
          barcode: '',
          name: '',
          description: '',
          price: '',
          cost: '',
          min_stock: '5',
          category_id: '',
          unit_type: '',
          is_active: true,
          image_url: ''
        })
      }
      
      // Redireccionar después de un breve retraso para mostrar el mensaje de éxito
      setTimeout(() => {
        navigate('/productos')
      }, 1500)
      
    } catch (err) {
      console.error('Error al guardar producto:', err)
      setError(err.response?.data?.message || 
        (isEditing 
          ? 'Error al actualizar el producto. Por favor, intente de nuevo.' 
          : 'Error al crear el producto. Por favor, intente de nuevo.')
      )
    } finally {
      setLoading(false)
    }
  }
  
  const handleCancel = () => {
    navigate('/productos')
  }
  
  if (initialLoading) {
    return <LoadingIndicator message="Cargando datos del producto..." />
  }
  
  return (
    <>
      <PageHeader 
        title={isEditing ? 'Editar Producto' : 'Nuevo Producto'} 
        subtitle={isEditing 
          ? 'Modifica los datos del producto existente' 
          : 'Completa el formulario para agregar un nuevo producto'
        }
        breadcrumbs={[
          { label: 'Dashboard', path: '/' },
          { label: 'Productos', path: '/productos' },
          { label: isEditing ? 'Editar Producto' : 'Nuevo Producto' }
        ]}
      />
      
      {error && (
        <AlertMessage 
          severity="error" 
          message={error} 
          onClose={() => setError(null)} 
        />
      )}
      
      {success && (
        <AlertMessage 
          severity="success" 
          message={success} 
          onClose={() => setSuccess(null)} 
        />
      )}
      
      <Paper
        component="form"
        elevation={2}
        sx={{ 
          p: 3, 
          borderRadius: 2 
        }}
        onSubmit={handleSubmit}
      >
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Información General
            </Typography>
            <Divider sx={{ mb: 2 }} />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              required
              fullWidth
              id="barcode"
              name="barcode"
              label="Código de Barras"
              variant="outlined"
              value={formData.barcode}
              onChange={handleChange}
              error={!!errors.barcode}
              helperText={errors.barcode}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              required
              fullWidth
              id="name"
              name="name"
              label="Nombre del Producto"
              variant="outlined"
              value={formData.name}
              onChange={handleChange}
              error={!!errors.name}
              helperText={errors.name}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              id="image_url"
              name="image_url"
              label="URL de la imagen"
              variant="outlined"
              value={formData.image_url}
              onChange={handleChange}
              error={!!errors.image_url}
              helperText={errors.image_url}
              placeholder="https://ejemplo.com/imagen.jpg"
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.is_active}
                  onChange={handleSwitchChange}
                  name="is_active"
                  color="primary"
                />
              }
              label="Producto activo"
              labelPlacement="start"
              sx={{ justifyContent: 'flex-end', ml: 0 }}
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              id="description"
              name="description"
              label="Descripción"
              variant="outlined"
              value={formData.description}
              onChange={handleChange}
              multiline
              rows={3}
              error={!!errors.description}
              helperText={errors.description}
            />
          </Grid>
          
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              Detalles del Producto
            </Typography>
            <Divider sx={{ mb: 2 }} />
          </Grid>
          
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              required
              fullWidth
              id="price"
              name="price"
              label="Precio de venta"
              variant="outlined"
              value={formData.price}
              onChange={handleNumberChange}
              error={!!errors.price}
              helperText={errors.price}
              InputProps={{
                startAdornment: <InputAdornment position="start">$</InputAdornment>,
              }}
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              id="cost"
              name="cost"
              label="Costo"
              variant="outlined"
              value={formData.cost}
              onChange={handleNumberChange}
              error={!!errors.cost}
              helperText={errors.cost}
              InputProps={{
                startAdornment: <InputAdornment position="start">$</InputAdornment>,
              }}
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              required
              fullWidth
              id="min_stock"
              name="min_stock"
              label="Stock mínimo"
              variant="outlined"
              value={formData.min_stock}
              onChange={handleNumberChange}
              error={!!errors.min_stock}
              helperText={errors.min_stock}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth error={!!errors.category_id} required>
              <InputLabel id="category-label">Categoría</InputLabel>
              <Select
                labelId="category-label"
                id="category_id"
                name="category_id"
                value={formData.category_id}
                onChange={handleChange}
                label="Categoría"
              >
                {categories.map((category) => (
                  <MenuItem key={category.category_id} value={category.category_id}>
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
              {errors.category_id && <FormHelperText>{errors.category_id}</FormHelperText>}
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth error={!!errors.unit_type} required>
              <InputLabel id="unit-type-label">Tipo de Unidad</InputLabel>
              <Select
                labelId="unit-type-label"
                id="unit_type"
                name="unit_type"
                value={formData.unit_type}
                onChange={handleChange}
                label="Tipo de Unidad"
              >
                {unitTypes.map((unitType) => (
                  <MenuItem key={unitType} value={unitType}>{unitType}</MenuItem>
                ))}
              </Select>
              {errors.unit_type && <FormHelperText>{errors.unit_type}</FormHelperText>}
            </FormControl>
          </Grid>
          
          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
          </Grid>
          
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <Button
                variant="outlined"
                color="inherit"
                onClick={handleCancel}
                startIcon={<CancelIcon />}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                startIcon={<SaveIcon />}
                disabled={loading}
              >
                {loading ? 'Guardando...' : isEditing ? 'Actualizar' : 'Guardar'}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </>
  )
}

export default ProductForm