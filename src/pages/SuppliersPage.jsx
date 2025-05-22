// src/pages/SuppliersPage.jsx
import React, { useState, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { Button, Box, IconButton, Dialog } from '@mui/material';
import { Add, Edit, Delete, Inventory } from '@mui/icons-material';
import { getSuppliers, deleteSupplier } from '../services/supplierService';
import SupplierForm from '../components/ui/SupplierForm';
import PurchaseOrderModal from '../components/ui/PurcharseOrderModal';
import { useAuth } from '../contexts/AuthContext';

const SuppliersPage = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [openForm, setOpenForm] = useState(false);
  const [openOrderModal, setOpenOrderModal] = useState(null);
  const [currentSupplier, setCurrentSupplier] = useState(null);

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    const data = await getSuppliers();
    setSuppliers(data);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este proveedor?')) {
      await deleteSupplier(id);
      fetchSuppliers();
    }
  };

  const { currentUser } = useAuth();
  
    const hasAnyActionPermission = () => {
      if (!currentUser) return false;
      // Lista de permisos requeridos para las acciones en esta tabla
      const requiredPermissions = ['reports', 'all'];
      
      // Verifica si el usuario tiene al menos uno de los permisos requeridos
      return requiredPermissions.some(
        permission => currentUser.permissions?.[permission] === true
      );
    };

  const canEdit = () => currentUser?.permissions?.all === true || currentUser?.permissions?.reports === true;
  const canDelete = () => currentUser?.permissions?.all === true;

  const columns = [
    { field: 'supplier_id', headerName: 'ID', width: 70 },
    { field: 'name', headerName: 'Nombre', flex: 1 },
    { field: 'contact_name', headerName: 'Contacto', flex: 1 },
    { field: 'phone', headerName: 'Teléfono', flex: 1 },
    { field: 'email', headerName: 'Email', flex: 1 },
    {
      field: 'actions',
      headerName: 'Acciones',
      width: 200,
      renderCell: (params) => (
        <div>
          {canEdit() && (
            <IconButton onClick={() => {
              setCurrentSupplier(params.row);
              setOpenForm(true);
            }}>
              <Edit 
                color="primary"
              />
            </IconButton>
          )}
          {canDelete() && (
            <IconButton onClick={() => handleDelete(params.row.supplier_id)}>
              <Delete 
                color="error"
              />
            </IconButton>
          )}
          <IconButton 
            onClick={() => setOpenOrderModal(params.row.supplier_id)}
            color="primary"
          >
            <Inventory />
          </IconButton>
        </div>
      ),
    },
  ];

  return (
    <Box sx={{ height: 600, width: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        
        {hasAnyActionPermission() && (
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => {
              setCurrentSupplier(null);
              setOpenForm(true);
            }}
          >
            Nuevo Proveedor
          </Button>
        )}
      </Box>
      
      <DataGrid
        rows={suppliers}
        columns={columns}
        pageSize={10}
        rowsPerPageOptions={[10]}
        getRowId={(row) => row.supplier_id}
      />
      
      <Dialog open={openForm} onClose={() => setOpenForm(false)} maxWidth="sm" fullWidth>
        <SupplierForm
          supplier={currentSupplier}
          onSuccess={() => {
            setOpenForm(false);
            fetchSuppliers();
          }}
          onClose={() => setOpenForm(false)}
        />
      </Dialog>
      
      {openOrderModal && (
        <PurchaseOrderModal
          open={!!openOrderModal}
          onClose={() => setOpenOrderModal(null)}
          supplierId={openOrderModal}
        />
      )}
    </Box>
  );
};

export default SuppliersPage;