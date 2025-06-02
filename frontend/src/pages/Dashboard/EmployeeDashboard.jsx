import React from 'react';
import DashboardLayout from '../../components/Layout/EmployeeLayout';
import { Typography } from '@mui/material';

const EmployeeDashboard = () => {
  return (
    <DashboardLayout>
      <Typography variant="h4" gutterBottom>
        Employee Dashboard
      </Typography>
      <Typography>
        Welcome to your dashboard! Here you can access all your employee tools.
      </Typography>
      {/* Add more content specific to the employee dashboard */}
    </DashboardLayout>
  );
};

export default EmployeeDashboard;