import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Select,
  MenuItem,
  Modal,
  Divider,
  IconButton,
  Paper,
  Chip,
  CircularProgress,
  TablePagination,
  TextareaAutosize
} from '@mui/material';
import { Add, Close, Refresh, CheckCircle, Cancel, Pending } from '@mui/icons-material';
import DashboardLayout from '../../components/Layout/EmployeeLayout';
const API_BASE = 'http://localhost:5000/api/employees';

const Leave = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [form, setForm] = useState({
    startDate: '',
    endDate: '',
    leaveType: 'casual',
    reason: ''
  });

  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const token = localStorage.getItem('token');

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/leaves`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.success) {
        setLeaves(data.leaves);
      } else {
        console.error(data.message);
      }
    } catch (error) {
      console.error('Failed to fetch leaves:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/leaves`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(form)
      });

      const data = await res.json();
      if (data.success) {
        setOpenModal(false);
        setForm({ startDate: '', endDate: '', leaveType: 'casual', reason: '' });
        fetchLeaves();
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error('Failed to submit leave:', error);
    }
  };

  // Handle pagination
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Calculate paginated leaves
  const paginatedLeaves = leaves.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved': return <CheckCircle color="success" sx={{ fontSize: '1rem', mr: 0.5 }} />;
      case 'rejected': return <Cancel color="error" sx={{ fontSize: '1rem', mr: 0.5 }} />;
      default: return <Pending color="warning" sx={{ fontSize: '1rem', mr: 0.5 }} />;
    }
  };

  return (
    <DashboardLayout>
    <Box sx={{ 
      display: 'flex',
      flexDirection: 'column',
      p: 2,
      minHeight: 'calc(100vh - 64px)',
      overflow: 'hidden'
    }}>
      <Box sx={{ 
        width: '100%',
        maxWidth: '1200px',
        mx: 'auto'
      }}>
        {/* Header Section */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          mb: 3,
          flexWrap: 'wrap',
          gap: 2
        }}>
          <Typography variant="h6" sx={{ 
            fontWeight: 600,
            fontSize: '1.1rem'
          }}>
            Leave Management
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={fetchLeaves}
              sx={{ 
                textTransform: 'none',
                '&:hover': {
                  backgroundColor: 'action.hover',
                }
              }}
            >
              Refresh
            </Button>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setOpenModal(true)}
              sx={{ 
                textTransform: 'none',
                '&:hover': {
                  backgroundColor: 'primary.dark',
                }
              }}
            >
              New Request
            </Button>
          </Box>
        </Box>

        {/* Summary Cards */}
        <Box sx={{ 
          display: 'flex', 
          gap: 3, 
          mb: 4, 
          flexWrap: 'wrap',
          justifyContent: 'space-between'
        }}>
          <Paper sx={{ 
            p: 3, 
            flex: 1, 
            minWidth: '200px', 
            borderRadius: '8px',
            border: '1px solid #e0e0e0',
            '&:hover': {
              boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
            }
          }}>
            <Typography variant="subtitle2" color="text.secondary">Total Requests</Typography>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>{leaves.length}</Typography>
          </Paper>
          <Paper sx={{ 
            p: 3, 
            flex: 1, 
            minWidth: '200px', 
            borderRadius: '8px',
            border: '1px solid #e0e0e0',
            '&:hover': {
              boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
            }
          }}>
            <Typography variant="subtitle2" color="text.secondary">Pending</Typography>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              {leaves.filter(l => l.status === 'pending').length}
            </Typography>
          </Paper>
          <Paper sx={{ 
            p: 3, 
            flex: 1, 
            minWidth: '200px', 
            borderRadius: '8px',
            border: '1px solid #e0e0e0',
            '&:hover': {
              boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
            }
          }}>
            <Typography variant="subtitle2" color="text.secondary">Approved</Typography>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              {leaves.filter(l => l.status === 'approved').length}
            </Typography>
          </Paper>
        </Box>

        {/* Main Table */}
        <Card sx={{ 
          borderRadius: '8px', 
          boxShadow: 'none', 
          border: '1px solid #e0e0e0',
          '&:hover': {
            boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
          }
        }}>
          <Box sx={{ 
            p: 2,
            borderBottom: '1px solid #f0f0f0'
          }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              Your Leave Requests
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Showing {paginatedLeaves.length} of {leaves.length} entries
            </Typography>
          </Box>
          <CardContent sx={{ p: 0 }}>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <>
                <Table>
                  <TableHead sx={{ backgroundColor: '#fafafa' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Start Date</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>End Date</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Reason</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Supervisor Comment</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginatedLeaves.length > 0 ? (
                      paginatedLeaves.map((leave) => (
                        <TableRow 
                          key={leave._id} 
                          hover
                          sx={{ 
                            '&:hover': {
                              backgroundColor: 'action.hover',
                            }
                          }}
                        >
                          <TableCell>
                            {new Date(leave.startDate).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </TableCell>
                          <TableCell>
                            {new Date(leave.endDate).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </TableCell>
                          <TableCell sx={{ textTransform: 'capitalize' }}>
                            <Chip 
                              label={leave.leaveType} 
                              size="small" 
                              sx={{ 
                                backgroundColor: '#e3f2fd',
                                color: '#1976d2',
                                '&:hover': {
                                  backgroundColor: '#bbdefb',
                                }
                              }} 
                            />
                          </TableCell>
                          <TableCell>{leave.reason}</TableCell>
                          <TableCell>
                            <Box sx={{ 
                              display: 'flex', 
                              alignItems: 'center',
                              color: 
                                leave.status === 'approved' ? 'success.main' :
                                leave.status === 'rejected' ? 'error.main' :
                                'warning.main'
                            }}>
                              {getStatusIcon(leave.status)}
                              <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                                {leave.status}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            {leave.SupervisorComment || '-'}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} sx={{ textAlign: 'center', py: 4 }}>
                          <Typography variant="body2" color="text.secondary">
                            No leave requests found
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
                {leaves.length > 5 && (
                  <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={leaves.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    sx={{
                      borderTop: '1px solid #f0f0f0',
                      '& .MuiTablePagination-toolbar': {
                        padding: '0 16px'
                      }
                    }}
                  />
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Add Leave Modal */}
        <Modal open={openModal} onClose={() => setOpenModal(false)}>
          <Box sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: { xs: '90%', sm: '500px' },
            bgcolor: 'background.paper',
            borderRadius: '8px',
            boxShadow: 24,
            p: 3,
            outline: 'none',
            border: '1px solid #e0e0e0'
          }}>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              mb: 2 
            }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                New Leave Request
              </Typography>
              <IconButton 
                onClick={() => setOpenModal(false)}
                sx={{
                  '&:hover': {
                    backgroundColor: 'action.hover',
                  }
                }}
              >
                <Close />
              </IconButton>
            </Box>
            <Divider sx={{ mb: 3 }} />
            <form onSubmit={handleSubmit}>
              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <TextField
                  fullWidth
                  label="Start Date"
                  name="startDate"
                  type="date"
                  value={form.startDate}
                  onChange={handleChange}
                  required
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
                <TextField
                  fullWidth
                  label="End Date"
                  name="endDate"
                  type="date"
                  value={form.endDate}
                  onChange={handleChange}
                  required
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Box>
              <Select
                fullWidth
                label="Leave Type"
                name="leaveType"
                value={form.leaveType}
                onChange={handleChange}
                sx={{ mb: 2 }}
              >
                <MenuItem value="casual">Casual Leave</MenuItem>
                <MenuItem value="sick">Sick Leave</MenuItem>
                <MenuItem value="vacation">Vacation Leave</MenuItem>
                <MenuItem value="maternity">Maternity Leave</MenuItem>
                <MenuItem value="paternity">Paternity Leave</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </Select>
              <TextField
                fullWidth
                label="Reason"
                name="reason"
                value={form.reason}
                onChange={handleChange}
                required
                multiline
                rows={4}
                sx={{ mb: 3 }}
              />
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'flex-end', 
                gap: 2 
              }}>
                <Button 
                  variant="outlined" 
                  onClick={() => setOpenModal(false)}
                  sx={{ 
                    borderRadius: '8px',
                    '&:hover': {
                      backgroundColor: 'action.hover',
                    }
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  variant="contained" 
                  type="submit"
                  sx={{ 
                    borderRadius: '8px',
                    '&:hover': {
                      backgroundColor: 'primary.dark',
                    }
                  }}
                >
                  Submit Request
                </Button>
              </Box>
            </form>
          </Box>
        </Modal>
      </Box>
    </Box>
    </DashboardLayout>
  );
};

export default Leave;