import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Button,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Divider,
  Paper,
  Avatar,
  Badge,
  styled,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Policy as PolicyIcon,
  Receipt as ReceiptIcon,
  Assessment as AssessmentIcon,
  RateReview as ReviewIcon,
  CalendarToday as LeaveIcon,
  ExitToApp as LogoutIcon,
  Notifications as NotificationsIcon,
  Menu as MenuIcon
} from '@mui/icons-material';
import AdminUsers from '../../pages/Admin/AdminUsers';
import AdminPolicies from '../../pages/Admin/AdminPolicies';
import AdminExpenses from '../../pages/Admin/AdminExpense';
import AdminAppraisal from '../../pages/Admin/AdminAppraisal';
import AdminReview from '../../pages/Admin/AdminReview';
import AdminLeaves from '../../pages/Admin/AdminLeave';

// Styled components
const BackgroundContainer = styled(Box)({
  position: 'fixed',
  width: '100%',
  height: '100%',
  zIndex: -1,
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '35%',
    height: '100%',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    right: 0,
    width: '65%',
    height: '100%',
    backgroundColor: '#ffffff',
  }
});

const Sidebar = styled(Paper)(({ theme }) => ({
  width: 280,
  height: 'calc(100vh - 80px)',
  position: 'fixed',
  left: 40,
  top: 40,
  borderRadius: '24px',
  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
  backgroundColor: '#ffffff',
  zIndex: 100,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  padding: theme.spacing(2, 0),
  overflow: 'hidden',
  [theme.breakpoints.down('md')]: {
    transform: 'translateX(-120%)',
    left: 20,
    top: 20,
    '&.open': {
      transform: 'translateX(0)',
    }
  }
}));


const MainContent = styled(Box)(({ theme }) => ({
  marginLeft: '35%', // This matches the sidebar width
  width: '65%', // Explicitly set width to 65%
  padding: '60px 80px',
  minHeight: '100vh',
  [theme.breakpoints.down('lg')]: {
    padding: '40px',
  },
  [theme.breakpoints.down('md')]: {
    marginLeft: 0,
    width: '100%',
    padding: '80px 20px 20px',
  }
}));

const MenuButton = styled(ListItemButton)(({ theme, selected }) => ({
  borderRadius: '12px',
  margin: '6px 16px',
  padding: '12px 16px',
  backgroundColor: selected ? '#667eea' : 'transparent',
  color: selected ? '#fff' : theme.palette.text.secondary,
  '&:hover': {
    backgroundColor: selected ? '#5a6fd1' : 'rgba(102, 126, 234, 0.08)'
  },
  '& .MuiListItemIcon-root': {
    color: selected ? '#fff' : theme.palette.text.secondary,
    minWidth: '40px'
  }
}));

const MobileHeader = styled(Box)(({ theme }) => ({
  display: 'none',
  padding: '16px',
  backgroundColor: '#ffffff',
  boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  zIndex: 90,
  [theme.breakpoints.down('md')]: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  }
}));

const Overlay = styled(Box)(({ theme }) => ({
  display: 'none',
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  backgroundColor: 'rgba(0,0,0,0.3)',
  zIndex: 99,
  [theme.breakpoints.down('md')]: {
    '&.open': {
      display: 'block'
    }
  }
}));

const dashboardOptionsByRole = {
  admin: [
    { label: 'Dashboard', to: '/admin/dashboard', icon: <DashboardIcon /> },
    { label: 'Manage Users', to: '/admin/users', icon: <PeopleIcon /> },
    { label: 'Manage Policies', to: '/admin/policies', icon: <PolicyIcon /> },
    { label: 'View Expenses', to: '/admin/expenses', icon: <ReceiptIcon /> },
    { label: 'Appraisals Overview', to: '/admin/appraisal', icon: <AssessmentIcon /> },
    { label: 'Weekly Review Overview', to: '/admin/review', icon: <ReviewIcon /> },
    { label: 'Leaves Overview', to: '/admin/leaves', icon: <LeaveIcon /> },
  ],
};

const AdminLayout = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const user = JSON.parse(localStorage.getItem('user'));
  const role = user?.role || 'employee';
  const dashboardOptions = dashboardOptionsByRole[role] || [];

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/', { replace: true });
  };

  return (
    <Box sx={{ position: 'relative' }}>
      {/* Background with two colors */}
      <BackgroundContainer />

      {/* Mobile header */}
      <MobileHeader>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Button onClick={handleDrawerToggle} sx={{ mr: 2, color: '#667eea' }}>
            <MenuIcon />
          </Button>
          <Typography variant="h6" sx={{ color: '#667eea' }}>Admin Dashboard</Typography>
        </Box>
        <Badge badgeContent={4} color="error">
          <NotificationsIcon sx={{ color: '#667eea' }} />
        </Badge>
      </MobileHeader>

      {/* Overlay for mobile */}
      <Overlay className={mobileOpen ? 'open' : ''} onClick={handleDrawerToggle} />

      {/* Sidebar */}
      <Sidebar className={mobileOpen ? 'open' : ''}>
        <Box sx={{ p: 3, display: 'flex', alignItems: 'center' }}>
          <Avatar
            sx={{
              width: 48,
              height: 48,
              mr: 2,
              bgcolor: '#667eea',
              color: 'white'
            }}
          >
            {user?.name?.charAt(0) || 'A'}
          </Avatar>
          <Box>
            <Typography variant="subtitle1" fontWeight="600">
              {user?.name || 'Admin User'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {role.charAt(0).toUpperCase() + role.slice(1)}
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ mx: 3, my: 1 }} />

        <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
          <List
            disablePadding
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: -0.2,
              px: 1,
            }}
          >
            {dashboardOptions.map(({ label, to, icon }) => (
              <ListItem key={label} disablePadding>
                <MenuButton
                  component={NavLink}
                  to={to}
                  selected={window.location.pathname === to}
                  onClick={isMobile ? handleDrawerToggle : null}
                  sx={{
                    fontSize: '0.875rem',
                    px: 1,
                    py: 1,
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 36 }}>{icon}</ListItemIcon>
                  <ListItemText
                    primary={label}
                    primaryTypographyProps={{ fontWeight: 500, fontSize: '0.85rem' }}
                  />
                </MenuButton>
              </ListItem>
            ))}
          </List>
        </Box>

        <Box sx={{ p: 2, mt: 'auto' }}>
          <Button
            variant="contained"
            onClick={handleLogout}
            startIcon={<LogoutIcon />}
            fullWidth
            sx={{
              borderRadius: '12px',
              py: 1.5,
              textTransform: 'none',
              fontWeight: 500,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #5a6fd1 0%, #6a4299 100%)',
              }
            }}
          >
            Logout
          </Button>
        </Box>
      </Sidebar>

      {/* Main Content Area - Right Side */}
      <MainContent>
        {/* Empty content area - ready for your components */}
        <Box sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: 'calc(100vh - 120px)',
          textAlign: 'center'
        }}>
          <Typography variant="h4" sx={{
            fontWeight: 600,
            color: 'text.secondary',
            mb: 2
          }}>
            Welcome to Admin Dashboard
          </Typography>
          <Typography variant="body1" sx={{
            color: 'text.secondary',
            maxWidth: '500px',
            mb: 4
          }}>
            This is your main content area. Add your components, charts, and data here.
          </Typography>
          <Button
            variant="contained"
            sx={{
              borderRadius: '12px',
              px: 4,
              py: 1.5,
              textTransform: 'none',
              fontWeight: 500,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #5a6fd1 0%, #6a4299 100%)',
              }
            }}
          >
            Get Started
          </Button>
        </Box>
      </MainContent>
    </Box>
  );
};

export default AdminLayout;