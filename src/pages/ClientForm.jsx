import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { 
  Box, Button, Container, TextField, Typography, 
  Alert, CircularProgress, Paper
} from '@mui/material'
import clientService from '../services/clientService'

const ClientForm = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(!!id)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [client, setClient] = useState({
    ci_nit: '',
    full_name: '',
    email: '',
    phone: '',
    address: ''
  })

  useEffect(() => {
    if (id) {
      const fetchClient = async () => {
        try {
          const data = await clientService.getClient(id)
          setClient({
            ci_nit: data.ci_nit || '',
            full_name: data.full_name || '',
            email: data.email || '',
            phone: data.phone || '',
            address: data.address || ''
          })
        } catch (err) {
          setError(err.message)
        } finally {
          setLoading(false)
        }
      }
      fetchClient()
    } else {
      setLoading(false)
    }
  }, [id])

  const handleChange = (e) => {
    const { name, value } = e.target
    setClient(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      if (id) {
        await clientService.updateClient(id, client)
        setSuccess('Cliente actualizado correctamente')
      } else {
        await clientService.createClient(client)
        setSuccess('Cliente creado correctamente')
      }
      setTimeout(() => navigate('/clientes'), 2000)
    } catch (err) {
      console.error('Error saving client:', err)
      setError(err.message || 'Error al guardar el cliente')
    } finally {
      setLoading(false)
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
          {id ? 'Editar Cliente' : 'Nuevo Cliente'}
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          <TextField
            fullWidth
            margin="normal"
            label="CI/NIT"
            name="ci_nit"
            value={client.ci_nit}
            onChange={handleChange}
            required
            disabled={!!id} // Deshabilitar para edición si es necesario
          />
          <TextField
            fullWidth
            margin="normal"
            label="Nombre Completo"
            name="full_name"
            value={client.full_name}
            onChange={handleChange}
            required
          />
          <TextField
            fullWidth
            margin="normal"
            label="Email"
            name="email"
            type="email"
            value={client.email}
            onChange={handleChange}
          />
          <TextField
            fullWidth
            margin="normal"
            label="Teléfono"
            name="phone"
            value={client.phone}
            onChange={handleChange}
          />
          <TextField
            fullWidth
            margin="normal"
            label="Dirección"
            name="address"
            value={client.address}
            onChange={handleChange}
            multiline
            rows={2}
          />

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
            <Button 
              variant="outlined" 
              sx={{ mr: 2 }}
              onClick={() => navigate('/clientes')}
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

export default ClientForm