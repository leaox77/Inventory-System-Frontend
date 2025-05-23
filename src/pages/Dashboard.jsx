import { useState, useEffect } from 'react'
import { 
  Grid, 
  Typography, 
  Paper, 
  Box,
  Divider,
  useMediaQuery,
  useTheme
} from '@mui/material'
import {
  Store as StoreIcon,
  LocalOffer as LocalOfferIcon,
  People as PeopleIcon,
  EmojiEvents as EmojiEventsIcon
} from '@mui/icons-material'
import { Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import LoadingIndicator from '../components/ui/LoadingIndicator'
import salesService from '../services/salesService'
import tusuper from '../assets/tusuper.jpg'
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

// Registrar componentes de ChartJS
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
)

function Dashboard() {
  const [loading, setLoading] = useState(true)
  const [dashboardData, setDashboardData] = useState({
    topProducts: [],
    branchSales: []
  })
  const [error, setError] = useState(null)
  
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'))

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        const [
          topProducts, 
          branchSales
        ] = await Promise.all([
          salesService.getTopProducts({ limit: 3 }),
          salesService.getSalesByBranch('all')
        ]);
        
        setDashboardData({
          topProducts: topProducts,
          branchSales: branchSales
        });
        
      } catch (error) {
        console.error('Error al cargar datos del dashboard:', error);
        setError('Error al cargar los datos del dashboard');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData()
  }, [])

  const salesBranchChartData = {
    labels: dashboardData.branchSales.map(item => item.branch_name),
    datasets: [
      {
        label: 'Ventas por Sucursal',
        data: dashboardData.branchSales.map(item => item.total_sales),
        backgroundColor: '#FF8F00',
        borderRadius: 4
      }
    ]
  }

  if (loading) {
    return <LoadingIndicator message="Cargando dashboard..." />
  }

  return (
    <Box sx={{ 
      position: 'relative',
      overflowX: 'hidden',
      pb: 4
    }}>
      {/* Hero Section con imagen de fondo */}
      <Box
        sx={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${tusuper})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          height: isMobile ? '30vh' : isTablet ? '35vh' : '40vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          color: 'white',
          textAlign: 'center',
          p: isMobile ? 2 : 4,
          mb: isMobile ? 2 : 4,
          backgroundAttachment: 'fixed'
        }}
      >
        <Typography 
          variant={isMobile ? "h4" : "h3"} 
          component="h1" 
          gutterBottom
          sx={{ 
            fontWeight: 'bold',
            textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
            mb: 2,
            fontSize: isMobile ? '1.8rem' : '2.4rem'
          }}
        >
          TuSuper
        </Typography>
        <Typography 
          variant={isMobile ? "h6" : "h5"} 
          component="h2"
          sx={{ 
            maxWidth: '800px',
            textShadow: '1px 1px 3px rgba(0,0,0,0.5)',
            mb: 3,
            fontSize: isMobile ? '1.1rem' : '1.5rem',
            px: isMobile ? 1 : 0
          }}
        >
          Gestión inteligente para tu supermercado
        </Typography>
      </Box>

      {/* Sección de Visión y Valores */}
      <Grid container spacing={isMobile ? 2 : 4} sx={{ 
        px: isMobile ? 1 : 4, 
        mb: isMobile ? 3 : 6,
        width: '100%',
        mx: 0
      }}>
        <Grid item xs={12}>
          <Typography 
            variant={isMobile ? "h5" : "h4"} 
            component="h2" 
            sx={{ 
              color: '#FF8F00',
              fontWeight: 'bold',
              mb: 2,
              textAlign: 'center',
              fontSize: isMobile ? '1.5rem' : '2rem',
              px: isMobile ? 1 : 0
            }}
          >
            Nuestra Visión
          </Typography>
          <Typography 
            variant={isMobile ? "body1" : "h6"} 
            component="p" 
            sx={{ 
              textAlign: 'center',
              maxWidth: '800px',
              mx: 'auto',
              lineHeight: 1.6,
              px: isMobile ? 2 : 0,
              fontSize: isMobile ? '0.9rem' : '1.1rem'
            }}
          >
            Ser el supermercado de preferencia en la comunidad, ofreciendo productos frescos, 
            precios competitivos y un servicio excepcional que haga de cada visita una experiencia memorable.
          </Typography>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={0} sx={{ 
            p: isMobile ? 2 : 3, 
            height: '100%',
            backgroundColor: 'rgba(255, 143, 0, 0.1)',
            borderLeft: '4px solid #FF8F00'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <StoreIcon sx={{ 
                color: '#FF8F00', 
                fontSize: isMobile ? 30 : 40, 
                mr: 2 
              }} />
              <Typography variant="h6" sx={{ 
                fontWeight: 'bold',
                fontSize: isMobile ? '1rem' : '1.2rem'
              }}>
                Presencia Local
              </Typography>
            </Box>
            <Typography sx={{ fontSize: isMobile ? '0.85rem' : '1rem' }}>
              3 sucursales estratégicamente ubicadas para servir mejor a nuestra comunidad.
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={0} sx={{ 
            p: isMobile ? 2 : 3, 
            height: '100%',
            backgroundColor: 'rgba(76, 175, 80, 0.1)',
            borderLeft: '4px solid #4CAF50'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <LocalOfferIcon sx={{ 
                color: '#4CAF50', 
                fontSize: isMobile ? 30 : 40, 
                mr: 2 
              }} />
              <Typography variant="h6" sx={{ 
                fontWeight: 'bold',
                fontSize: isMobile ? '1rem' : '1.2rem'
              }}>
                Precios Excelentes
              </Typography>
            </Box>
            <Typography sx={{ fontSize: isMobile ? '0.85rem' : '1rem' }}>
              Ofrecemos precios competitivos para maximizar tu ahorro.
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={0} sx={{ 
            p: isMobile ? 2 : 3, 
            height: '100%',
            backgroundColor: 'rgba(63, 81, 181, 0.1)',
            borderLeft: '4px solid #3F51B5'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <PeopleIcon sx={{ 
                color: '#3F51B5', 
                fontSize: isMobile ? 30 : 40, 
                mr: 2 
              }} />
              <Typography variant="h6" sx={{ 
                fontWeight: 'bold',
                fontSize: isMobile ? '1rem' : '1.2rem'
              }}>
                Clientes Satisfechos
              </Typography>
            </Box>
            <Typography sx={{ fontSize: isMobile ? '0.85rem' : '1rem' }}>
              Más de 10,000 clientes nos prefieren semanalmente.
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={0} sx={{ 
            p: isMobile ? 2 : 3, 
            height: '100%',
            backgroundColor: 'rgba(233, 30, 99, 0.1)',
            borderLeft: '4px solid #E91E63'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <EmojiEventsIcon sx={{ 
                color: '#E91E63', 
                fontSize: isMobile ? 30 : 40, 
                mr: 2 
              }} />
              <Typography variant="h6" sx={{ 
                fontWeight: 'bold',
                fontSize: isMobile ? '1rem' : '1.2rem'
              }}>
                Reconocimientos
              </Typography>
            </Box>
            <Typography sx={{ fontSize: isMobile ? '0.85rem' : '1rem' }}>
              Premio a la Excelencia en Retail 2025.
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Sección de Trabajando en Mejoras */}
      <Grid container spacing={isMobile ? 2 : 4} sx={{ 
        px: isMobile ? 1 : 4, 
        mb: isMobile ? 3 : 6,
        width: '100%',
        mx: 0,
        justifyContent: 'center'
      }}>
        <Grid item xs={12} md={8}>
          <Paper elevation={2} sx={{ 
            p: isMobile ? 2 : 3, 
            borderRadius: 2,
            width: '100%',
            textAlign: 'center',
            backgroundColor: 'rgba(255, 143, 0, 0.05)'
          }}>
            {/* Animación SVG de construcción */}
            <Box sx={{
  width: isMobile ? '180px' : '280px',
  height: isMobile ? '180px' : '280px',
  mx: 'auto',
  mb: 3,
  position: 'relative',
  overflow: 'hidden'
}}>
  <DotLottieReact
      src="https://lottie.host/01f805c8-a425-45e6-adc2-0b9be4ba0327/mwmGBzQsZO.lottie"
      loop
      autoplay
    />
</Box>

            
            <Typography variant={isMobile ? "h5" : "h4"} component="h3" sx={{ 
              color: '#FF8F00',
              fontWeight: 'bold',
              mb: 2
            }}>
              ¡Mejoras en Progreso!
            </Typography>
            
            <Typography variant={isMobile ? "body1" : "h6"} sx={{ mb: 2 }}>
              Estamos trabajando duro para implementar nuevas funcionalidades.
            </Typography>
            
            <Typography variant="body2" color="text.secondary">
              Vuelve pronto para descubrir las novedades que estamos preparando para ti.
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Llamado a la acción */}
      <Box sx={{ 
        backgroundColor: '#FF8F00',
        color: 'white',
        p: isMobile ? 2 : 4,
        textAlign: 'center',
        mt: 4,
        width: '100%'
      }}>
        <Typography variant={isMobile ? "h5" : "h4"} component="h3" sx={{ 
          fontWeight: 'bold', 
          mb: 2,
          fontSize: isMobile ? '1.3rem' : '1.8rem',
          px: isMobile ? 1 : 0
        }}>
          ¡Únete a la Revolución de TuSuper!
        </Typography>
        <Typography variant={isMobile ? "body1" : "h6"} sx={{ 
          mb: 2, 
          maxWidth: '800px', 
          mx: 'auto',
          fontSize: isMobile ? '0.9rem' : '1.1rem',
          px: isMobile ? 1 : 0
        }}>
          Nuestro equipo está listo para ayudarte a optimizar tus operaciones y aumentar tus ventas.
        </Typography>
      </Box>
    </Box>
  )
}

export default Dashboard