import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Box, Button, Container, Paper, Table, TableBody, 
  TableCell, TableContainer, TableHead, TableRow, 
  Typography, IconButton, Alert, Snackbar, TextField, InputAdornment
} from '@mui/material'
import { Add, Edit, Delete, Search } from '@mui/icons-material'
import clientService from '../services/clientService'
import { useAuth } from '../contexts/AuthContext'

const ClientsPage = () => {
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [searchTimeout, setSearchTimeout] = useState(null)
  const navigate = useNavigate()

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
    fetchClients()
  }, [searchTerm])

  const fetchClients = async () => {
    try {
      setLoading(true)
      const data = searchTerm 
        ? await clientService.searchClients(searchTerm)
        : await clientService.getClients()
      setClients(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (clientId) => {
    if (window.confirm('¿Estás seguro de eliminar este cliente?')) {
      try {
        await clientService.deleteClient(clientId)
        setClients(clients.filter(c => c.client_id !== clientId))
        setSuccess('Cliente eliminado correctamente')
      } catch (err) {
        setError(err.message)
      }
    }
  }

  const handleCloseSnackbar = () => {
    setError(null)
    setSuccess(null)
  }

  const { currentUser } = useAuth();
      
        const hasAnyActionPermission = () => {
          if (!currentUser) return false;
          // Lista de permisos requeridos para las acciones en esta tabla
          const requiredPermissions = ['reports', 'all', 'sales'];
          
          // Verifica si el usuario tiene al menos uno de los permisos requeridos
          return requiredPermissions.some(
            permission => currentUser.permissions?.[permission] === true
          );
        };
    
      const canEdit = () => currentUser?.permissions?.all === true || currentUser?.permissions?.reports === true;
      const canDelete = () => currentUser?.permissions?.all === true;
    

  if (loading) return <Typography>Cargando clientes...</Typography>
  if (error) return <Alert severity="error">{error}</Alert>

  return (
    <Container maxWidth="lg">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Clientes</Typography>
        { hasAnyActionPermission() && (
          <Button 
            variant="contained" 
            startIcon={<Add />}
            onClick={() => navigate('/clientes/nuevo')}
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
            startAdornment: <Search sx={{ mr: 1 }} />
          }}
        />
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>CI/NIT</TableCell>
              <TableCell>Nombre</TableCell>
              <TableCell>Teléfono</TableCell>
              <TableCell>Email</TableCell>
              { canEdit() && (
                <TableCell>Acciones</TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {clients.map((client) => (
              <TableRow key={client.client_id}>
                <TableCell>{client.ci_nit}</TableCell>
                <TableCell>{client.full_name}</TableCell>
                <TableCell>{client.phone || '-'}</TableCell>
                <TableCell>{client.email || '-'}</TableCell>
                { canEdit() && (
                <TableCell>
                  { canEdit() && (
                    <IconButton 
                      color="primary" 
                      onClick={() => navigate(`/clientes/editar/${client.client_id}`)}
                    >
                      <Edit />
                    </IconButton>
                  )}
                  { canDelete() && (
                    <IconButton 
                      color="error" 
                      onClick={() => handleDelete(client.client_id)}
                    >
                      <Delete />
                    </IconButton>
                  )}
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
  )
}

export default ClientsPage