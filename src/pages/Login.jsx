import { useState } from 'react'
import { 
  Avatar, 
  Button, 
  TextField, 
  Paper, 
  Box, 
  Grid, 
  Typography, 
  InputAdornment, 
  IconButton,
  Alert,
  useTheme,
  useMediaQuery
} from '@mui/material'
import {
  LockOutlined as LockOutlinedIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon
} from '@mui/icons-material'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { useTheme as useAppTheme } from '../contexts/ThemeContext'
import tusuper from '../assets/tusuper.jpg'

function Login() {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [formErrors, setFormErrors] = useState({})
  const { login, error, loading } = useAuth()
  const { darkMode, toggleDarkMode } = useAppTheme()
  const navigate = useNavigate()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value
    })
    
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: ''
      })
    }
  }

  const validateForm = () => {
    const errors = {}
    if (!formData.username.trim()) {
      errors.username = 'El nombre de usuario es requerido'
    }
    if (!formData.password) {
      errors.password = 'La contraseña es requerida'
    }
    return errors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    const errors = validateForm()
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      return
    }
    
    try {
      await login(formData)
      const user = JSON.parse(localStorage.getItem('user'))
      if (user) {
        navigate('/')
      }
    } catch (err) {
      console.error('Error en inicio de sesión:', err)
    }
  }

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  return (
    <Grid container component="main" sx={{ height: '100vh', overflow: 'hidden' }}>
      {/* Sección de imagen - Visible en todos los dispositivos */}
      <Grid
        item
        xs={12}
        sm={6}
        sx={{
          display: 'flex',
          position: 'relative',
          height: isMobile ? '30vh' : '100vh',
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${tusuper})`,
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: '100%',
            bgcolor: 'rgba(255, 165, 0, 0.8)',
            color: 'white',
            p: 3,
            textAlign: 'center',
          }}
        >
          <Typography variant={isMobile ? "h5" : "h4"} fontWeight="bold" gutterBottom sx={{ textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>
            ¡Bienvenido!
          </Typography>
          <Typography variant={isMobile ? "body2" : "body1"} sx={{ textShadow: '1px 1px 3px rgba(0,0,0,0.5)' }}>
            Sistema de Gestión de Inventarios TuSuper
          </Typography>
        </Box>
      </Grid>

      {/* Sección del formulario */}
      <Grid 
        item 
        xs={12} 
        sm={6} 
        component={Paper} 
        elevation={6} 
        square 
        sx={{ 
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          height: isMobile ? '70vh' : '100vh',
          overflowY: 'auto',
          backgroundColor: theme => theme.palette.background.default
        }}
      >
        <Box
          sx={{
            my: isMobile ? 2 : 8,
            mx: isMobile ? 2 : 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            position: 'relative'
          }}
        >
          {/* Botón de cambio de tema */}
          <IconButton
            onClick={toggleDarkMode}
            sx={{
              position: 'absolute',
              top: 0,
              right: 0,
              color: theme.palette.mode === 'dark' ? '#FFD54F' : '#616161'
            }}
          >
            {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
          </IconButton>

          <Avatar sx={{ 
            m: 1, 
            width: isMobile ? 50 : 60, 
            height: isMobile ? 50 : 60,
            backgroundColor: '#FF8F00'
          }}>
            <LockOutlinedIcon sx={{ fontSize: isMobile ? 26 : 32 }} />
          </Avatar>
          
          <Typography component="h1" variant={isMobile ? "h5" : "h4"} sx={{ 
            mb: 3,
            color: '#FF8F00',
            fontWeight: 'bold',
            textAlign: 'center'
          }}>
            Iniciar Sesión
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ 
              width: '100%', 
              mb: 3,
              backgroundColor: '#F44336',
              color: 'white'
            }}>
              {error}
            </Alert>
          )}
          
          <Box 
            component="form" 
            onSubmit={handleSubmit} 
            sx={{ 
              width: '100%',
              maxWidth: '400px',
              '& .MuiTextField-root': {
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  backgroundColor: theme => theme.palette.background.paper,
                  '& fieldset': {
                    borderColor: theme => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.23)' : 'rgba(0, 0, 0, 0.23)'
                  },
                  '&:hover fieldset': {
                    borderColor: theme => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)'
                  }
                },
                '& .MuiInputLabel-root': {
                  color: theme => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)'
                },
                '& .MuiInputBase-input': {
                  color: theme => theme.palette.text.primary
                }
              }
            }}
          >
            <TextField
              margin="normal"
              required
              fullWidth
              id="username"
              label="Nombre de usuario"
              name="username"
              autoComplete="username"
              autoFocus
              value={formData.username}
              onChange={handleChange}
              error={!!formErrors.username}
              helperText={formErrors.username}
              size={isMobile ? "small" : "medium"}
              sx={{
                '& label.Mui-focused': {
                  color: '#FF8F00',
                },
                '& .MuiOutlinedInput-root': {
                  '&.Mui-focused fieldset': {
                    borderColor: '#FF8F00',
                  },
                },
              }}
            />
            
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Contraseña"
              type={showPassword ? 'text' : 'password'}
              id="password"
              autoComplete="current-password"
              value={formData.password}
              onChange={handleChange}
              error={!!formErrors.password}
              helperText={formErrors.password}
              size={isMobile ? "small" : "medium"}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleTogglePasswordVisibility}
                      edge="end"
                      sx={{ color: '#FF8F00' }}
                    >
                      {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                '& label.Mui-focused': {
                  color: '#FF8F00',
                },
                '& .MuiOutlinedInput-root': {
                  '&.Mui-focused fieldset': {
                    borderColor: '#FF8F00',
                  },
                },
              }}
            />
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ 
                mt: 3, 
                mb: 2, 
                py: isMobile ? 1 : 1.5,
                fontSize: isMobile ? '0.9rem' : '1rem',
                fontWeight: 'bold',
                backgroundColor: '#FF8F00',
                '&:hover': {
                  backgroundColor: '#F57C00',
                },
                '&:disabled': {
                  backgroundColor: '#FFB74D',
                }
              }}
              disabled={loading}
            >
              {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </Button>
          </Box>
        </Box>
      </Grid>
    </Grid>
  )
}

export default Login