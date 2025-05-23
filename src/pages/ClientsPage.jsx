import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Button, Container, Paper, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow,
  Typography, IconButton, Alert, Snackbar, TextField,
  InputAdornment, Stack
} from '@mui/material';
import { Add, Edit, Delete, Search } from '@mui/icons-material';
import clientService from '../services/clientService';
import { useAuth } from '../contexts/AuthContext';

const ClientsPage = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [searchTimeout, setSearchTimeout] = useState(null);
  const navigate = useNavigate();

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchInput(value);

    if (searchTimeout) clearTimeout(searchTimeout);

    setSearchTimeout(
      setTimeout(() => {
        setSearchTerm(value);
      }, 1000)
    );
  };

  useEffect(() => {
    return () => {
      if (searchTimeout) clearTimeout(searchTimeout);
    };
  }, [searchTimeout]);

  useEffect(() => {
    fetchClients();
  }, [searchTerm]);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const data = searchTerm
        ? await clientService.searchClients(searchTerm)
        : await clientService.getClients();
      setClients(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (clientId) => {
    if (window.confirm('¿Estás seguro de eliminar este cliente?')) {
      try {
        await clientService.deleteClient(clientId);
        setClients(clients.filter(c => c.client_id !== clientId));
        setSuccess('Cliente eliminado correctamente');
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const handleCloseSnackbar = () => {
    setError(null);
    setSuccess(null);
  };

  const { currentUser } = useAuth();

  const hasAnyActionPermission = () => {
    if (!currentUser) return false;
    const requiredPermissions = ['reports', 'all', 'sales'];
    return requiredPermissions.some(
      permission => currentUser.permissions?.[permission] === true
    );
  };

  const canEdit = () =>
    currentUser?.permissions?.all === true ||
    currentUser?.permissions?.reports === true ||
    currentUser?.permissions?.sales === true;

  const canDelete = () =>
    currentUser?.permissions?.all === true;

  if (loading) return <Typography>Cargando clientes...</Typography>;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Container maxWidth="lg">
      <Box sx={{
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        justifyContent: 'space-between',
        alignItems: { xs: 'flex-start', sm: 'center' },
        mb: 3,
        gap: 2
      }}>
        <Typography variant="h4">Clientes</Typography>
        {hasAnyActionPermission() && (
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => navigate('/clientes/nuevo')}
            sx={{ width: { xs: '100%', sm: 'auto' } }}
          >
            Nuevo Cliente
          </Button>
        )}
      </Box>

      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Buscar por CI/NIT o nombre..."
          value={searchInput}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: <InputAdornment position="start"><Search /></InputAdornment>
          }}
        />
      </Box>

      <TableContainer component={Paper}>
  <Table size="small">
    <TableHead>
      <TableRow>
        <TableCell>CI/NIT</TableCell>
        <TableCell>Nombre</TableCell>
        {/* Solo mostrar Teléfono y Email en pantallas md o más grandes */}
        <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>Teléfono</TableCell>
        <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>Email</TableCell>
        {hasAnyActionPermission() && <TableCell>Acciones</TableCell>}
      </TableRow>
    </TableHead>
    <TableBody>
      {clients.map((client) => (
        <TableRow key={client.client_id}>
          <TableCell>{client.ci_nit}</TableCell>
          <TableCell>{client.full_name}</TableCell>
          <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>{client.phone || '-'}</TableCell>
          <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>{client.email || '-'}</TableCell>
          {hasAnyActionPermission() && (
            <TableCell>
              <Stack direction="row" spacing={1}>
                {canEdit() && (
                  <IconButton color="primary" onClick={() => navigate(`/clientes/editar/${client.client_id}`)} size="small">
                    <Edit />
                  </IconButton>
                )}
                {canDelete() && (
                  <IconButton color="error" onClick={() => handleDelete(client.client_id)} size="small">
                    <Delete />
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

export default ClientsPage;
