import { Box, Typography, Breadcrumbs, Link, Button } from '@mui/material'
import { useNavigate, Link as RouterLink } from 'react-router-dom'

function PageHeader({ title, subtitle, breadcrumbs, action, actionLabel, actionIcon, actionPath }) {
  const navigate = useNavigate()

  return (
    <Box sx={{ mb: 4 }}>
      {breadcrumbs && (
        <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 1 }}>
          {breadcrumbs.map((crumb, index) => {
            const isLast = index === breadcrumbs.length - 1
            return isLast ? (
              <Typography color="text.primary" key={index}>
                {crumb.label}
              </Typography>
            ) : (
              <Link 
                component={RouterLink} 
                underline="hover" 
                color="inherit" 
                to={crumb.path} 
                key={index}
              >
                {crumb.label}
              </Link>
            )
          })}
        </Breadcrumbs>
      )}
      
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mb: subtitle ? 1 : 3
      }}>
        <Typography variant="h4" component="h1" gutterBottom={!!subtitle}>
          {title}
        </Typography>
        
        {(action || actionPath) && (
          <Button
            variant="contained"
            color="primary"
            startIcon={actionIcon}
            onClick={action || (() => navigate(actionPath))}
            sx={{ 
              borderRadius: '8px',
              transition: 'transform 0.2s',
              '&:hover': {
                transform: 'translateY(-2px)'
              }
            }}
          >
            {actionLabel || 'Acción'}
          </Button>
        )}
      </Box>
      
      {subtitle && (
        <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 3 }}>
          {subtitle}
        </Typography>
      )}
    </Box>
  )
}

export default PageHeader