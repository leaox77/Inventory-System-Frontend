import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Button, Container, Paper, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow,
  Typography, IconButton, Alert, Snackbar, Stack
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import * as branchService from '../services/branchService';
import { useAuth } from '../contexts/AuthContext';

const BranchesPage = () => {
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchBranches();
  }, []);

  const fetchBranches = async () => {
    try {
      setLoading(true);
      const data = await branchService.getBranches();
      setBranches(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (branchId) => {
    if (window.confirm('¿Estás seguro de eliminar esta sucursal?')) {
      try {
        await branchService.deleteBranch(branchId);
        setBranches(branches.filter(b => b.branch_id !== branchId));
        setSuccess('Sucursal eliminada correctamente');
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const { currentUser } = useAuth();

  const hasAnyActionPermission = () => {
    if (!currentUser) return false;
    const requiredPermissions = ['reports', 'all'];
    return requiredPermissions.some(
      permission => currentUser.permissions?.[permission] === true
    );
  };

  const canEdit = () =>
    currentUser?.permissions?.all === true || currentUser?.permissions?.reports === true;
  const canDelete = () => currentUser?.permissions?.all === true;

  const handleCloseSnackbar = () => {
    setError(null);
    setSuccess(null);
  };

  if (loading) return <Typography>Cargando sucursales...</Typography>;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Container maxWidth="lg">
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
          mb: 3,
          gap: 2
        }}
      >
        <Typography variant="h4">Sucursales</Typography>
        {hasAnyActionPermission() && (
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => navigate('/sucursales/nueva')}
            sx={{ width: { xs: '100%', sm: 'auto' } }}
          >
            Nueva Sucursal
          </Button>
        )}
      </Box>

      <TableContainer component={Paper} sx={{ width: '100%', overflowX: 'auto' }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ minWidth: 100 }}>Nombre</TableCell>
              <TableCell sx={{ minWidth: 150 }}>Dirección</TableCell>
              <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' }, minWidth: 100 }}>
                Teléfono
              </TableCell>
              <TableCell sx={{ display: { xs: 'none', md: 'table-cell' }, minWidth: 120 }}>
                Horario
              </TableCell>
              {hasAnyActionPermission() && (
                <TableCell sx={{ minWidth: 100 }}>Acciones</TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {branches.map((branch) => (
              <TableRow key={branch.branch_id}>
                <TableCell
                  sx={{
                    maxWidth: 150,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'normal',
                    overflowWrap: 'break-word',
                    wordBreak: 'break-word',
                    px: 1,
                  }}
                >
                  {branch.name}
                </TableCell>
                <TableCell
                  sx={{
                    maxWidth: 200,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'normal',
                    overflowWrap: 'break-word',
                    wordBreak: 'break-word',
                    px: 1,
                  }}
                >
                  {branch.address}
                </TableCell>
                <TableCell
                  sx={{
                    display: { xs: 'none', sm: 'table-cell' },
                    whiteSpace: 'normal',
                    px: 1,
                  }}
                >
                  {branch.phone || '-'}
                </TableCell>
                <TableCell
                  sx={{
                    display: { xs: 'none', md: 'table-cell' },
                    whiteSpace: 'normal',
                    px: 1,
                  }}
                >
                  {branch.opening_hours || '-'}
                </TableCell>
                {hasAnyActionPermission() && (
                  <TableCell sx={{ px: 1 }}>
                    <Stack direction="row" spacing={1}>
                      {canEdit() && (
                        <IconButton
                          color="primary"
                          onClick={() => navigate(`/sucursales/editar/${branch.branch_id}`)}
                          size="small"
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                      )}
                      {canDelete() && (
                        <IconButton
                          color="error"
                          onClick={() => handleDelete(branch.branch_id)}
                          size="small"
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      )}
                    </Stack>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        message={error}
      />
      <Snackbar
        open={!!success}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        message={success}
      />
    </Container>
  );
};

export default BranchesPage;
