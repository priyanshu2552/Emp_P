import React from 'react';
import { Box, Typography, Grid, Button } from '@mui/material';
import { NavLink, useNavigate } from 'react-router-dom';

const dashboardOptionsByRole = {
  employee: [
    { label: 'Dashboard', to: '/employee/dashboard' },
    { label: 'My Profile', to: '/employee/profile' },
    { label: 'Policy', to: '/employee/policy' },
    { label: 'Expense', to: '/employee/expense' },
    { label: 'Leave', to: '/employee/leave' },
    { label: 'Appraisal', to: '/employee/appraisal' },
    { label: 'Review', to: '/employee/review' },
  ],
  manager: [
    { label: 'Dashboard', to: '/manager/dashboard' },
    { label: 'My Profile', to: '/manager/profile' },
    // add other manager specific links here
  ],
  admin: [
    { label: 'Dashboard', to: '/admin/dashboard' },
    { label: 'My Profile', to: '/admin/profile' },
    // add other admin specific links here
  ],
};

const linkStyle = {
  textDecoration: 'none',
  color: '#1976d2',
  padding: '20px',
  display: 'block',
  textAlign: 'center',
  fontWeight: '500',
  border: '1px solid #1976d2',
  borderRadius: '8px',
  transition: 'background-color 0.3s',
};

const activeLinkStyle = {
  backgroundColor: '#1976d2',
  color: 'white',
};

const Dashboard = () => {
  const navigate = useNavigate();

  // Get user info from localStorage
  const user = JSON.parse(localStorage.getItem('user'));
  const role = user?.role || 'employee';

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/', { replace: true });
  };

  const dashboardOptions = dashboardOptionsByRole[role] || [];

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        {role.charAt(0).toUpperCase() + role.slice(1)} Dashboard
      </Typography>

      <Grid container spacing={3}>
        {dashboardOptions.map(({ label, to }) => (
          <Grid item xs={12} sm={6} md={4} key={label}>
            <NavLink
              to={to}
              style={({ isActive }) =>
                isActive ? { ...linkStyle, ...activeLinkStyle } : linkStyle
              }
            >
              {label}
            </NavLink>
          </Grid>
        ))}
      </Grid>

      <Box mt={4} textAlign="center">
        <Button
          variant="contained"
          color="error"
          onClick={handleLogout}
          sx={{ minWidth: 150 }}
        >
          Logout
        </Button>
      </Box>
    </Box>
  );
};

export default Dashboard;
