import React, { useState } from 'react';
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, MenuItem, Select, TextField } from '@mui/material';
import { updateOrderStatus } from '../services/orderService';

const OrderStatusDialog = ({ order, open, onClose, onStatusUpdated }) => {
  const [status, setStatus] = useState(order.status);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await updateOrderStatus(order.order_id, status, notes);
      onStatusUpdated();
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Cambiar Estado de Orden #{order.order_id}</DialogTitle>
      <DialogContent>
        <Select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          fullWidth
          sx={{ mt: 2 }}
        >
          <MenuItem value="PENDING">Pendiente</MenuItem>
          <MenuItem value="APPROVED">Aprobado</MenuItem>
          <MenuItem value="DELIVERED">Entregado</MenuItem>
          <MenuItem value="PARTIALLY_DELIVERED">Parcialmente Entregado</MenuItem>
          <MenuItem value="CANCELLED">Cancelado</MenuItem>
        </Select>
        
        <TextField
          label="Notas"
          multiline
          rows={4}
          fullWidth
          sx={{ mt: 2 }}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          disabled={loading}
        >
          {loading ? 'Actualizando...' : 'Actualizar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};