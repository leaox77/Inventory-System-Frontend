import { Alert, AlertTitle, Snackbar, IconButton, Slide } from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { forwardRef, useState, useEffect } from 'react';

// Animación de deslizamiento para el Snackbar
const SlideTransition = forwardRef(function Transition(props, ref) {
  return <Slide direction="left" ref={ref} {...props} />;
});

function AlertMessage({ 
  message, 
  title,
  severity = 'info',
  autoHideDuration = 6000, 
  onClose,
  position = { vertical: 'top', horizontal: 'right' }
}) {
  const [open, setOpen] = useState(true);

  // Mapeo de colores según severidad
  const colorMap = {
    error: '#F44336',
    warning: '#FF9800',
    info: '#29B6F6',
    success: '#4CAF50',
    primary: '#FF8F00'
  };

  useEffect(() => {
    if (autoHideDuration) {
      const timer = setTimeout(() => {
        handleClose();
      }, autoHideDuration);
      return () => clearTimeout(timer);
    }
  }, [autoHideDuration]);

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpen(false);
    if (onClose) {
      setTimeout(onClose, 300);
    }
  };

  return (
    <Snackbar
      open={open}
      autoHideDuration={autoHideDuration}
      onClose={handleClose}
      TransitionComponent={SlideTransition}
      anchorOrigin={position}
      sx={{
        '& .MuiAlert-root': {
          alignItems: 'center',
          backdropFilter: 'blur(4px)'
        }
      }}
    >
      <Alert
        variant="filled"
        severity={severity}
        onClose={handleClose}
        action={
          <IconButton
            aria-label="close"
            color="inherit"
            size="small"
            onClick={handleClose}
            sx={{ 
              opacity: 0.8,
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,0.15)'
              }
            }}
          >
            <CloseIcon fontSize="inherit" />
          </IconButton>
        }
        sx={{ 
          minWidth: 300,
          boxShadow: 3,
          borderRadius: '12px',
          borderLeft: `4px solid ${colorMap[severity] || colorMap.info}`,
          backgroundColor: theme => theme.palette.mode === 'dark' 
            ? 'rgba(33, 33, 33, 0.9)' 
            : 'rgba(255, 255, 255, 0.9)',
          color: theme => theme.palette.mode === 'dark' 
            ? '#fff' 
            : 'rgba(0, 0, 0, 0.87)',
          '& .MuiAlert-icon': {
            color: colorMap[severity] || colorMap.info
          },
          '& .MuiAlert-message': {
            flexGrow: 1,
            py: 1
          }
        }}
      >
        {title && (
          <AlertTitle sx={{ 
            m: 0,
            color: theme => theme.palette.mode === 'dark' 
              ? '#fff' 
              : colorMap[severity] || colorMap.info
          }}>
            {title}
          </AlertTitle>
        )}
        {message}
      </Alert>
    </Snackbar>
  );
}

export default AlertMessage;