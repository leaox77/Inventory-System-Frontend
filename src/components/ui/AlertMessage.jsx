import { Alert, AlertTitle, Collapse, IconButton } from '@mui/material'
import { Close as CloseIcon } from '@mui/icons-material'
import { useState, useEffect } from 'react'

function AlertMessage({ severity, title, message, autoHideDuration, onClose }) {
  const [open, setOpen] = useState(true)

  useEffect(() => {
    if (autoHideDuration) {
      const timer = setTimeout(() => {
        handleClose()
      }, autoHideDuration)
      return () => clearTimeout(timer)
    }
  }, [autoHideDuration])

  const handleClose = () => {
    setOpen(false)
    if (onClose) {
      setTimeout(onClose, 300) // Esperar a que termine la animación
    }
  }

  return (
    <Collapse in={open}>
      <Alert
        severity={severity || 'info'}
        action={
          <IconButton
            aria-label="close"
            color="inherit"
            size="small"
            onClick={handleClose}
          >
            <CloseIcon fontSize="inherit" />
          </IconButton>
        }
        sx={{ mb: 2, animation: 'fadeIn 0.3s' }}
      >
        {title && <AlertTitle>{title}</AlertTitle>}
        {message}
      </Alert>
    </Collapse>
  )
}

export default AlertMessage