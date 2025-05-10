import { useState, useEffect } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
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
  FormControlLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton
} from '@mui/material'
import {
  Save as SaveIcon,
  Cancel as CancelIcon,
  Add as AddIcon,
  Remove as RemoveIcon
} from '@mui/icons-material'
import PageHeader from '../components/ui/PageHeader'
import LoadingIndicator from '../components/ui/LoadingIndicator'
import AlertMessage from '../components/ui/AlertMessage'
import productService from '../services/productService'

function ProductForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
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
    inventory_assignments: []
  })
  
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(isEditing)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState({
    show: false,
    message: ''
  });
  
  const [categories, setCategories] = useState([])
  const [unitTypes, setUnitTypes] = useState([])
  const [branches, setBranches] = useState([])
  const [availableBranches, setAvailableBranches] = useState([])
  
  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        const [categoriesData, unitTypesData, branchesData] = await Promise.all([
          productService.getCategories(),
          productService.getUnitTypes(),
          productService.getBranches()
        ])
        
        // Asegurar que las categorías tengan la estructura correcta
      setCategories(categoriesData.map(cat => ({
        id: cat.id || cat.category_id,
        name: cat.name
      })))
      
      // Asegurar que los tipos de unidad tengan la estructura correcta
      setUnitTypes(unitTypesData.map(unit => ({
        id: unit.id || unit.unit_type_id,
        name: unit.name || unit.unit_type_name
      })))
      
      // Asegurar que las sucursales tengan la estructura correcta
      const processedBranches = branchesData.map(branch => ({
        id: branch.id || branch.branch_id,
        name: branch.name
      }))
        setBranches(processedBranches)
        setAvailableBranches(processedBranches)
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
          setInitialLoading(true);

          const [product, inventory] = await Promise.all([
            productService.getProduct(id),
            productService.getProductInventory(id)
          ]);

          // Usar inventory_items del producto si existe, si no usar el endpoint de inventory
        const inventoryData = product.inventory_items && product.inventory_items.length > 0 
          ? product.inventory_items 
          : inventory;

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
            inventory_assignments: inventoryData.map(item => ({
              branch_id: item.branch_id,
              quantity: item.quantity.toString()
            }))
          });

          // Actualizar branches disponibles
          const assignedBranchIds = inventory.map(item => item.branch_id);
          setAvailableBranches(branches.filter(b => !assignedBranchIds.includes(b.id)));
          
          // Actualizar branches disponibles
          if (product.inventory_items) {
            const assignedBranchIds = product.inventory_items.map(item => item.branch_id)
            setAvailableBranches(branches.filter(b => !assignedBranchIds.includes(b.id)))
          }
        } catch (err) {
          console.error('Error al obtener producto:', err)
          setError('Error al cargar los datos del producto')
          navigate('/productos')
        } finally {
          setInitialLoading(false)
        }
      }
    }
    
     if (branches.length > 0) { // Solo ejecutar cuando branches esté cargado
    fetchProduct()
  }
}, [id, isEditing, navigate, branches])
  
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
    } else if (isNaN(formData.min_stock) || parseInt(formData.min_stock) < 5) {
      newErrors.min_stock = 'El stock mínimo debe ser un número positivo o cinco'
    }
    
    // Validar categoría
    if (!formData.category_id) {
      newErrors.category_id = 'La categoría es requerida'
    } else if (!categories.some(cat => cat.id === formData.category_id)) {
      newErrors.category_id = 'Categoría no válida'
    }
    
    // Validar tipo de unidad
    if (!formData.unit_type) {
      newErrors.unit_type = 'El tipo de unidad es requerido'
    } else if (!unitTypes.some(unit => unit.id === formData.unit_type)) {
      newErrors.unit_type = 'Tipo de unidad no válido'
    }
    
    if (formData.image_url && !/^https?:\/\/.+/.test(formData.image_url)) {
      newErrors.image_url = 'La URL de la imagen debe ser válida'
    }
    
    // Validar asignaciones de inventario
    formData.inventory_assignments.forEach((assignment, index) => {
      if (!assignment.quantity || isNaN(assignment.quantity) || parseFloat(assignment.quantity) < 0) {
        newErrors[`inventory_quantity_${index}`] = 'La cantidad debe ser un número positivo'
      }
    })

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

   const handleInventoryQuantityChange = (index, value) => {
    const updatedAssignments = [...formData.inventory_assignments]
    updatedAssignments[index].quantity = value
    
    setFormData({
      ...formData,
      inventory_assignments: updatedAssignments
    })
    
    // Limpiar error si existe
    if (errors[`inventory_quantity_${index}`]) {
      const newErrors = {...errors}
      delete newErrors[`inventory_quantity_${index}`]
      setErrors(newErrors)
    }
  }
  
  const handleAddInventoryAssignment = () => {
    if (availableBranches.length > 0) {
      setFormData({
        ...formData,
        inventory_assignments: [
          ...formData.inventory_assignments,
          {
            branch_id: availableBranches[0].id,
            quantity: '0'
          }
        ]
      })
      
      // Actualizar branches disponibles
      setAvailableBranches(availableBranches.slice(1))
    }
  }
  
  const handleRemoveInventoryAssignment = (index) => {
    const removedAssignment = formData.inventory_assignments[index]
    const updatedAssignments = formData.inventory_assignments.filter((_, i) => i !== index)
    
    setFormData({
      ...formData,
      inventory_assignments: updatedAssignments
    })
    
    // Agregar la sucursal de vuelta a las disponibles
    if (removedAssignment) {
      const branchToAddBack = branches.find(b => b.id === removedAssignment.branch_id)
      if (branchToAddBack) {
        setAvailableBranches([...availableBranches, branchToAddBack])
      }
    }
  }
  
  const handleBranchChange = (index, branchId) => {
    const updatedAssignments = [...formData.inventory_assignments]
    const previousBranchId = updatedAssignments[index].branch_id
    
    // Actualizar la asignación
    updatedAssignments[index].branch_id = branchId
    
    setFormData({
      ...formData,
      inventory_assignments: updatedAssignments
    })
    
    // Actualizar branches disponibles
    const branchToAddBack = branches.find(b => b.id === previousBranchId)
    const branchToRemove = branches.find(b => b.id === branchId)
    
    setAvailableBranches([
      ...availableBranches.filter(b => b.id !== branchId),
      branchToAddBack
    ])
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
      inventory_assignments: formData.inventory_assignments.map(ia => ({
        branch_id: ia.branch_id,
        quantity: parseFloat(ia.quantity)
      }))
    }
    
    try {
      setLoading(true)

      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        cost: formData.cost ? parseFloat(formData.cost) : null,
        min_stock: parseInt(formData.min_stock),
        inventory_assignments: formData.inventory_assignments.map(ia => ({
          branch_id: ia.branch_id,
          quantity: parseFloat(ia.quantity)
        }))
      };
      
      if (isEditing) {
      await productService.updateProduct(id, productData);
      setSuccess({
        show: true,
        message: '¡Producto actualizado correctamente!'
      });
    } else {
      await productService.createProduct(productData);
      setSuccess({
        show: true,
        message: '¡Producto creado exitosamente!'
      });
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
          inventory_assignments: []
        })
        setAvailableBranches(branches)
      }
      
      // Redireccionar después de un breve retraso para mostrar el mensaje de éxito
      setTimeout(() => {
      navigate('/productos', {
        state: { 
          showSuccess: true,
          successMessage: isEditing 
            ? 'Producto actualizado correctamente' 
            : 'Producto creado exitosamente'
        }
      });
    }, 1500);
      
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
  
  const handleDelete = async () => {
    if (window.confirm('¿Estás seguro de eliminar este producto? Esta acción no se puede deshacer.')) {
      try {
        setLoading(true);
        const result = await productService.deleteProduct(id);
        setSuccess({
          show: true,
          message: result.message
        });
        
        setTimeout(() => {
          navigate('/productos', {
            state: { 
              showSuccess: true,
              successMessage: 'Producto eliminado correctamente'
            }
          });
        }, 1500);
        
      } catch (err) {
        setError(err.message || 'Error al eliminar el producto');
      } finally {
        setLoading(false);
      }
    }
  };

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
          title="¡Éxito!"
          message="El producto se ha creado correctamente"
          autoHideDuration={3000}
          onClose={() => console.log('Mensaje cerrado')}
          position={{ vertical: 'top', horizontal: 'right' }}
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
          
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              Stock por Sucursal
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <TableContainer component={Paper} elevation={0} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Sucursal</TableCell>
                    <TableCell align="right">Cantidad</TableCell>
                    <TableCell width={50}></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {formData.inventory_assignments.map((assignment, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <FormControl fullWidth size="small">
                          <Select
                            value={assignment.branch_id}
                            onChange={(e) => handleBranchChange(index, e.target.value)}
                          >
                            {branches.map((branch) => (
                              <MenuItem 
                                key={branch.id} 
                                value={branch.id}
                                disabled={!availableBranches.some(b => b.id === branch.id) && 
                                          !formData.inventory_assignments.some(ia => ia.branch_id === branch.id)}
                              >
                                {branch.name}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </TableCell>
                      <TableCell align="right">
                        <TextField
                          type="number"
                          size="small"
                          fullWidth
                          value={assignment.quantity}
                          onChange={(e) => handleInventoryQuantityChange(index, e.target.value)}
                          error={!!errors[`inventory_quantity_${index}`]}
                          helperText={errors[`inventory_quantity_${index}`]}
                          inputProps={{ min: 0, step: 0.001 }}
                        />
                      </TableCell>
                      <TableCell>
                        <IconButton 
                          onClick={() => handleRemoveInventoryAssignment(index)}
                          color="error"
                        >
                          <RemoveIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            
            {availableBranches.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={handleAddInventoryAssignment}
                >
                  Agregar Sucursal
                </Button>
              </Box>
            )}
            
            {formData.inventory_assignments.length === 0 && availableBranches.length === 0 && (
              <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                Todas las sucursales han sido asignadas.
              </Typography>
            )}
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
                  <MenuItem key={category.id} value={category.id}>
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
                  <MenuItem key={unitType.id} value={unitType.id}>{unitType.name}</MenuItem>
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
              {isEditing && (
                <Button
                  variant="contained"
                  color="error"
                  onClick={handleDelete}
                  disabled={loading}
                >
                  {loading ? 'Eliminando...' : 'Eliminar'}
                </Button>
              )}
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