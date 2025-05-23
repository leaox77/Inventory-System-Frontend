// src/components/SupplierForm.jsx
import React, { useState } from 'react';
import { TextField, Button, Stack, Box, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { createSupplier, updateSupplier } from '../../services/supplierService';

const SupplierForm = ({ supplier, onSuccess, onClose }) => {
    const [formData, setFormData] = useState({
        name: supplier?.name || '',
        contact_name: supplier?.contact_name || '',
        phone: supplier?.phone || '',
        email: supplier?.email || '',
        address: supplier?.address || '',
        is_active: supplier?.is_active !== false,
    });

    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            if (supplier) {
                await updateSupplier(supplier.supplier_id, formData);
            } else {
                await createSupplier(formData);
            }
            onSuccess();
        } catch (error) {
            console.error('Full error:', error);
            setError(error.response?.data?.detail || 
                    error.response?.data?.message || 
                    error.message || 
                    'Error al guardar el proveedor');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog 
            open={true} 
            onClose={onClose} 
            maxWidth="sm" // On small screens, this will naturally behave like 'xs' or 'sm'
            fullWidth     // This makes the dialog take 100% width on smaller screens
        >
            <DialogTitle>
                {supplier ? 'Editar Proveedor' : 'Nuevo Proveedor'}
            </DialogTitle>
            <DialogContent>
                <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
                    <Stack spacing={2}>
                        <TextField
                            label="Nombre *"
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            required
                            fullWidth // Ensures it takes full width of the parent container
                        />
                        <TextField
                            label="Contacto"
                            value={formData.contact_name}
                            onChange={(e) => setFormData({...formData, contact_name: e.target.value})}
                            fullWidth // Ensures it takes full width of the parent container
                        />
                        <TextField
                            label="Teléfono"
                            value={formData.phone}
                            onChange={(e) => setFormData({...formData, phone: e.target.value})}
                            fullWidth // Ensures it takes full width of the parent container
                        />
                        <TextField
                            label="Email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                            fullWidth // Ensures it takes full width of the parent container
                        />
                        <TextField
                            label="Dirección"
                            multiline
                            rows={3}
                            value={formData.address}
                            onChange={(e) => setFormData({...formData, address: e.target.value})}
                            fullWidth // Ensures it takes full width of the parent container
                        />
                    </Stack>
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} disabled={loading}>Cancelar</Button>
                <Button 
                    onClick={handleSubmit}
                    variant="contained" 
                    color="primary"
                    disabled={loading || !formData.name}
                >
                    {loading ? 'Guardando...' : (supplier ? 'Actualizar' : 'Crear')}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default SupplierForm;