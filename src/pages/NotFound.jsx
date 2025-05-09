import { Box, Button, Typography, Container } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { Error as ErrorIcon, Home as HomeIcon } from '@mui/icons-material'

function NotFound() {
  const navigate = useNavigate()

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          textAlign: 'center',
          py: 4,
        }}
      >
        <ErrorIcon sx={{ fontSize: 100, color: 'error.main', mb: 2 }} />
        
        <Typography variant="h1" component="h1" gutterBottom>
          404
        </Typography>
        
        <Typography variant="h4" component="h2" gutterBottom>
          Página no encontrada
        </Typography>
        
        <Typography variant="body1" color="text.secondary" paragraph>
          Lo sentimos, no pudimos encontrar la página que estás buscando.
          Es posible que haya sido movida o simplemente no exista.
        </Typography>
        
        <Button
          variant="contained"
          color="primary"
          size="large"
          startIcon={<HomeIcon />}
          onClick={() => navigate('/')}
          sx={{ mt: 3 }}
        >
          Ir al Inicio
        </Button>
      </Box>
    </Container>
  )
}

export default NotFound