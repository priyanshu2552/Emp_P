import React, { useEffect, useState } from 'react';
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
  Chip,
  CircularProgress,
  TextareaAutosize
} from '@mui/material';
import { Search, Close, Visibility, Edit } from '@mui/icons-material';
import axios from 'axios';

const API_BASE = 'http://localhost:5000/api/admin';

const AdminLeave = () => {
  const [leaves, setLeaves] = useState([]);
  const [updateForm, setUpdateForm] = useState({ status: '', SupervisorComment: '' });
  const [selectedLeaveId, setSelectedLeaveId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const token = localStorage.getItem('token');

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/leaves`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLeaves(res.data.leaves);
    } catch (err) {
      console.error('Error fetching leaves:', err);
      setError('Failed to fetch leave requests');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setUpdateForm({ ...updateForm, [e.target.name]: e.target.value });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.put(`${API_BASE}/leaves/${selectedLeaveId}`, updateForm, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });
      if (res.data.success) {
        setSelectedLeaveId(null);
        setUpdateForm({ status: '', SupervisorComment: '' });
        fetchLeaves();
      }
    } catch (err) {
      console.error('Error updating leave:', err);
      setError('Failed to update leave request');
    }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'approved': return 'success';
      case 'pending': return 'warning';
      case 'rejected': return 'error';
      default: return 'default';
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">Leave Requests Management</Typography>
        <Button 
          variant="contained" 
          color="primary"
          onClick={fetchLeaves}
          startIcon={<Search />}
        >
          Refresh
        </Button>
      </Box>

      {error && (
        <Box sx={{ mb: 3, p: 2, backgroundColor: 'error.light', color: 'error.contrastText', borderRadius: 1 }}>
          {error}
        </Box>
      )}

      <Paper>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f5f5f5', height: '40px' }}>
                <TableCell sx={{ fontWeight: 'bold' }}>Employee</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Email</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Dates</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Type</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Reason</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Comment</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : leaves.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 2 }}>
                    No leave requests found
                  </TableCell>
                </TableRow>
              ) : (
                leaves.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((leave) => (
                  <TableRow key={leave._id} hover>
                    <TableCell>{leave.userId?.name}</TableCell>
                    <TableCell>{leave.userId?.email}</TableCell>
                    <TableCell>
                      {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{leave.leaveType}</TableCell>
                    <TableCell sx={{ maxWidth: 150 }}>
                      <Typography noWrap>{leave.reason}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={leave.status} 
                        color={getStatusColor(leave.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell sx={{ maxWidth: 150 }}>
                      <Typography noWrap>{leave.SupervisorComment}</Typography>
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => setSelectedLeaveId(leave._id)}
                      >
                        <Edit fontSize="small" />
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
          count={leaves.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      {/* Update Leave Dialog */}
      <Dialog open={Boolean(selectedLeaveId)} onClose={() => setSelectedLeaveId(null)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Update Leave Request
          <IconButton
            aria-label="close"
            onClick={() => setSelectedLeaveId(null)}
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
          <Box component="form" onSubmit={handleUpdate} sx={{ pt: 2 }}>
            <Select
              fullWidth
              name="status"
              value={updateForm.status}
              onChange={handleChange}
              required
              size="small"
              sx={{ mb: 2 }}
            >
              <MenuItem value="">Select Status</MenuItem>
              <MenuItem value="approved">Approve</MenuItem>
              <MenuItem value="rejected">Reject</MenuItem>
            </Select>
            <TextareaAutosize
              name="SupervisorComment"
              placeholder="Supervisor comment"
              value={updateForm.SupervisorComment}
              onChange={handleChange}
              minRows={3}
              style={{ 
                width: '100%', 
                padding: '8px', 
                border: '1px solid #ccc', 
                borderRadius: '4px',
                fontFamily: 'inherit',
                fontSize: '0.875rem'
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedLeaveId(null)}>Cancel</Button>
          <Button 
            onClick={handleUpdate} 
            variant="contained" 
            color="primary"
          >
            Update
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminLeave;