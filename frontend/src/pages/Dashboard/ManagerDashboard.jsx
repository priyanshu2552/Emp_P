import React from 'react';
import { Box, Typography, Grid, Button } from '@mui/material';
import { NavLink, useNavigate } from 'react-router-dom';

const dashboardOptionsByRole = {
 
  manager: [
    { label: 'Dashboard', to: '/manager/dashboard' },
    { label: 'My Profile', to: '/manager/profile' },
    { label: 'Policy', to: '/manager/policy' },
    { label: 'Expense', to: '/manager/expense' },
    { label: 'Leave Approvals', to: '/manager/leave' },
    { label: 'Appraisal Reviews', to: '/manager/appraisal' },
    { label: 'Weekly Reviews', to: '/manager/review' },
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

  const user = JSON.parse(localStorage.getItem('user'));
  const role = user?.role || 'employee';
  const dashboardOptions = dashboardOptionsByRole[role] || [];

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/', { replace: true });
  };

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
