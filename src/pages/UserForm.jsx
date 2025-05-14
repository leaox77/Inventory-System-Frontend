import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { 
  Box, Button, Container, TextField, Typography, 
  Alert, CircularProgress, Paper, FormControl, 
  InputLabel, Select, MenuItem, Checkbox, FormControlLabel
} from '@mui/material'
import userService from '../services/userService'

const UserForm = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(!!id)
  const [loadingRoles, setLoadingRoles] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [roles, setRoles] = useState([])
  const [user, setUser] = useState({
    username: '',
    full_name: '',
    password: '',
    role_id: '',
    is_active: true
  })

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        setLoadingRoles(true)
        const data = await userService.getRoles()
        setRoles(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoadingRoles(false)
      }
    }
    fetchRoles()

    if (id) {
      const fetchUser = async () => {
        try {
          const data = await userService.getUser(id)
          setUser({
            username: data.username,
            full_name: data.full_name || '',
            password: '',
            role_id: data.role?.role_id || '',
            is_active: data.is_active
          })
        } catch (err) {
          setError(err.message)
        } finally {
          setLoading(false)
        }
      }
      fetchUser()
    }
  }, [id])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setUser(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
        setLoading(true);
        
        // Preparar datos para enviar - solo enviar password si no está vacío
        const userData = {
            username: user.username,
            full_name: user.full_name,
            role_id: user.role_id,
            is_active: user.is_active,
            ...(user.password && { password: user.password }) // Solo incluir si tiene valor
        };

        if (id) {
            await userService.updateUser(id, userData);
            setSuccess('Usuario actualizado correctamente');
            console.log('Datos enviados:', userData);
        } else {
            await userService.createUser(userData);
            setSuccess('Usuario creado correctamente');
        }
        
        setTimeout(() => navigate('/usuarios'), 2000);
    } catch (err) {
        setError(err.message || 'Error al guardar el usuario');
    } finally {
        setLoading(false);
    }
}

  if (loading) return (
    <Container maxWidth="md">
      <CircularProgress />
    </Container>
  )

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h5" gutterBottom>
          {id ? 'Editar Usuario' : 'Nuevo Usuario'}
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          <TextField
            fullWidth
            margin="normal"
            label="Nombre de usuario"
            name="username"
            value={user.username}
            onChange={handleChange}
            required
            disabled={!!id} // Deshabilitar para edición
          />
          
          <TextField
            fullWidth
            margin="normal"
            label="Nombre completo"
            name="full_name"
            value={user.full_name}
            onChange={handleChange}
          />
          
          <TextField
            fullWidth
            margin="normal"
            label="Contraseña"
            name="password"
            type="password"
            value={user.password}
            onChange={handleChange}
            required={!id}
            helperText={id ? "Dejar en blanco para mantener la contraseña actual" : ""}
          />

          <FormControl fullWidth margin="normal">
            <InputLabel>Rol *</InputLabel>
            <Select
              name="role_id"
              value={user.role_id}
              onChange={handleChange}
              label="Rol *"
              required
            >
              {loadingRoles ? (
                <MenuItem disabled>Cargando roles...</MenuItem>
              ) : (
                roles.map(role => (
                  <MenuItem key={role.role_id} value={role.role_id}>
                    {role.name}
                  </MenuItem>
                ))
              )}
            </Select>
          </FormControl>

          <FormControlLabel
            control={
              <Checkbox
                name="is_active"
                checked={user.is_active}
                onChange={handleChange}
              />
            }
            label="Usuario activo"
            sx={{ mt: 2 }}
          />

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
            <Button 
              variant="outlined" 
              sx={{ mr: 2 }}
              onClick={() => navigate('/usuarios')}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              variant="contained"
              disabled={loading}
            >
              {id ? 'Actualizar' : 'Crear'}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  )
}

export default UserForm