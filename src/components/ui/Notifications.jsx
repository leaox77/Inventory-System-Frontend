// components/Notifications.jsx
import { useState, useEffect } from 'react';
import { 
  Badge, 
  IconButton, 
  Menu, 
  MenuItem, 
  List, 
  ListItem, 
  ListItemText, 
  Divider, 
  Typography,
  Paper,
  Box
} from '@mui/material';
import { Notifications as NotificationsIcon } from '@mui/icons-material';
import productService from '../../services/productService';

const Notifications = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchStockAlerts = async () => {
    try {
      setLoading(true);
      // Obtener todos los productos con su inventario
      const response = await productService.getProducts({ limit: 1000 }); // Ajusta según necesidad
      const allProducts = response.items;
      
      const alerts = [];
      
      // Verificar stock mínimo para cada producto
      for (const product of allProducts) {
        if (product.inventory_items) {
          for (const inventory of product.inventory_items) {
            if (inventory.quantity < product.min_stock) {
              alerts.push({
                productId: product.product_id,
                productName: product.name,
                branchId: inventory.branch_id,
                branchName: inventory.branch_name || `Sucursal ${inventory.branch_id}`,
                currentStock: inventory.quantity,
                minStock: product.min_stock
              });
            }
          }
        }
      }
      
      setNotifications(alerts);
    } catch (error) {
      console.error('Error fetching stock alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStockAlerts();
    // Actualizar cada 5 minutos
    const interval = setInterval(fetchStockAlerts, 5 * 60 * 100);
    return () => clearInterval(interval);
  }, []);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <IconButton
        color="inherit"
        onClick={handleMenuOpen}
        aria-label="notificaciones"
        aria-controls="notifications-menu"
        aria-haspopup="true"
      >
        <Badge badgeContent={notifications.length} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>
      
      <Menu
        id="notifications-menu"
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          style: {
            width: '350px',
            maxHeight: '400px',
          },
        }}
      >
        <Box p={2}>
          <Typography variant="h6">Notificaciones</Typography>
          <Typography variant="body2" color="text.secondary">
            Alertas de stock mínimo
          </Typography>
        </Box>
        <Divider />
        
        {loading ? (
          <Box p={2}>
            <Typography>Cargando notificaciones...</Typography>
          </Box>
        ) : notifications.length === 0 ? (
          <Box p={2}>
            <Typography>No hay notificaciones</Typography>
          </Box>
        ) : (
          <List dense sx={{ overflow: 'auto', maxHeight: '300px' }}>
            {notifications.map((alert, index) => (
              <div key={`${alert.productId}-${alert.branchId}`}>
                <ListItem>
                  <ListItemText
                    primary={`Alerta de stock mínimo: ${alert.productName}`}
                    secondary={`Sucursal: ${alert.branchName} - Stock actual: ${alert.currentStock} (Mínimo: ${alert.minStock})`}
                    secondaryTypographyProps={{ color: 'error.main' }}
                  />
                </ListItem>
                {index < notifications.length - 1 && <Divider />}
              </div>
            ))}
          </List>
        )}
      </Menu>
    </>
  );
};

export default Notifications;