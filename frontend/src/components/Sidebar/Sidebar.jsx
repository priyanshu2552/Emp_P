import React from 'react';
import { 
  Drawer, List, ListItem, ListItemIcon, 
  ListItemText, Divider, Toolbar, Box
} from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Dashboard as DashboardIcon,
  Person as ProfileIcon,
  Description as PolicyIcon,
  Receipt as ExpenseIcon,
  CalendarToday as LeaveIcon,
  Assessment as AppraisalIcon,
  RateReview as ReviewIcon,
  ExitToApp as LogoutIcon
} from '@mui/icons-material';

const drawerWidth = 240;

const Sidebar = ({ mobileOpen, handleDrawerToggle }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const drawer = (
    <div>
      <Toolbar />
      <Divider />
      <List>
        <ListItem 
          button 
          component={NavLink} 
          to={`/${user?.role}/dashboard`}
          sx={navLinkStyles}
        >
          <ListItemIcon><DashboardIcon /></ListItemIcon>
          <ListItemText primary="Dashboard" />
        </ListItem>
        
        <ListItem 
          button 
          component={NavLink} 
          to={`/${user?.role}/profile`}
          sx={navLinkStyles}
        >
          <ListItemIcon><ProfileIcon /></ListItemIcon>
          <ListItemText primary="My Profile" />
        </ListItem>
        
        {/* Add other menu items similarly */}
        
        <Divider sx={{ my: 1 }} />
        
        <ListItem button onClick={handleLogout}>
          <ListItemIcon><LogoutIcon color="error" /></ListItemIcon>
          <ListItemText primary="Logout" primaryTypographyProps={{ color: 'error' }} />
        </ListItem>
      </List>
    </div>
  );

  return (
    <Box component="nav" sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}>
      {/* Drawer components remain the same */}
    </Box>
  );
};

const navLinkStyles = {
  '&.active': {
    backgroundColor: 'rgba(25, 118, 210, 0.08)',
    '& .MuiListItemIcon-root': { color: '#1976d2' },
    '& .MuiListItemText-primary': {
      fontWeight: '500',
      color: '#1976d2'
    }
  }
};

export default Sidebar;