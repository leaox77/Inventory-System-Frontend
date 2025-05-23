import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
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
  IconButton,
  useMediaQuery, // Import useMediaQuery
  useTheme,      // Import useTheme
  Stack          // Import Stack for button grouping
} from '@mui/material';
import {
  Save as SaveIcon,
  Cancel as CancelIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  Delete as DeleteIcon // Added DeleteIcon for consistency
} from '@mui/icons-material';
import PageHeader from '../components/ui/PageHeader';
import LoadingIndicator from '../components/ui/LoadingIndicator';
import AlertMessage from '../components/ui/AlertMessage';
import productService from '../services/productService';

function ProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme(); // Get theme for breakpoints
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm')); // Check for small screens

  const isEditing = !!id;

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
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditing);
  const [error, setError] = useState(null);
  // Only show success alert if navigating from an action, not on initial load
  const [success, setSuccess] = useState(null);

  const [categories, setCategories] = useState([]);
  const [unitTypes, setUnitTypes] = useState([]);
  const [branches, setBranches] = useState([]);
  const [availableBranches, setAvailableBranches] = useState([]);

  // Bug fix: Show success message only if passed via location state
  useEffect(() => {
    if (location.state?.showSuccess) {
      setSuccess(location.state.successMessage);
      // Clear the state so it doesn't persist on refresh
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, location.pathname, navigate]);


  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        const [categoriesData, unitTypesData, branchesData] = await Promise.all([
          productService.getCategories(),
          productService.getUnitTypes(),
          productService.getBranches()
        ]);

        setCategories(categoriesData.map(cat => ({
          id: cat.id || cat.category_id,
          name: cat.name
        })));

        setUnitTypes(unitTypesData.map(unit => ({
          id: unit.id || unit.unit_type_id,
          name: unit.name || unit.unit_type_name
        })));

        const processedBranches = branchesData.map(branch => ({
          id: branch.id || branch.branch_id,
          name: branch.name
        }));
        setBranches(processedBranches);
        setAvailableBranches(processedBranches);
      } catch (err) {
        console.error('Error al obtener opciones de filtrado:', err);
        setError('Error al cargar los datos de referencia.');
      }
    };

    fetchFilterOptions();
  }, []);

  useEffect(() => {
    const fetchProduct = async () => {
      if (isEditing) {
        try {
          setInitialLoading(true);

          const [product, inventory] = await Promise.all([
            productService.getProduct(id),
            productService.getProductInventory(id)
          ]);

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

          // Update available branches: filter out already assigned ones
          const assignedBranchIds = inventoryData.map(item => item.branch_id);
          setAvailableBranches(branches.filter(b => !assignedBranchIds.includes(b.id)));

        } catch (err) {
          console.error('Error al obtener producto:', err);
          setError('Error al cargar los datos del producto.');
          // Redirect to products list on error, passing no success state
          navigate('/productos', { replace: true });
        } finally {
          setInitialLoading(false);
        }
      }
    };

    // Only fetch product if branches are loaded (as they are needed for availableBranches logic)
    if (branches.length > 0 || !isEditing) {
      fetchProduct();
    }
  }, [id, isEditing, navigate, branches]); // Depend on branches to ensure they are loaded

  const validateForm = () => {
    const newErrors = {};

    if (!formData.barcode.trim()) {
      newErrors.barcode = 'El código de barras es requerido.';
    }

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido.';
    }

    if (!formData.price.trim()) {
      newErrors.price = 'El precio es requerido.';
    } else if (isNaN(formData.price) || parseFloat(formData.price) <= 0) {
      newErrors.price = 'El precio debe ser un número positivo.';
    }

    if (formData.cost && (isNaN(formData.cost) || parseFloat(formData.cost) < 0)) {
      newErrors.cost = 'El costo debe ser un número positivo.';
    }

    if (!formData.min_stock.trim()) {
      newErrors.min_stock = 'El stock mínimo es requerido.';
    } else if (isNaN(formData.min_stock) || parseInt(formData.min_stock) < 0) { // Changed to 0 for minimum stock
      newErrors.min_stock = 'El stock mínimo debe ser un número positivo o cero.';
    }

    // Validate category
    if (!formData.category_id) {
      newErrors.category_id = 'La categoría es requerida.';
    } else if (!categories.some(cat => cat.id === formData.category_id)) {
      newErrors.category_id = 'Categoría no válida.';
    }

    // Validate unit type
    if (!formData.unit_type) {
      newErrors.unit_type = 'El tipo de unidad es requerido.';
    } else if (!unitTypes.some(unit => unit.id === formData.unit_type)) {
      newErrors.unit_type = 'Tipo de unidad no válida.';
    }

    if (formData.image_url && !/^https?:\/\/.+/.test(formData.image_url)) {
      newErrors.image_url = 'La URL de la imagen debe ser válida.';
    }

    // Validate inventory assignments
    formData.inventory_assignments.forEach((assignment, index) => {
      if (!assignment.branch_id) {
        newErrors[`inventory_branch_${index}`] = 'Selecciona una sucursal.';
      }
      if (isNaN(assignment.quantity) || parseFloat(assignment.quantity) < 0) {
        newErrors[`inventory_quantity_${index}`] = 'La cantidad debe ser un número positivo o cero.';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    // Clear error on change
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const handleSwitchChange = (e) => {
    const { name, checked } = e.target;
    setFormData({
      ...formData,
      [name]: checked
    });
  };

  const handleNumberChange = (e) => {
    const { name, value } = e.target;
    // Allow empty string for clearing input, and validate if not empty
    if (value === '') {
      handleChange(e);
      return;
    }

    // Allow only numbers and one decimal point for prices and costs
    if ((name === 'price' || name === 'cost') && !/^(\d*\.?\d*)$/.test(value)) {
      return;
    }
    // Allow only integers for min_stock and quantity (if applicable)
    if (name === 'min_stock' && !/^\d*$/.test(value)) {
      return;
    }
    handleChange(e);
  };

  const handleInventoryQuantityChange = (index, value) => {
    const updatedAssignments = [...formData.inventory_assignments];
    // Allow empty string to clear the input, otherwise validate as number
    const newValue = value === '' ? '' : parseFloat(value);
    updatedAssignments[index].quantity = value; // Keep as string for TextField value

    setFormData({
      ...formData,
      inventory_assignments: updatedAssignments
    });

    // Clear error if exists
    if (errors[`inventory_quantity_${index}`]) {
      const newErrors = { ...errors };
      delete newErrors[`inventory_quantity_${index}`];
      setErrors(newErrors);
    }
  };

  const handleAddInventoryAssignment = () => {
    if (availableBranches.length > 0) {
      const branchToAssign = availableBranches[0];
      setFormData({
        ...formData,
        inventory_assignments: [
          ...formData.inventory_assignments,
          {
            branch_id: branchToAssign.id,
            quantity: '0' // Initialize quantity as string
          }
        ]
      });

      // Remove the assigned branch from available branches
      setAvailableBranches(availableBranches.slice(1));
    }
  };

  const handleRemoveInventoryAssignment = (index) => {
    const removedAssignment = formData.inventory_assignments[index];
    const updatedAssignments = formData.inventory_assignments.filter((_, i) => i !== index);

    setFormData({
      ...formData,
      inventory_assignments: updatedAssignments
    });

    // Add the branch back to available branches
    if (removedAssignment) {
      const branchToAddBack = branches.find(b => b.id === removedAssignment.branch_id);
      if (branchToAddBack) {
        setAvailableBranches(prev => [...prev, branchToAddBack].sort((a, b) => a.name.localeCompare(b.name))); // Sort for consistent order
      }
    }
  };

  const handleBranchChange = (index, newBranchId) => {
    const updatedAssignments = [...formData.inventory_assignments];
    const previousBranchId = updatedAssignments[index].branch_id;

    // Update the assignment
    updatedAssignments[index].branch_id = newBranchId;

    setFormData({
      ...formData,
      inventory_assignments: updatedAssignments
    });

    // Update available branches
    const branchToAddBack = branches.find(b => b.id === previousBranchId);
    const branchToRemove = branches.find(b => b.id === newBranchId);

    let newAvailableBranches = availableBranches.filter(b => b.id !== newBranchId); // Remove the new one from available
    if (branchToAddBack && branchToAddBack.id !== newBranchId) { // Add back the old one, only if it's not the same branch
      newAvailableBranches = [...newAvailableBranches, branchToAddBack];
    }
    setAvailableBranches(newAvailableBranches.sort((a, b) => a.name.localeCompare(b.name)));
  };


  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Convert numeric values to numbers for API
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
    };

    try {
      setLoading(true);
      setError(null); // Clear previous errors

      if (isEditing) {
        await productService.updateProduct(id, productData);
        setSuccess('¡Producto actualizado correctamente!'); // Set success message
      } else {
        await productService.createProduct(productData);
        setSuccess('¡Producto creado exitosamente!'); // Set success message
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
        });
        setAvailableBranches(branches); // Reset available branches to all
      }

      // Redirect after a brief delay to show the success message via location state
      setTimeout(() => {
        navigate('/productos', {
          state: {
            showSuccess: true,
            successMessage: isEditing
              ? 'Producto actualizado correctamente.'
              : 'Producto creado exitosamente.'
          }
        });
      }, 1500);

    } catch (err) {
      console.error('Error al guardar producto:', err);
      const errorMessage = err.response?.data?.detail ||
                           err.response?.data?.message ||
                           err.message ||
                           (isEditing ? 'Error al actualizar el producto.' : 'Error al crear el producto.');
      setError(errorMessage);
      setSuccess(null); // Ensure success is null on error
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('¿Estás seguro de eliminar este producto? Esta acción no se puede deshacer.')) {
      try {
        setLoading(true);
        setError(null); // Clear previous errors
        await productService.deleteProduct(id);
        setSuccess('Producto eliminado correctamente.');

        setTimeout(() => {
          navigate('/productos', {
            state: {
              showSuccess: true,
              successMessage: 'Producto eliminado correctamente.'
            }
          });
        }, 1500);

      } catch (err) {
        console.error('Error al eliminar producto:', err);
        const errorMessage = err.response?.data?.detail || err.message || 'Error al eliminar el producto.';
        setError(errorMessage);
        setSuccess(null); // Ensure success is null on error
      } finally {
        setLoading(false);
      }
    }
  };

  const handleCancel = () => {
    navigate('/productos');
  };

  if (initialLoading) {
    return <LoadingIndicator message="Cargando datos del producto..." />;
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
          message={success} // Use the dynamic success message
          autoHideDuration={3000}
          onClose={() => setSuccess(null)} // Clear success message on close
          position={{ vertical: 'top', horizontal: 'right' }}
        />
      )}

      <Paper
        component="form"
        elevation={2}
        sx={{
          p: { xs: 2, sm: 3 }, // Responsive padding
          borderRadius: 2
        }}
        onSubmit={handleSubmit}
      >
        <Grid container spacing={isSmallScreen ? 2 : 3}> {/* Responsive spacing */}
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
              size={isSmallScreen ? "small" : "medium"} // Responsive size
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
              size={isSmallScreen ? "small" : "medium"}
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
              size={isSmallScreen ? "small" : "medium"}
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

          <Grid item xs={12} sm={6} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', pl: isSmallScreen ? 3 : 0 }}> {/* Adjust placement for small screens */}
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
              // Removed justifyContent and ml for better alignment within the Grid item
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              size={isSmallScreen ? "small" : "medium"}
              id="description"
              name="description"
              label="Descripción"
              variant="outlined"
              value={formData.description}
              onChange={handleChange}
              multiline
              rows={isSmallScreen ? 2 : 3} // Fewer rows on small screens
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
              size={isSmallScreen ? "small" : "medium"}
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
              size={isSmallScreen ? "small" : "medium"}
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
              size={isSmallScreen ? "small" : "medium"}
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
            <FormControl fullWidth error={!!errors.category_id} required size={isSmallScreen ? "small" : "medium"}>
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
            <FormControl fullWidth error={!!errors.unit_type} required size={isSmallScreen ? "small" : "medium"}>
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
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              Stock por Sucursal
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <TableContainer component={Paper} elevation={0} variant="outlined" sx={{ overflowX: 'auto' }}>
              <Table size={isSmallScreen ? "small" : "medium"} sx={{ minWidth: isSmallScreen ? 400 : 500 }}> {/* Adjusted minWidth */}
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ width: '60%' }}>Sucursal</TableCell> {/* Allocate more width for branch name */}
                    <TableCell align="right">Cantidad</TableCell>
                    <TableCell width={50}></TableCell> {/* Fixed width for action button */}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {formData.inventory_assignments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} sx={{ textAlign: 'center', py: 2 }}>
                        No hay asignaciones de stock.
                      </TableCell>
                    </TableRow>
                  ) : (
                    formData.inventory_assignments.map((assignment, index) => (
                      <TableRow key={`assignment-${index}`}>
                        <TableCell>
                          <FormControl fullWidth size="small" error={!!errors[`inventory_branch_${index}`]}>
                            <Select
                              value={assignment.branch_id}
                              onChange={(e) => handleBranchChange(index, e.target.value)}
                            >
                              {branches.map((branch) => (
                                <MenuItem
                                  key={branch.id}
                                  value={branch.id}
                                  // Disable if branch is already assigned to another row, unless it's this row's current branch
                                  disabled={
                                    !availableBranches.some(b => b.id === branch.id) &&
                                    branch.id !== assignment.branch_id
                                  }
                                >
                                  {branch.name}
                                </MenuItem>
                              ))}
                            </Select>
                            {errors[`inventory_branch_${index}`] && <FormHelperText>{errors[`inventory_branch_${index}`]}</FormHelperText>}
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
                            sx={{ '& .MuiInputBase-input': { py: '8.5px' } }} // Compact padding
                          />
                        </TableCell>
                        <TableCell>
                          <IconButton
                            onClick={() => handleRemoveInventoryAssignment(index)}
                            color="error"
                            size="small"
                          >
                            <RemoveIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {availableBranches.length > 0 && (
              <Box sx={{ mt: 2, width: isSmallScreen ? '100%' : 'auto' }}>
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={handleAddInventoryAssignment}
                  fullWidth={isSmallScreen} // Full width button on small screens
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


          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
          </Grid>

          <Grid item xs={12}>
            <Stack
              direction={{ xs: 'column-reverse', sm: 'row' }} // Stack on xs, row on sm+
              spacing={2}
              sx={{ justifyContent: 'flex-end', width: '100%' }} // Ensure Stack takes full width
            >
              {isEditing && (
                <Button
                  variant="contained"
                  color="error"
                  onClick={handleDelete}
                  disabled={loading}
                  startIcon={<DeleteIcon />} // Added icon
                  sx={{ width: { xs: '100%', sm: 'auto' } }} // Full width on xs
                >
                  {loading ? 'Eliminando...' : 'Eliminar'}
                </Button>
              )}
              <Button
                variant="outlined"
                color="inherit"
                onClick={handleCancel}
                startIcon={<CancelIcon />}
                sx={{ width: { xs: '100%', sm: 'auto' } }}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                startIcon={<SaveIcon />}
                disabled={loading}
                sx={{ width: { xs: '100%', sm: 'auto' } }}
              >
                {loading ? 'Guardando...' : isEditing ? 'Actualizar' : 'Guardar'}
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </Paper>
    </>
  );
}

export default ProductForm;