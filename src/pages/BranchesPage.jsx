import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Box, Button, Container, Paper, Table, TableBody, 
  TableCell, TableContainer, TableHead, TableRow, 
  Typography, IconButton, Alert, Snackbar
} from '@mui/material'
import { Add, Edit, Delete } from '@mui/icons-material'
import * as branchService from '../services/branchService'

const BranchesPage = () => {
  const [branches, setBranches] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    fetchBranches()
  }, [])

  const fetchBranches = async () => {
    try {
      setLoading(true)
      const data = await branchService.getBranches()
      setBranches(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (branchId) => {
    if (window.confirm('¿Estás seguro de eliminar esta sucursal?')) {
      try {
        await branchService.deleteBranch(branchId)
        setBranches(branches.filter(b => b.branch_id !== branchId))
        setSuccess('Sucursal eliminada correctamente')
      } catch (err) {
        setError(err.message)
      }
    }
  }

  const handleCloseSnackbar = () => {
    setError(null)
    setSuccess(null)
  }

  if (loading) return <Typography>Cargando sucursales...</Typography>
  if (error) return <Alert severity="error">{error}</Alert>

  return (
    <Container maxWidth="lg">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Sucursales</Typography>
        <Button 
          variant="contained" 
          startIcon={<Add />}
          onClick={() => navigate('/sucursales/nueva')}
        >
          Nueva Sucursal
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nombre</TableCell>
              <TableCell>Dirección</TableCell>
              <TableCell>Teléfono</TableCell>
              <TableCell>Horario</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {branches.map((branch) => (
              <TableRow key={branch.branch_id}>
                <TableCell>{branch.name}</TableCell>
                <TableCell>{branch.address}</TableCell>
                <TableCell>{branch.phone || '-'}</TableCell>
                <TableCell>{branch.opening_hours || '-'}</TableCell>
                <TableCell>
                  <IconButton 
                    color="primary" 
                    onClick={() => navigate(`/sucursales/editar/${branch.branch_id}`)}
                  >
                    <Edit />
                  </IconButton>
                  <IconButton 
                    color="error" 
                    onClick={() => handleDelete(branch.branch_id)}
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

export default BranchesPage