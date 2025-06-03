import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Box,
  Typography,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  TablePagination,
  Select,
  MenuItem,
  Divider,
  Chip
} from '@mui/material';
import { Search, Close, Visibility } from '@mui/icons-material';

const AdminAppraisalPage = () => {
  const [appraisals, setAppraisals] = useState([]);
  const [managerFilter, setManagerFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [userDetails, setUserDetails] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem('token');

  const fetchAppraisals = async () => {
    try {
      setLoading(true);
      let url = 'http://localhost:5000/api/admin/appraisals?';
      if (managerFilter) url += `managerId=${managerFilter}&`;
      if (statusFilter) url += `status=${statusFilter}`;

      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });

      setAppraisals(res.data.appraisals);
    } catch (err) {
      console.error('Error fetching appraisals:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserDetails = async (id) => {
    try {
      const res = await axios.get(`http://localhost:5000/api/admin/user/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      setUserDetails(res.data.user);
    } catch (err) {
      console.error('Error fetching user:', err);
    }
  };

  useEffect(() => {
    fetchAppraisals();
  }, [managerFilter, statusFilter]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'completed': return 'success';
      case 'pending': return 'warning';
      case 'in progress': return 'info';
      case 'approved': return 'primary';
      case 'rejected': return 'error';
      default: return 'default';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">Appraisal Management</Typography>
        <Button 
          variant="contained" 
          color="primary"
          onClick={fetchAppraisals}
          startIcon={<Search />}
        >
          Refresh
        </Button>
      </Box>

      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <TextField
          label="Filter by Manager ID"
          variant="outlined"
          size="small"
          value={managerFilter}
          onChange={(e) => setManagerFilter(e.target.value)}
          placeholder="Enter manager ID"
        />
        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          displayEmpty
          size="small"
          sx={{ minWidth: 200 }}
        >
          <MenuItem value="">All Statuses</MenuItem>
          <MenuItem value="pending">Pending</MenuItem>
          <MenuItem value="in progress">In Progress</MenuItem>
          <MenuItem value="completed">Completed</MenuItem>
          <MenuItem value="approved">Approved</MenuItem>
          <MenuItem value="rejected">Rejected</MenuItem>
        </Select>
      </Box>

      <Paper>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f5f5f5', height: '40px' }}>
                <TableCell sx={{ py: 0.5, fontWeight: 'bold' }}>Employee</TableCell>
                <TableCell sx={{ py: 0.5, fontWeight: 'bold' }}>Manager</TableCell>
                <TableCell sx={{ py: 0.5, fontWeight: 'bold' }}>Period</TableCell>
                <TableCell sx={{ py: 0.5, fontWeight: 'bold' }}>Project</TableCell>
                <TableCell sx={{ py: 0.5, fontWeight: 'bold' }}>Status</TableCell>
                <TableCell sx={{ py: 0.5, fontWeight: 'bold' }}>Rating</TableCell>
                <TableCell sx={{ py: 0.5, fontWeight: 'bold' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 2 }}>
                    Loading appraisals...
                  </TableCell>
                </TableRow>
              ) : appraisals.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 2 }}>
                    No appraisals found
                  </TableCell>
                </TableRow>
              ) : (
                appraisals.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((app) => (
                  <TableRow key={app._id} hover sx={{ height: '48px' }}>
                    <TableCell sx={{ py: 0.5 }}>
                      <Typography 
                        sx={{ color: 'primary.main', cursor: 'pointer' }}
                        onClick={() => fetchUserDetails(app.userId._id)}
                      >
                        {app.userId.name}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ py: 0.5 }}>
                      <Typography 
                        sx={{ color: 'primary.main', cursor: 'pointer' }}
                        onClick={() => fetchUserDetails(app.managerId._id)}
                      >
                        {app.managerId.name}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ py: 0.5 }}>{app.period}</TableCell>
                    <TableCell sx={{ py: 0.5 }}>{app.projectName}</TableCell>
                    <TableCell sx={{ py: 0.5 }}>
                      <Chip 
                        label={app.status} 
                        size="small"
                        color={getStatusColor(app.status)}
                      />
                    </TableCell>
                    <TableCell sx={{ py: 0.5 }}>{app.finalRating || 'N/A'}</TableCell>
                    <TableCell sx={{ py: 0.5 }}>
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => fetchUserDetails(app.userId._id)}
                      >
                        <Visibility fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={appraisals.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      {/* User Details Dialog */}
      <Dialog open={Boolean(userDetails)} onClose={() => setUserDetails(null)} maxWidth="sm" fullWidth>
        <DialogTitle>
          User Details
          <IconButton
            aria-label="close"
            onClick={() => setUserDetails(null)}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {userDetails && (
            <Box sx={{ p: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                <strong>Name:</strong> {userDetails.name}
              </Typography>
              <Typography variant="subtitle1" gutterBottom>
                <strong>Email:</strong> {userDetails.email}
              </Typography>
              <Typography variant="subtitle1" gutterBottom>
                <strong>Role:</strong> {userDetails.role}
              </Typography>
              <Typography variant="subtitle1" gutterBottom>
                <strong>Department:</strong> {userDetails.department || 'N/A'}
              </Typography>
              <Typography variant="subtitle1">
                <strong>Position:</strong> {userDetails.position || 'N/A'}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUserDetails(null)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminAppraisalPage;