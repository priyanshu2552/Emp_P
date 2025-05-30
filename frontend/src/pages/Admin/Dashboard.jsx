import React, { useEffect, useState } from 'react';
import { Box, Typography, Grid, Paper, CircularProgress } from '@mui/material';
import axios from 'axios';

const AdminOverview = () => {
  const [loading, setLoading] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');

        const res = await axios.get('http://localhost:5000/api/admin/dashboard', {
          headers: { Authorization: `Bearer ${token}` },
        });

        setDashboardData(res.data);
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (!dashboardData) {
    return <Typography color="error">Failed to load dashboard data.</Typography>;
  }

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>Admin Overview</Typography>

      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6">Admin Profile</Typography>
        <Typography>Name: {dashboardData.admin.name}</Typography>
        <Typography>Email: {dashboardData.admin.email}</Typography>
        <Typography>Role: {dashboardData.admin.role}</Typography>
      </Paper>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={4}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6">Total Employees</Typography>
            <Typography>{dashboardData.stats.totalEmployees}</Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6">Total Managers</Typography>
            <Typography>{dashboardData.stats.totalManagers}</Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6">Pending Leave Requests</Typography>
            <Typography>{dashboardData.stats.pendingLeaveRequests}</Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6">Pending Expense Requests</Typography>
            <Typography>{dashboardData.stats.pendingExpenseRequests}</Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminOverview;
