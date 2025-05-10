import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLocation } from 'react-router-dom'
import {
  Button,
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
  TextField,
  InputAdornment,
  Grid,
  Box,
  MenuItem,
  Tooltip,
  Avatar
} from '@mui/material'
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material'
import PageHeader from '../components/ui/PageHeader'
import LoadingIndicator from '../components/ui/LoadingIndicator'
import AlertMessage from '../components/ui/AlertMessage'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import productService from '../services/productService'
import authService from '../services/authService'

function Products() {
  const [products, setProducts] = useState([])
  const [totalProducts, setTotalProducts] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [search, setSearch] = useState('')
  const [categories, setCategories] = useState([])
  const [unitTypes, setUnitTypes] = useState([])
  const [branches, setBranches] = useState([])
  const [filters, setFilters] = useState({
    category_id: '',
    unit_type: '',
    branch_id: ''
  })
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: '',
    message: '',
    productId: null
  })

  const location = useLocation();
  const [successAlert, setSuccessAlert] = useState({
    show: false,
    message: ''
  });

  useEffect(() => {
    if (location.state?.showSuccess) {
      setSuccessAlert({
        show: true,
        message: location.state.successMessage
      });
      
      // Limpiar el estado de navegación para no mostrar el mensaje al recargar
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);
  
  const navigate = useNavigate()

  useEffect(() => {
    const checkAuthAndLoad = async () => {
      const isAuthenticated = await authService.verifyToken()
      if (!isAuthenticated) {
        navigate('/login')
        return
      }
      await fetchFilterOptions()
      await fetchProducts()
    }

    checkAuthAndLoad()
  }, [navigate, page, rowsPerPage, filters])

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await productService.getProducts({
        skip: page * rowsPerPage,
        limit: rowsPerPage,
        search: search || undefined,
        category_id: filters.category_id || undefined,
        unit_type: filters.unit_type || undefined,
        branch_id: filters.branch_id || undefined
      });
      
      setProducts(response.items);
      setTotalProducts(response.total);
    } catch (error) {
      console.error('Error fetching products:', error);
      // Mostrar mensaje de error más descriptivo
      setError(error.message || 'Error al cargar productos. Por favor, intente más tarde.');
    } finally {
      setLoading(false);
    }
  };
  
  // Consolidar lógica en un solo useEffect con debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts();
    }, 500);

    return () => clearTimeout(timer);
  }, [page, rowsPerPage, search, filters.category_id, filters.unit_type, filters.branch_id]);

  const fetchFilterOptions = async () => {
    try {
      const [branchesData, categoriesData, unitTypesData] = await Promise.all([
        productService.getBranches(),
        productService.getCategories(),
        productService.getUnitTypes()
      ])
      
      console.log('Categorías recibidas:', categoriesData) // Para depuración
      console.log('Sucursales recibidas:', branchesData) // Para depuración
      console.log('Tipos de unidad recibidos:', unitTypesData) // Para depuración
      
      // Asegurar el formato correcto de las categorías
      const formattedCategories = Array.isArray(categoriesData) 
        ? categoriesData.map(cat => ({
            id: cat.id || cat.category_id,
            name: cat.name || cat.category_name
          }))
        : []

      // Asegura el formato de tipo de unidad
      const formattedUnitTypes = Array.isArray(unitTypesData) 
        ? unitTypesData.map(unit => ({
            id: unit.id || unit.unit_type_id,
            name: unit.name || unit.unit_type_name
          }))
        : []
      
      setCategories(formattedCategories)
      setBranches(branchesData)
      setUnitTypes(unitTypesData)
    } catch (err) {
      console.error('Error al obtener opciones de filtrado:', err)
      setError('Error al cargar opciones de filtrado')
    }
  }

  // Resto de tus handlers permanecen igual...
  const handleChangePage = (event, newPage) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  const handleSearchChange = (event) => {
  setSearch(event.target.value)
  setPage(0) // Resetear a la primera página al buscar
}

  const handleFilterChange = (event) => {
    const { name, value } = event.target
    setFilters(prev => ({
      ...prev,
      [name]: value || ''
    }))
  }

  const handleRefresh = () => {
    setSearch('')
    setFilters({
      category_id: '',
      unit_type: '',
      branch_id: ''
    })
    setPage(0)
  }

  const handleDeleteConfirm = (productId) => {
    setConfirmDialog({
      open: true,
      title: '¿Eliminar producto?',
      message: '¿Está seguro de que desea eliminar este producto? Esta acción no se puede deshacer.',
      productId
    })
  }

  const handleDeleteProduct = async () => {
    try {
      setLoading(true)
      await productService.deleteProduct(confirmDialog.productId)
      setSuccess('Producto eliminado correctamente')
      fetchProducts()
    } catch (err) {
      console.error('Error al eliminar producto:', err)
      setError(err.message || 'Error al eliminar el producto. Por favor, intente de nuevo.')
    } finally {
      setLoading(false)
      setConfirmDialog({ ...confirmDialog, open: false })
    }
  }

  const handleAddProduct = () => {
    navigate('/productos/nuevo')
  }

  const handleEditProduct = (id) => {
    navigate(`/productos/editar/${id}`)
  }

  const calculateStock = (product) => {
    // Usamos directamente el stock que viene del backend
    return product.stock || 0;
  };

  return (
    <>
      <PageHeader 
        title="Productos" 
        subtitle="Gestiona el inventario de productos"
        action={handleAddProduct}
        actionLabel="Nuevo Producto"
        actionIcon={<AddIcon />}
        breadcrumbs={[
          { label: 'Dashboard', path: '/' },
          { label: 'Productos' }
        ]}
      />
      
      {error && (
        <AlertMessage 
          severity="error" 
          message={error} 
          onClose={() => setError(null)} 
        />
      )}
      
      {successAlert.show && (
        <AlertMessage
          severity="success"
          message={successAlert.message}
          autoHideDuration={3000}
          onClose={() => setSuccessAlert({ show: false, message: '' })}
        />
      )}
      
      <Paper elevation={2} sx={{ p: 2, mb: 3, borderRadius: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              variant="outlined"
              size="small"
              placeholder="Buscar por nombre..."
              value={search}
              onChange={handleSearchChange}
              onKeyPress={(e) => e.key === 'Enter' && fetchProducts()}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={2}>
            <TextField
              select
              fullWidth
              variant="outlined"
              size="small"
              name="category_id"
              label="Categoría"
              value={filters.category_id}
              onChange={handleFilterChange}
              disabled={categories.length === 0}
            >
              <MenuItem value="">Todas</MenuItem>
              {categories.map((category) => (
                <MenuItem key={category.id} value={category.id}>
                  {category.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          
          <Grid item xs={12} sm={6} md={2}>
            <TextField
              select
              fullWidth
              variant="outlined"
              size="small"
              name="unit_type"
              label="Unidad"
              value={filters.unit_type}
              onChange={handleFilterChange}
            >
              <MenuItem value="">Todas</MenuItem>
              {unitTypes.map((unit) => (
                <MenuItem key={unit.id} value={unit.id}>
                  {unit.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          
          <Grid item xs={12} sm={6} md={2}>
            <TextField
              select
              fullWidth
              variant="outlined"
              size="small"
              name="branch_id"
              label="Sucursal"
              value={filters.branch_id}
              onChange={handleFilterChange}
              disabled={branches.length === 0}
            >
              <MenuItem value="">Todas</MenuItem>
              {branches.map((branch) => (
                <MenuItem key={branch.id} value={branch.id}>
                  {branch.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          
          <Grid item xs={12} md={2}>
            <Box display="flex" justifyContent="flex-end">
              <Tooltip title="Actualizar">
                <IconButton onClick={handleRefresh} color="primary">
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleAddProduct}
                sx={{ ml: 1 }}
              >
                Nuevo
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>
      
      <TableContainer component={Paper} elevation={2} sx={{ borderRadius: 2 }}>
        {loading ? (
          <LoadingIndicator message="Cargando productos..." />
        ) : (
          <>
            <Table sx={{ minWidth: 650 }} aria-label="tabla de productos">
              <TableHead>
                <TableRow>
                  <TableCell>Código</TableCell>
                  <TableCell>Producto</TableCell>
                  <TableCell>Categoría</TableCell>
                  <TableCell align="right">Precio</TableCell>
                  <TableCell align="right">Stock</TableCell>
                  <TableCell>Unidad</TableCell>
                  <TableCell align="center">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {products.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      No se encontraron productos
                    </TableCell>
                  </TableRow>
                ) : (
                  products.map((product) => {
                    const stock = calculateStock(product)
                    const category = categories.find(c => c.id === product.category_id)
                    return (
                      <TableRow 
                        key={product.product_id || product.id} 
                        sx={{ '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' } }}
                      >
                        <TableCell>{product.barcode}</TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Avatar 
                              variant="rounded"
                              src={product.image_url} 
                              alt={product.name}
                              sx={{ width: 40, height: 40, mr: 2 }}
                            />
                            <Box>
                              <Box sx={{ fontWeight: '500' }}>{product.name}</Box>
                              <Box sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
                                {product.description?.substring(0, 50)}{product.description?.length > 50 && '...'}
                              </Box>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={category?.name || 'Sin categoría'} 
                            size="small" 
                            sx={{ 
                              backgroundColor: 'primary.light',
                              color: 'white',
                              fontWeight: 500
                            }} 
                          />
                        </TableCell>
                        <TableCell align="right">
                          ${product.price?.toLocaleString('es-MX', { minimumFractionDigits: 2 }) || '0.00'}
                        </TableCell>
                        <TableCell align="right">
                          <Chip 
                            label={stock} 
                            size="small"
                            color={
                    stock === 0 ? "error" : 
                    stock < (product.min_stock || 5) ? "warning" : "success"
                  }
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>{unitTypes.find(u => u.id === product.unit_type)?.name || product.unit_type }</TableCell>
                        <TableCell align="center">
                          <Tooltip title="Editar">
                            <IconButton 
                              size="small" 
                              color="primary"
                              onClick={() => handleEditProduct(product.product_id || product.id)}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Eliminar">
                            <IconButton 
                              size="small" 
                              color="error"
                              onClick={() => handleDeleteConfirm(product.product_id || product.id)}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={totalProducts}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              labelRowsPerPage="Filas por página:"
              labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
            />
          </>
        )}
      </TableContainer>
      
      <ConfirmDialog
        open={confirmDialog.open}
        title={confirmDialog.title}
        message={confirmDialog.message}
        onConfirm={handleDeleteProduct}
        onClose={() => setConfirmDialog({ ...confirmDialog, open: false })}
      />
    </>
  )
}

export default Products