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
  autoHideDuration = 6000, 
  onClose,
  position = { vertical: 'top', horizontal: 'right' }
}) {
  const [open, setOpen] = useState(true);

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
      setTimeout(onClose, 300); // Esperar a que termine la animación
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
          alignItems: 'center'
        }
      }}
    >
      <Alert
        variant="filled"
        onClose={handleClose}
        action={
          <IconButton
            aria-label="close"
            color="inherit"
            size="small"
            onClick={handleClose}
            sx={{ opacity: 0.8 }}
          >
            <CloseIcon fontSize="inherit" />
          </IconButton>
        }
        sx={{ 
          minWidth: 300,
          boxShadow: 3,
          '& .MuiAlert-message': {
            flexGrow: 1
          }
        }}
      >
        {title && <AlertTitle sx={{ m: 0 }}>{title}</AlertTitle>}
        {message}
      </Alert>
    </Snackbar>
  );
}

export default AlertMessage;