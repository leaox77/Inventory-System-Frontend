import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Box, Button, Container, Paper, Table, TableBody, 
  TableCell, TableContainer, TableHead, TableRow, 
  Typography, IconButton, Alert, Snackbar
} from '@mui/material'
import { Add, Edit, Delete } from '@mui/icons-material'
import userService from '../services/userService'

const UsersPage = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const data = await userService.getUsers()
      setUsers(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (userId) => {
    if (window.confirm('¿Estás seguro de eliminar este usuario?')) {
      try {
        await userService.deleteUser(userId)
        setUsers(users.filter(u => u.user_id !== userId))
        setSuccess('Usuario eliminado correctamente')
      } catch (err) {
        setError(err.message)
      }
    }
  }

  const handleCloseSnackbar = () => {
    setError(null)
    setSuccess(null)
  }

  if (loading) return <Typography>Cargando usuarios...</Typography>
  if (error) return <Alert severity="error">{error}</Alert>

  return (
    <Container maxWidth="lg">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Usuarios</Typography>
        <Button 
          variant="contained" 
          startIcon={<Add />}
          onClick={() => navigate('/usuarios/nuevo')}
        >
          Nuevo Usuario
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nombre</TableCell>
              <TableCell>Username</TableCell>
              <TableCell>Rol</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.user_id}>
                <TableCell>{user.full_name}</TableCell>
                <TableCell>{user.username}</TableCell>
                <TableCell>{user.role?.name || 'Sin rol'}</TableCell>
                <TableCell>{user.is_active ? 'Activo' : 'Inactivo'}</TableCell>
                <TableCell>
                  <IconButton 
                    color="primary" 
                    onClick={() => navigate(`/usuarios/editar/${user.user_id}`)}
                  >
                    <Edit />
                  </IconButton>
                  <IconButton 
                    color="error" 
                    onClick={() => handleDelete(user.user_id)}
                  >
                    <Delete />
                  </IconButton>
                </TableCell>
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

export default UsersPage