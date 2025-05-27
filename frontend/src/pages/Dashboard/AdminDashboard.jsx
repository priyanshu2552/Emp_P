import React from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardContent,
  Stack,
  LinearProgress
} from '@mui/material';
import {
  People as PeopleIcon,
  Assignment as TaskIcon,
  CheckCircle as ApprovalIcon,
  MonetizationOn as RevenueIcon
} from '@mui/icons-material';

const AdminDashboard = () => {
  const stats = [
    { title: 'Total Employees', value: '142', icon: <PeopleIcon fontSize="large" />, color: '#1976d2' },
    { title: 'Pending Approvals', value: '23', icon: <ApprovalIcon fontSize="large" />, color: '#ff9800' },
    { title: 'Active Tasks', value: '56', icon: <TaskIcon fontSize="large" />, color: '#4caf50' },
    { title: 'Monthly Revenue', value: '$24,500', icon: <RevenueIcon fontSize="large" />, color: '#9c27b0' },
  ];

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>
        Admin Dashboard
      </Typography>
      
      <Grid container spacing={4}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card sx={{ 
              height: '100%',
              borderLeft: `4px solid ${stat.color}`,
              boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)'
            }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Box sx={{ color: stat.color }}>
                    {stat.icon}
                  </Box>
                  <Box>
                    <Typography variant="h6" color="text.secondary">
                      {stat.title}
                    </Typography>
                    <Typography variant="h4">
                      {stat.value}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
        
        <Grid item xs={12} md={8}>
          <Card sx={{ p: 2, boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)' }}>
            <Typography variant="h6" gutterBottom>
              Recent Activity
            </Typography>
            <Box sx={{ height: 300 }}>
              {/* Activity chart/table would go here */}
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <Typography color="text.secondary">
                  Activity chart placeholder
                </Typography>
              </Box>
            </Box>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card sx={{ p: 2, boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)' }}>
            <Typography variant="h6" gutterBottom>
              System Health
            </Typography>
            <Stack spacing={3} sx={{ mt: 2 }}>
              <Box>
                <Typography variant="body2" gutterBottom>
                  Storage Usage
                </Typography>
                <LinearProgress variant="determinate" value={65} sx={{ height: 8, borderRadius: 4 }} />
                <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                  65% used (32.5GB of 50GB)
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" gutterBottom>
                  Active Users
                </Typography>
                <LinearProgress variant="determinate" value={85} sx={{ height: 8, borderRadius: 4 }} />
                <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                  85% active (120 of 142 users)
                </Typography>
              </Box>
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminDashboard;