import React, { useState } from 'react';
import {
  Box,
  Drawer,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar,
  CssBaseline,
  useTheme,
  useMediaQuery,
  styled,
  Paper,
  Typography,
  IconButton,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Person as ProfileIcon,
  Description as PolicyIcon,
  Receipt as ExpenseIcon,
  CalendarToday as LeaveIcon,
  Assessment as AppraisalIcon,
  RateReview as ReviewIcon,
  ExitToApp as LogoutIcon,
  Menu as MenuIcon,
} from '@mui/icons-material';
import { NavLink, useNavigate } from 'react-router-dom';

const drawerWidth = 260;

const SidebarPaper = styled(Paper)(({ theme }) => ({
  background: 'linear-gradient(195deg, rgb(25, 83, 141), rgb(23, 90, 146))',
  borderRadius: 0,
  height: '100%',
  boxShadow: theme.shadows[4],
  '&::-webkit-scrollbar': {
    display: 'none', // Hide scrollbar for Chrome, Safari and Opera
  },
  '-ms-overflow-style': 'none', // Hide scrollbar for IE and Edge
  scrollbarWidth: 'none', // Hide scrollbar for Firefox
}));

const GlassPaper = styled(Paper)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(10px)',
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[4],
  transition: 'all 0.3s ease',
  '&:hover': {
    boxShadow: theme.shadows[8],
  },
}));

const DashboardLayout = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem('user'));
  const role = user?.role || 'employee';
  const name = user?.name || 'User';
  const image = user?.image || '/default-avatar.png';

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login', { replace: true });
  };

  const dashboardOptionsByRole = {
    employee: [
      { label: 'Dashboard', to: '/employee/dashboard', icon: <DashboardIcon /> },
      { label: 'My Profile', to: '/employee/profile', icon: <ProfileIcon /> },
      { label: 'Company Policy', to: '/employee/policy', icon: <PolicyIcon /> },
      { label: 'Expense Claims', to: '/employee/expense', icon: <ExpenseIcon /> },
      { label: 'Leave Requests', to: '/employee/leave', icon: <LeaveIcon /> },
      { label: 'Appraisals', to: '/employee/appraisal', icon: <AppraisalIcon /> },
      { label: 'Weekly Reviews', to: '/employee/review', icon: <ReviewIcon /> },
    ],
    manager: [
      { label: 'Dashboard', to: '/manager/dashboard', icon: <DashboardIcon /> },
      { label: 'My Profile', to: '/manager/profile', icon: <ProfileIcon /> },
      { label: 'Team Management', to: '/manager/team', icon: <ProfileIcon /> },
    ],
    admin: [
      { label: 'Dashboard', to: '/admin/dashboard', icon: <DashboardIcon /> },
      { label: 'My Profile', to: '/admin/profile', icon: <ProfileIcon /> },
      { label: 'User Management', to: '/admin/users', icon: <ProfileIcon /> },
    ],
  };

  const StyledNavLink = styled(NavLink)(({ theme }) => ({
    textDecoration: 'none',
    color: 'white',
    '&.active': {
      backgroundColor: 'rgba(255, 255, 255, 0.15)',
      borderLeft: `4px solid white`,
      '& .MuiListItemIcon-root': { color: 'white' },
      '& .MuiListItemText-primary': {
        fontWeight: '600',
      }
    },
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
    }
  }));

  const drawer = (
    <SidebarPaper>
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography 
            variant="h5" 
            sx={{ 
              fontWeight: 700, 
              color: 'white', 
              mb: 2,
              fontSize: '1.5rem',
              letterSpacing: '0.5px'
            }}
          >
            {role.charAt(0).toUpperCase() + role.slice(1)} Portal
          </Typography>
          <Avatar 
            src={image} 
            sx={{ 
              width: 80, 
              height: 80, 
              mb: 2,
              mx: 'auto',
              border: '3px solid rgba(255, 255, 255, 0.3)',
            }} 
          />
          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: 600, 
              color: 'white',
              fontSize: '1.2rem',
              mb: 0.5
            }}
          >
            {name}
          </Typography>
          <Typography 
            variant="subtitle1" 
            sx={{ 
              color: 'rgba(255, 255, 255, 0.8)',
              fontWeight: 500,
              textTransform: 'capitalize',
              fontSize: '0.9rem',
              letterSpacing: '0.3px'
            }}
          >
            {role}
          </Typography>
        </Box>

        <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.2)', my: 1 }} />

        <List sx={{ flexGrow: 1, overflow: 'auto', p: 1, '&::-webkit-scrollbar': { display: 'none' } }}>
          {dashboardOptionsByRole[role]?.map(({ label, to, icon }) => (
            <StyledNavLink to={to} key={label}>
              <ListItem button>
                <ListItemIcon sx={{ minWidth: 40, color: 'white' }}>{icon}</ListItemIcon>
                <ListItemText 
                  primary={label} 
                  primaryTypographyProps={{
                    fontSize: '0.95rem',
                    fontWeight: 500
                  }}
                />
              </ListItem>
            </StyledNavLink>
          ))}
        </List>

        <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.2)', mx: 2 }} />

<ListItem 
  button 
  onClick={handleLogout}
  sx={{ 
    color: 'rgba(255, 255, 255, 0.8)',
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
    }
  }}
>
  <ListItemIcon sx={{ minWidth: 40, color: 'rgba(255, 255, 255, 0.8)' }}>
    <LogoutIcon />
  </ListItemIcon>
  <ListItemText 
    primary="Logout" 
    primaryTypographyProps={{
      fontSize: '0.95rem',
      fontWeight: 500
    }}
  />
</ListItem>
      </Box>
    </SidebarPaper>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', background: '#f5f7fa' }}>
      <CssBaseline />

      {/* Mobile App Bar */}
      {isMobile && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            zIndex: theme.zIndex.drawer + 1,
            background: 'linear-gradient(195deg, rgb(25, 83, 141), rgb(23, 90, 146))',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            padding: '0 16px',
            height: '56px',
            boxShadow: theme.shadows[4],
          }}
        >
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap>
            {role.charAt(0).toUpperCase() + role.slice(1)} Dashboard
          </Typography>
        </Box>
      )}

      {/* Sidebar */}
      <Box
        component="nav"
        sx={{
          width: { md: drawerWidth },
          flexShrink: { md: 0 },
        }}
      >
        <Drawer
          variant={isMobile ? 'temporary' : 'permanent'}
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile
          }}
          sx={{
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              boxSizing: 'border-box',
              borderRight: 'none',
              transition: theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
              }),
              overflowX: 'hidden',
              '&::-webkit-scrollbar': {
                display: 'none',
              },
            },
          }}
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, md: 3 },
          width: { md: `calc(100% - ${drawerWidth}px)` },
          marginTop: { xs: '56px', md: 0 },
          transition: theme.transitions.create('margin', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          ...(mobileOpen && {
            [theme.breakpoints.down('md')]: {
              marginLeft: `${drawerWidth}px`,
              transition: theme.transitions.create('margin', {
                easing: theme.transitions.easing.easeOut,
                duration: theme.transitions.duration.enteringScreen,
              }),
            },
          }),
        }}
      >
        <GlassPaper sx={{ p: { xs: 2, md: 3 }, minHeight: 'calc(100vh - 40px)' }}>
          {children}
        </GlassPaper>
      </Box>
    </Box>
  );
};

export default DashboardLayout;