import { useState } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { 
  AppBar, 
  Box, 
  CssBaseline, 
  Divider, 
  Drawer, 
  IconButton, 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText, 
  Toolbar, 
  Typography, 
  Avatar,
  Menu,
  MenuItem,
  Tooltip,
  styled
} from '@mui/material'
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Inventory as InventoryIcon,
  ShoppingCart as ShoppingCartIcon,
  Person as PersonIcon,
  Brightness4 as Brightness4Icon,
  Brightness7 as Brightness7Icon,
  Store as StoreIcon,
  Business as BusinessIcon,
  PeopleAlt as PeopleAltIcon,
  Logout as LogoutIcon
} from '@mui/icons-material'
import { useAuth } from '../../contexts/AuthContext'
import { useTheme } from '../../contexts/ThemeContext'
import Notifications from '../ui/Notifications'

const drawerWidth = 240

const ColorfulDivider = styled(Divider)(({ theme }) => ({
  background: `linear-gradient(to right, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
  height: '2px'
}))

function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [anchorEl, setAnchorEl] = useState(null)
  const { currentUser, logout } = useAuth()
  const { darkMode, toggleDarkMode } = useTheme()
  const navigate = useNavigate()
  const location = useLocation()

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/', permission: 'all' },
    { text: 'Productos', icon: <InventoryIcon />, path: '/productos', permission: 'inventory' },
    { text: 'Ventas', icon: <ShoppingCartIcon />, path: '/ventas', permission: 'sales' },
    { text: 'Proveedores', icon: <BusinessIcon />, path: '/proveedores', permission: 'inventory' },
    { text: 'Sucursales', icon: <StoreIcon />, path: '/sucursales', permission: 'reports' },
    { text: 'Clientes', icon: <PersonIcon />, path: '/clientes', permission: 'sales' },
    { text: 'Usuarios', icon: <PeopleAltIcon />, path: '/usuarios', permission: 'all' }
  ]

  const hasPermission = (permission) => {
  if (!currentUser) return false
  if (currentUser.role_id === 1) return true // Admin tiene acceso a todo
  return currentUser.permissions?.[permission] === true
}

const filteredMenuItems = menuItems.filter(item => 
  hasPermission(item.permission)
)

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen)
  }

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget)
  }

  const handleProfileMenuClose = () => {
    setAnchorEl(null)
  }

  const handleLogout = () => {
    handleProfileMenuClose()
    logout()
  }

  const handleThemeToggle = () => {
    handleProfileMenuClose()
    toggleDarkMode()
  }

  const handleMenuItemClick = (path) => {
    navigate(path)
    setMobileOpen(false)
  }

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === path
    }
    return location.pathname.startsWith(path)
  }
  const drawer = (
    <Box sx={{ 
      height: '100%',
      background: darkMode ? 
        'linear-gradient(180deg, #121212 0%, #1E1E1E 100%)' : 
        'linear-gradient(180deg, #f5f5f5 0%, #ffffff 100%)'
    }}>
      <Toolbar sx={{ 
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '64px !important'
      }}>
        <Typography 
          variant="h6" 
          noWrap 
          component="div" 
          sx={{ 
            fontWeight: 'bold',
            background: 'linear-gradient(45deg, #FF8F00 30%, #FFA000 90%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}
        >
          TuSuper
        </Typography>
      </Toolbar>
      <ColorfulDivider />
      <List sx={{ px: 1 }}>
        {filteredMenuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton 
              onClick={() => handleMenuItemClick(item.path)}
              selected={isActive(item.path)}
              sx={{
                '&.Mui-selected': {
                  background: 'linear-gradient(45deg, #FF8F00 0%, #FFB300 100%)',
                  color: 'white',
                  boxShadow: '0 3px 5px 2px rgba(255, 143, 0, 0.2)',
                  '& .MuiListItemIcon-root': {
                    color: 'white'
                  }
                },
                '&:hover': {
                  background: darkMode ? 'rgba(255, 143, 0, 0.1)' : 'rgba(255, 143, 0, 0.05)'
                },
                borderRadius: '12px',
                margin: '4px 0',
                transition: 'all 0.3s ease',
                py: 1.2
              }}
            >
              <ListItemIcon 
                sx={{ 
                  color: isActive(item.path) ? 'white' : darkMode ? '#BDBDBD' : '#616161',
                  minWidth: '40px'
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.text} 
                primaryTypographyProps={{
                  fontWeight: isActive(item.path) ? '600' : '500'
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  )

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          background: darkMode ? 
            'linear-gradient(90deg, #1E1E1E 0%, #121212 100%)' : 
            'linear-gradient(90deg, #FF8F00 0%, #FFB300 100%)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
          zIndex: (theme) => theme.zIndex.drawer + 1
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ 
              mr: 2, 
              display: { sm: 'none' },
              '&:hover': {
                background: 'rgba(255,255,255,0.1)'
              }
            }}
          >
            <MenuIcon />
          </IconButton>
          <Typography 
            variant="h6" 
            noWrap 
            component="div" 
            sx={{ 
              flexGrow: 1,
              fontWeight: '600',
              letterSpacing: '0.5px'
            }}
          >
            {menuItems.find(item => isActive(item.path))?.text || 'Dashboard'}
          </Typography>
          <Notifications />
          <Tooltip title="Configuración de cuenta">
            <IconButton
              onClick={handleProfileMenuOpen}
              size="small"
              sx={{ 
                ml: 2,
                '&:hover': {
                  background: 'rgba(255,255,255,0.2)'
                }
              }}
              aria-controls="menu-appbar"
              aria-haspopup="true"
            >
              <Avatar sx={{ 
                width: 36, 
                height: 36, 
                bgcolor: darkMode ? '#FF8F00' : 'white',
                color: darkMode ? 'white' : '#FF8F00',
                fontWeight: 'bold'
              }}>
                {currentUser?.username?.charAt(0).toUpperCase() || 'U'}
              </Avatar>
            </IconButton>
          </Tooltip>
          <Menu
            id="menu-appbar"
            anchorEl={anchorEl}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            open={Boolean(anchorEl)}
            onClose={handleProfileMenuClose}
            PaperProps={{
              sx: {
                mt: 1.5,
                minWidth: '180px',
                borderRadius: '12px',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
                overflow: 'visible',
                '&:before': {
                  content: '""',
                  display: 'block',
                  position: 'absolute',
                  top: 0,
                  right: 14,
                  width: 10,
                  height: 10,
                  bgcolor: 'background.paper',
                  transform: 'translateY(-50%) rotate(45deg)',
                  zIndex: 0
                }
              }
            }}
          >
            <MenuItem dense disabled sx={{ opacity: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: '600' }}>
                {currentUser?.username || 'Usuario'}
              </Typography>
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleThemeToggle} sx={{ py: 1 }}>
              <ListItemIcon sx={{ color: 'text.primary' }}>
                {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
              </ListItemIcon>
              <ListItemText 
                primary={darkMode ? "Modo Claro" : "Modo Oscuro"} 
                primaryTypographyProps={{ variant: 'body2' }}
              />
            </MenuItem>
            <MenuItem onClick={handleLogout} sx={{ py: 1 }}>
              <ListItemIcon sx={{ color: 'error.main' }}>
                <LogoutIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText 
                primary="Cerrar Sesión" 
                primaryTypographyProps={{ 
                  variant: 'body2',
                  color: 'error.main'
                }}
              />
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        aria-label="mailbox folders"
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              borderRight: 'none'
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              borderRight: 'none'
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{ 
          flexGrow: 1, 
          p: 3, 
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          minHeight: '100vh',
          background: darkMode ? '#121212' : '#f5f5f5'
        }}
      >
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  )
}

export default Layout