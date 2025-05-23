// src/components/PurchaseOrderModal.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { 
    Dialog, DialogTitle, DialogContent, DialogActions, 
    Button, TextField, Select, MenuItem, InputLabel, 
    FormControl, Grid, Table, TableBody, TableCell, 
    TableContainer, TableHead, TableRow, Paper, IconButton, Typography, Autocomplete, Alert
} from '@mui/material';
import { Add, Delete } from '@mui/icons-material';
import { getSupplierProducts, createPurchaseOrder } from '../../services/supplierService';
import orderService from '../../services/orderService';
import productService from '../../services/productService';
import api from '../../services/api'; // Asegúrate de importar tu instancia de API

const PurchaseOrderModal = ({ open, onClose, supplierId }) => {
    const [branches, setBranches] = useState([]);
    const [products, setProducts] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(null); // Cambia a null para Autocomplete
    const [quantity, setQuantity] = useState(1);
    const [orderItems, setOrderItems] = useState([]);
    const [formData, setFormData] = useState({
        branch_id: '',
        expected_delivery_date: '',
        notes: ''
    });
    const [searchProductText, setSearchProductText] = useState('');
    const [loadingProducts, setLoadingProducts] = useState(false);

    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (supplierId && open) { // Solo cargar si el modal está abierto
            fetchBranches();
            fetchProducts(); // Carga inicial de productos
        } else if (!open) {
            // Limpiar el estado cuando el modal se cierra
            setFormData({ branch_id: '', expected_delivery_date: '', notes: '' });
            setOrderItems([]);
            setSelectedProduct(null);
            setQuantity(1);
            setSearchProductText('');
            setProducts([]);
        }
    }, [supplierId, open]);

    const fetchBranches = async () => {
        try {
            const data = await productService.getBranches();
            setBranches(data);
        } catch (error) {
            console.error("Error fetching branches:", error);
        }
    };

    const fetchProducts = useCallback(async (search = '') => {
        setLoadingProducts(true);
        try {
            const response = await orderService.getProducts({ name: search, limit: 200 }); // Ajusta el límite según necesites
            setProducts(response.items);
        } catch (error) {
            console.error("Error fetching products:", error);
        } finally {
            setLoadingProducts(false);
        }
    }, []);

    const handleAddItem = () => {
        if (!selectedProduct || quantity <= 0) return;

        const existingItemIndex = orderItems.findIndex(item => item.product_id === selectedProduct.product_id);

        if (existingItemIndex > -1) {
            const newItems = [...orderItems];
            newItems[existingItemIndex].quantity += quantity;
            setOrderItems(newItems);
        } else {
            setOrderItems([...orderItems, {
                product_id: selectedProduct.product_id,
                product_name: selectedProduct.name,
                quantity: quantity,
                unit_cost: selectedProduct.cost_price // Usar cost_price del producto
            }]);
        }

        setSelectedProduct(null);
        setQuantity(1);
    };

    const handleRemoveItem = (index) => {
        const newItems = [...orderItems];
        newItems.splice(index, 1);
        setOrderItems(newItems);
    };

    const handleSubmit = async () => {
    if (!formData.branch_id || orderItems.length === 0) {
        setErrorMessage('Se requiere sucursal y al menos un producto');
        return;
    }

    // Validar cantidades positivas
    if (orderItems.some(item => item.quantity <= 0 || item.unit_cost <= 0)) {
        setErrorMessage('Cantidades y costos deben ser mayores a cero');
        return;
    }

    const orderData = {
        supplier_id: supplierId,
        branch_id: formData.branch_id,
        expected_delivery_date: formData.expected_delivery_date || null,
        notes: formData.notes || '',
        status: "APPROVED",
        items: orderItems.map(item => ({
            product_id: item.product_id,
            quantity: Number(item.quantity),
            unit_cost: Number(item.unit_cost)
        }))
    };

    try {
        setLoading(true);
        setErrorMessage('');
        setSuccessMessage('');
        
        const response = await createPurchaseOrder(orderData);
        
        setSuccessMessage(`Pedido #${response.order_id} creado y aprobado exitosamente!`);
        
        // Cierre automático después de 3 segundos
        setTimeout(() => {
            onClose(true);
        }, 3000);

    } catch (error) {
        console.error('Error completo:', error);
        const errorMsg = error.response?.data?.detail || 
                        error.message || 
                        'Error al procesar pedido';
        setErrorMessage(errorMsg);
    } finally {
        setLoading(false);
    }
};
// Función auxiliar para verificar inventario
async function verifyInventoryUpdate(branchId, productIds) {
    try {
        const response = await api.get('/inventory/', {
            params: { branch_id: branchId, product_ids: productIds.join(',') }
        });
        return { success: true, data: response.data };
    } catch (error) {
        console.error("Error verificando inventario:", error);
        return { success: false };
    }
}
    const totalAmount = orderItems.reduce((sum, item) => sum + (item.quantity * item.unit_cost), 0);

    const handleBranchChange = (event) => {
        setFormData({...formData, branch_id: event.target.value});
    };

    const handleProductChange = (event, newValue) => {
        setSelectedProduct(newValue);
    };

    return (
        <Dialog open={open} onClose={() => onClose(false)} maxWidth="md" fullWidth>
            <DialogTitle>Nuevo Pedido a Proveedor</DialogTitle>
            <DialogContent>
                {successMessage && (
                    <Alert severity="success" sx={{ mb: 2 }}>
                        {successMessage}
                    </Alert>
                )}
                
                {errorMessage && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {errorMessage}
                    </Alert>
                )}
                <Grid container spacing={3} sx={{ mt: 1 }}>
                    <Grid item xs={12} md={6}>
                        <FormControl fullWidth sx={{ mb: 2 }}>
                            <InputLabel>Sucursal *</InputLabel>
                            <Select
                                value={formData.branch_id}
                                onChange={handleBranchChange}
                                label="Sucursal *"
                                required
                            >
                                {branches.map(branch => (
                                    <MenuItem key={branch.id} value={branch.id}>
                                        {branch.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <TextField
                            label="Fecha esperada de entrega"
                            type="date"
                            InputLabelProps={{ shrink: true }}
                            fullWidth
                            sx={{ mb: 2 }}
                            value={formData.expected_delivery_date}
                            onChange={(e) => setFormData({...formData, expected_delivery_date: e.target.value})}
                        />

                        <TextField
                            label="Notas"
                            multiline
                            rows={3}
                            fullWidth
                            value={formData.notes}
                            onChange={(e) => setFormData({...formData, notes: e.target.value})}
                        />
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <FormControl fullWidth sx={{ mb: 2 }}>
                            <Autocomplete
                                value={selectedProduct}
                                onChange={handleProductChange}
                                options={products}
                                getOptionLabel={(option) => `${option.name} - $${option.cost_price?.toFixed(2) || '0.00'}`}
                                isOptionEqualToValue={(option, value) => option?.product_id === value?.product_id}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Buscar Producto"
                                        size="small"
                                        fullWidth
                                        InputProps={{
                                            ...params.InputProps,
                                            endAdornment: (
                                                <>
                                                    {loadingProducts ? <div>Cargando...</div> : null}
                                                    {params.InputProps.endAdornment}
                                                </>
                                            ),
                                        }}
                                        onChange={(e) => setSearchProductText(e.target.value)}
                                    />
                                )}
                                noOptionsText={loadingProducts ? "Cargando productos..." : "No hay productos"}
                            />
                        </FormControl>

                        <TextField
                            label="Cantidad"
                            type="number"
                            fullWidth
                            sx={{ mb: 2 }}
                            value={quantity}
                            onChange={(e) => setQuantity(Math.max(1, e.target.value))}
                            inputProps={{ min: 1 }}
                        />

                        <Button
                            variant="contained"
                            startIcon={<Add />}
                            onClick={handleAddItem}
                            disabled={!selectedProduct}
                        >
                            Agregar Producto
                        </Button>
                    </Grid>

                    <Grid item xs={12}>
                        <TableContainer component={Paper} sx={{ overflowX: 'auto' }}>
                            <Table sx={{ minWidth: 650 }}>
                                {/* Remove any whitespace here */}
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={{ whiteSpace: 'nowrap' }}>Producto</TableCell>
                                        <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>Cantidad</TableCell>
                                        <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>Costo Unitario</TableCell>
                                        <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>Acciones</TableCell>
                                    </TableRow>
                                </TableHead>
                                {/* Remove any whitespace here */}
                                <TableBody>
                                    {orderItems.map((item, index) => (
                                        <TableRow key={`order-item-${index}`}>
                                            <TableCell sx={{ whiteSpace: 'nowrap' }}>{item.product_name}</TableCell>
                                            <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>{item.quantity}</TableCell>
                                            <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>${item.unit_cost?.toFixed(2)}</TableCell>
                                            <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                                                <IconButton onClick={() => handleRemoveItem(index)}>
                                                    <Delete />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {orderItems.length > 0 && (
                                        <TableRow>
                                            <TableCell colSpan={2} />
                                            <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                                                <strong>Total:</strong>
                                            </TableCell>
                                            <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                                                <strong>${totalAmount.toFixed(2)}</strong>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                                {/* Remove any whitespace here */}
                            </Table>
                        </TableContainer>
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button onClick={() => onClose(false)}>Cancelar</Button>
                <Button variant="contained" onClick={handleSubmit} disabled={orderItems.length === 0 || !formData.branch_id}>
                    Crear Pedido
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default PurchaseOrderModal;