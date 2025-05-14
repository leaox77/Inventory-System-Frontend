import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { 
  Box, Button, Container, TextField, Typography, 
  Alert, CircularProgress, Paper
} from '@mui/material'
import * as branchService from '../services/branchService'

const BranchForm = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(!!id)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [branch, setBranch] = useState({
    name: '',
    address: '',
    phone: '',
    opening_hours: ''
  })

  useEffect(() => {
    if (id) {
      const fetchBranch = async () => {
        try {
          const data = await branchService.getBranch(id)
          setBranch(data)
        } catch (err) {
          setError(err.message)
        } finally {
          setLoading(false)
        }
      }
      fetchBranch()
    }
  }, [id])

  const handleChange = (e) => {
    const { name, value } = e.target
    setBranch(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (id) {
        await branchService.updateBranch(id, branch)
        setSuccess('Sucursal actualizada correctamente')
      } else {
        await branchService.createBranch(branch)
        setSuccess('Sucursal creada correctamente')
      }
      setTimeout(() => navigate('/sucursales'), 2000)
    } catch (err) {
      setError(err.message)
    }
  }

  if (loading) return <CircularProgress />

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h5" gutterBottom>
          {id ? 'Editar Sucursal' : 'Nueva Sucursal'}
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          <TextField
            fullWidth
            margin="normal"
            label="Nombre"
            name="name"
            value={branch.name}
            onChange={handleChange}
            required
          />
          <TextField
            fullWidth
            margin="normal"
            label="Dirección"
            name="address"
            value={branch.address}
            onChange={handleChange}
            required
            multiline
            rows={2}
          />
          <TextField
            fullWidth
            margin="normal"
            label="Teléfono"
            name="phone"
            value={branch.phone}
            onChange={handleChange}
          />
          <TextField
            fullWidth
            margin="normal"
            label="Horario de Atención"
            name="opening_hours"
            value={branch.opening_hours}
            onChange={handleChange}
            multiline
            rows={2}
          />

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
            <Button 
              variant="outlined" 
              sx={{ mr: 2 }}
              onClick={() => navigate('/sucursales')}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              variant="contained"
            >
              {id ? 'Actualizar' : 'Crear'}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  )
}

export default BranchForm