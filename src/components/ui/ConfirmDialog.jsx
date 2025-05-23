import { 
  Dialog, 
  DialogActions, 
  DialogContent, 
  DialogContentText, 
  DialogTitle, 
  Button,
  Box,
  useTheme
} from '@mui/material'
import { Warning as WarningIcon } from '@mui/icons-material'

function ConfirmDialog({ 
  open, 
  onClose, 
  onConfirm, 
  title = 'Confirmar acción', 
  message = '¿Estás seguro de que quieres realizar esta acción?',
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  severity = 'warning',
  maxWidth = 'xs'
}) {
  const theme = useTheme();
  
  // Mapeo de colores según severidad
  const colorMap = {
    error: '#F44336',
    warning: '#FF9800',
    info: '#29B6F6',
    success: '#4CAF50',
    primary: '#FF8F00'
  };

  const accentColor = colorMap[severity] || colorMap.warning;

  const handleConfirm = () => {
    onConfirm()
    onClose()
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={maxWidth}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
      sx={{
        '& .MuiPaper-root': {
          borderRadius: '16px',
          background: theme.palette.mode === 'dark' 
            ? 'linear-gradient(145deg, #1E1E1E 0%, #121212 100%)' 
            : 'linear-gradient(145deg, #FFFFFF 0%, #F5F5F5 100%)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
          border: theme.palette.mode === 'dark' 
            ? '1px solid rgba(255, 255, 255, 0.1)' 
            : '1px solid rgba(0, 0, 0, 0.1)'
        }
      }}
    >
      <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        pt: 3,
        px: 3
      }}>
        <Box sx={{
          width: 60,
          height: 60,
          borderRadius: '50%',
          backgroundColor: `${accentColor}20`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mb: 2
        }}>
          <WarningIcon sx={{ 
            fontSize: 32,
            color: accentColor
          }} />
        </Box>
        <DialogTitle 
          id="alert-dialog-title"
          sx={{ 
            textAlign: 'center',
            color: accentColor,
            fontWeight: 'bold',
            pt: 0
          }}
        >
          {title}
        </DialogTitle>
      </Box>
      
      <DialogContent sx={{ textAlign: 'center' }}>
        <DialogContentText 
          id="alert-dialog-description"
          sx={{ 
            color: theme.palette.mode === 'dark' 
              ? 'rgba(255, 255, 255, 0.7)' 
              : 'rgba(0, 0, 0, 0.7)',
            fontSize: '1rem'
          }}
        >
          {message}
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ 
        pb: 3, 
        px: 3,
        justifyContent: 'center',
        gap: 2
      }}>
        <Button 
          onClick={onClose} 
          variant="outlined"
          sx={{
            borderRadius: '8px',
            px: 3,
            py: 1,
            borderColor: theme.palette.mode === 'dark' 
              ? 'rgba(255, 255, 255, 0.2)' 
              : 'rgba(0, 0, 0, 0.2)',
            '&:hover': {
              borderColor: accentColor,
              backgroundColor: `${accentColor}10`
            }
          }}
        >
          {cancelText}
        </Button>
        <Button 
          onClick={handleConfirm} 
          variant="contained"
          sx={{
            borderRadius: '8px',
            px: 3,
            py: 1,
            backgroundColor: accentColor,
            '&:hover': {
              backgroundColor: accentColor,
              opacity: 0.9,
              boxShadow: `0 0 12px ${accentColor}80`
            }
          }}
          autoFocus
        >
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default ConfirmDialog