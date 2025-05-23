import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
  Avatar,
  useMediaQuery,
  useTheme,
  Typography
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import PageHeader from '../components/ui/PageHeader';
import LoadingIndicator from '../components/ui/LoadingIndicator';
import AlertMessage from '../components/ui/AlertMessage';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import productService from '../services/productService';
import authService from '../services/authService';
import ProtectedButton from '../components/ui/ProtectedButton';
import { useAuth } from '../contexts/AuthContext';

function Products() {
  const [products, setProducts] = useState([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState('');
  const [categories, setCategories] = useState([]);
  const [unitTypes, setUnitTypes] = useState([]);
  const [branches, setBranches] = useState([]);
  const [filters, setFilters] = useState({
    category_id: '',
    unit_type: '',
    branch_id: '',
  });
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: '',
    message: '',
    productId: null,
  });

  const location = useLocation();
  const [successAlert, setSuccessAlert] = useState({
    show: false,
    message: '',
  });

  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));

  useEffect(() => {
    if (location.state?.showSuccess) {
      setSuccessAlert({
        show: true,
        message: location.state.successMessage,
      });
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  useEffect(() => {
    const checkAuthAndLoad = async () => {
      const isAuthenticated = await authService.verifyToken();
      if (!isAuthenticated) {
        navigate('/login');
        return;
      }
      await fetchFilterOptions();
    };

    checkAuthAndLoad();
  }, [navigate]);

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
        branch_id: filters.branch_id || undefined,
      });

      setProducts(response.items);
      setTotalProducts(response.total);
    } catch (error) {
      console.error('Error fetching products:', error);
      setError(error.message || 'Error al cargar productos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts();
    }, 500);

    return () => clearTimeout(timer);
  }, [page, rowsPerPage, search, filters]);

  const fetchFilterOptions = async () => {
    try {
      const [branchesData, categoriesData, unitTypesData] = await Promise.all([
        productService.getBranches(),
        productService.getCategories(),
        productService.getUnitTypes(),
      ]);

      setCategories(categoriesData);
      setBranches(branchesData);
      setUnitTypes(unitTypesData);
    } catch (err) {
      console.error('Error al obtener opciones de filtrado:', err);
      setError('Error al cargar opciones de filtrado');
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearchChange = (event) => {
    setSearch(event.target.value);
    setPage(0);
  };

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value || '',
    }));
  };

  const handleRefresh = () => {
    setSearch('');
    setFilters({
      category_id: '',
      unit_type: '',
      branch_id: '',
    });
    setPage(0);
  };

  const handleDeleteConfirm = (productId) => {
    setConfirmDialog({
      open: true,
      title: '¿Eliminar producto?',
      message: 'Esta acción no se puede deshacer.',
      productId,
    });
  };

  const handleDeleteProduct = async () => {
    try {
      setLoading(true);
      await productService.deleteProduct(confirmDialog.productId);
      setSuccess('Producto eliminado correctamente');
      fetchProducts();
    } catch (err) {
      console.error('Error al eliminar producto:', err);
      setError(err.message || 'Error al eliminar el producto');
    } finally {
      setLoading(false);
      setConfirmDialog({ ...confirmDialog, open: false, productId: null });
    }
  };

  const handleAddProduct = () => {
    navigate('/productos/nuevo');
  };

  const handleEditProduct = (id) => {
    navigate(`/productos/editar/${id}`);
  };

  const calculateStock = (product) => {
    return product.stock || 0;
  };

  const { currentUser } = useAuth();

  const hasAnyActionPermission = () => {
    if (!currentUser) return false;
    return ['reports', 'all'].some(
      (permission) => currentUser.permissions?.[permission] === true
    );
  };

  return (
    <>
      <PageHeader
        title="Productos"
        subtitle="Gestiona el inventario de productos"
        action={hasAnyActionPermission() ? handleAddProduct : undefined}
        actionLabel={hasAnyActionPermission() ? (isMobile ? 'Nuevo' : 'Nuevo Producto') : undefined}
        actionIcon={hasAnyActionPermission() ? <AddIcon /> : undefined}
        breadcrumbs={[
          { label: 'Dashboard', path: '/' },
          { label: 'Productos' },
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

      {success && (
        <AlertMessage
          severity="success"
          message={success}
          autoHideDuration={3000}
          onClose={() => setSuccess(null)}
        />
      )}

      {/* Filtros compactos */}
      <Paper elevation={2} sx={{ p: 2, mb: 3, borderRadius: 2 }}>
        <Grid container spacing={1}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              variant="outlined"
              size="small"
              placeholder="Buscar..."
              value={search}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          <Grid item xs={6} sm={3} md={2}>
            <TextField
              select
              fullWidth
              variant="outlined"
              size="small"
              name="category_id"
              label={isMobile ? "Categ." : "Categoría"}
              value={filters.category_id}
              onChange={handleFilterChange}
              disabled={categories.length === 0}
            >
              <MenuItem value="">Todas</MenuItem>
              {categories.map((category) => (
                <MenuItem key={category.id} value={category.id}>
                  {isMobile ? category.name.substring(0, 10) + (category.name.length > 10 ? '...' : '') : category.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={6} sm={3} md={2}>
            <Box display="flex" alignItems="center" height="100%">
              <TextField
                select
                fullWidth
                variant="outlined"
                size="small"
                name="unit_type"
                label={isMobile ? "Unid." : "Unidad"}
                value={filters.unit_type}
                onChange={handleFilterChange}
                disabled={unitTypes.length === 0}
              >
                <MenuItem value="">Todas</MenuItem>
                {unitTypes.map((unit) => (
                  <MenuItem key={unit.id} value={unit.id}>
                    {unit.name}
                  </MenuItem>
                ))}
              </TextField>
              {!isMobile && (
                <Tooltip title="Actualizar">
                  <IconButton onClick={handleRefresh} sx={{ ml: 1 }}>
                    <RefreshIcon />
                  </IconButton>
                </Tooltip>
              )}
            </Box>
          </Grid>

          {isMobile && (
            <Grid item xs={12}>
              <Box display="flex" justifyContent="flex-end">
                <Tooltip title="Actualizar">
                  <IconButton onClick={handleRefresh}>
                    <RefreshIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </Grid>
          )}
        </Grid>
      </Paper>

      {/* Tabla con scroll vertical */}
      <TableContainer 
        component={Paper} 
        elevation={2} 
        sx={{ 
          borderRadius: 2,
          maxHeight: 'calc(100vh - 300px)',
          overflow: 'auto'
        }}
      >
        {loading ? (
          <LoadingIndicator message="Cargando productos..." />
        ) : (
          <>
            <Table stickyHeader size={isMobile ? 'small' : 'medium'}>
              <TableHead>
                <TableRow>
                  <TableCell>Producto</TableCell>
                  {!isMobile && <TableCell>Código</TableCell>}
                  {!isMobile && <TableCell>Categoría</TableCell>}
                  <TableCell align="right">Precio</TableCell>
                  <TableCell align="right">Stock</TableCell>
                  {!isMobile && <TableCell>Unidad</TableCell>}
                  {hasAnyActionPermission() && (
                    <TableCell align="center">Acciones</TableCell>
                  )}
                </TableRow>
              </TableHead>
              <TableBody>
                {products.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={hasAnyActionPermission() ? 7 : 6} align="center">
                      No se encontraron productos
                    </TableCell>
                  </TableRow>
                ) : (
                  products.map((product) => {
                    const stock = calculateStock(product);
                    const category = categories.find(c => c.id === product.category_id);
                    return (
                      <TableRow
                        key={product.product_id || product.id}
                        hover
                        sx={{ '&:hover': { backgroundColor: theme.palette.action.hover } }}
                      >
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Avatar
                              variant="rounded"
                              src={product.image_url}
                              alt={product.name}
                              sx={{ width: 40, height: 40, mr: 2 }}
                            />
                            <Box>
                              <Typography variant="body2" fontWeight="500">
                                {product.name}
                              </Typography>
                              {isMobile && product.barcode && (
                                <Typography variant="caption" color="text.secondary">
                                  {product.barcode}
                                </Typography>
                              )}
                            </Box>
                          </Box>
                        </TableCell>
                        {!isMobile && (
                          <TableCell>{product.barcode}</TableCell>
                        )}
                        {!isMobile && (
                          <TableCell>
                            <Chip
                              label={category?.name || 'Sin categoría'}
                              size="small"
                              sx={{
                                backgroundColor: 'primary.light',
                                color: 'white',
                                fontWeight: 500,
                              }}
                            />
                          </TableCell>
                        )}
                        <TableCell align="right">
                          ${product.price?.toFixed(2) || '0.00'}
                        </TableCell>
                        <TableCell align="right">
                          <Chip
                            label={stock}
                            size="small"
                            color={
                              stock === 0 ? 'error' :
                              stock < (product.min_stock || 5) ? 'warning' : 'success'
                            }
                            variant="outlined"
                          />
                        </TableCell>
                        {!isMobile && (
                          <TableCell>
                            {unitTypes.find(u => u.id === product.unit_type)?.name || product.unit_type}
                          </TableCell>
                        )}
                        {hasAnyActionPermission() && (
                          <TableCell align="center">
                            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                              <ProtectedButton
                                permission="reports"
                                tooltip="Editar"
                                onClick={() => handleEditProduct(product.product_id || product.id)}
                                icon={<EditIcon fontSize="small" />}
                                size="small"
                              />
                              <ProtectedButton
                                permission="all"
                                tooltip="Eliminar"
                                onClick={() => handleDeleteConfirm(product.product_id || product.id)}
                                icon={<DeleteIcon fontSize="small" />}
                                color="error"
                                size="small"
                              />
                            </Box>
                          </TableCell>
                        )}
                      </TableRow>
                    );
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
              labelRowsPerPage={isMobile ? "Filas:" : "Filas por página:"}
              labelDisplayedRows={({ from, to, count }) => 
                isMobile ? `${from}-${to}` : `${from}-${to} de ${count}`
              }
            />
          </>
        )}
      </TableContainer>

      <ConfirmDialog
        open={confirmDialog.open}
        title={confirmDialog.title}
        message={confirmDialog.message}
        onConfirm={handleDeleteProduct}
        onClose={() => setConfirmDialog({ ...confirmDialog, open: false, productId: null })}
      />
    </>
  );
}

export default Products;