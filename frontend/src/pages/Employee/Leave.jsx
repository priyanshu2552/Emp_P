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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  CircularProgress,
  TablePagination,
  Grid,
  Chip,
  Tabs,
  Tab,
  Avatar,Checkbox
} from '@mui/material';
import {
  Add,
  Refresh,
  CheckCircle,
  Cancel,
  Pending,
  Event,
  DateRange,
  AccessTime,
  BeachAccess,
  MedicalServices
} from '@mui/icons-material';
import { format, parseISO, differenceInDays } from 'date-fns';
import axios from 'axios';
import { useSnackbar } from 'notistack';
import DashboardLayout from '../../components/Layout/EmployeeLayout';

const EmployeeLeaveManagement = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState({
    leaves: true,
    balance: true
  });
  const [openModal, setOpenModal] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [activeTab, setActiveTab] = useState('all');
  const { enqueueSnackbar } = useSnackbar();

  const [leaveBalance, setLeaveBalance] = useState({
    casual: { total: 12, taken: 0, remaining: 12 },
    sick: { total: 6, taken: 0, remaining: 6 },
    vacation: { total: 15, taken: 0, remaining: 15 }
  });

  const [form, setForm] = useState({
    startDate: '',
    endDate: '',
    leaveType: 'casual',
    reason: '',
    isHalfDay: false
  });

  const API_BASE_URL = 'http://localhost:5000/api';

  const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return {
      headers: {
        Authorization: `Bearer ${token}`
      }
    };
  };

  const duration = form.startDate && form.endDate 
    ? differenceInDays(parseISO(form.endDate), parseISO(form.startDate)) + 1
    : form.startDate && form.isHalfDay ? 0.5 : 0;

  const fetchLeaveBalance = async () => {
    try {
      setLoading(prev => ({ ...prev, balance: true }));
      const { data } = await axios.get(`${API_BASE_URL}/employees/leave/balance`, getAuthHeader());
      setLeaveBalance({
        casual: data.data.casualLeaves || { total: 12, taken: 0, remaining: 12 },
        sick: data.data.sickLeaves || { total: 6, taken: 0, remaining: 6 },
        vacation: data.data.vacationLeaves || { total: 15, taken: 0, remaining: 15 }
      });
    } catch (error) {
      enqueueSnackbar('Failed to fetch leave balance', { variant: 'error' });
    } finally {
      setLoading(prev => ({ ...prev, balance: false }));
    }
  };

  const fetchLeaveHistory = async () => {
    try {
      setLoading(prev => ({ ...prev, leaves: true }));
      const { data } = await axios.get(`${API_BASE_URL}/employees/leave/history`, {
        ...getAuthHeader(),
        params: { 
          status: activeTab === 'all' ? undefined : activeTab 
        }
      });
      setLeaves(data.data || []);
    } catch (error) {
      enqueueSnackbar('Failed to fetch leave history', { variant: 'error' });
    } finally {
      setLoading(prev => ({ ...prev, leaves: false }));
    }
  };

  useEffect(() => {
    fetchLeaveBalance();
    fetchLeaveHistory();
  }, [activeTab]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmitRequest = async () => {
    try {
      if (!form.startDate) {
        enqueueSnackbar('Please select a start date', { variant: 'error' });
        return;
      }

      if (!form.isHalfDay && !form.endDate) {
        enqueueSnackbar('Please select an end date', { variant: 'error' });
        return;
      }

      const requestData = {
        ...form,
        startDate: new Date(form.startDate).toISOString(),
        endDate: form.isHalfDay 
          ? new Date(form.startDate).toISOString()
          : new Date(form.endDate).toISOString()
      };

      await axios.post(
        `${API_BASE_URL}/employees/leave/request`,
        requestData,
        getAuthHeader()
      );

      enqueueSnackbar('Leave request submitted successfully', { variant: 'success' });
      setOpenModal(false);
      setForm({
        startDate: '',
        endDate: '',
        leaveType: 'casual',
        reason: '',
        isHalfDay: false
      });
      fetchLeaveBalance();
      fetchLeaveHistory();
    } catch (error) {
      enqueueSnackbar(error.response?.data?.message || 'Failed to submit leave request', { variant: 'error' });
    }
  };

  const handleCancelRequest = async (id) => {
    try {
      await axios.put(
        `${API_BASE_URL}/employees/leave/request/${id}/cancel`,
        {},
        getAuthHeader()
      );
      enqueueSnackbar('Leave request cancelled', { variant: 'success' });
      fetchLeaveHistory();
    } catch (error) {
      enqueueSnackbar(error.response?.data?.message || 'Failed to cancel leave request', { variant: 'error' });
    }
  };

  const getStatusChip = (status) => {
    switch (status) {
      case 'approved': return <Chip icon={<CheckCircle />} label="Approved" color="success" size="small" />;
      case 'rejected': return <Chip icon={<Cancel />} label="Rejected" color="error" size="small" />;
      case 'cancelled': return <Chip label="Cancelled" color="default" size="small" />;
      default: return <Chip icon={<Pending />} label="Pending" color="warning" size="small" />;
    }
  };

  const getLeaveTypeIcon = (type) => {
    switch (type) {
      case 'casual': return <AccessTime color="primary" />;
      case 'sick': return <MedicalServices color="secondary" />;
      case 'vacation': return <BeachAccess color="info" />;
      default: return <Event color="action" />;
    }
  };

  const canTakeLeave = (type, days) => {
    if (!leaveBalance || !leaveBalance[type]) return false;
    return leaveBalance[type].remaining >= days;
  };

  return (
    <DashboardLayout>
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4">Leave Management</Typography>
          <Button 
            variant="contained" 
            startIcon={<Add />} 
            onClick={() => setOpenModal(true)}
            sx={{
              background: 'linear-gradient(135deg, #3f51b5, #303f9f)',
              '&:hover': {
                background: 'linear-gradient(135deg, #303f9f, #1a237e)'
              }
            }}
          >
            New Request
          </Button>
        </Box>

        <Grid container spacing={3} sx={{ mb: 4 }}>
          {['casual', 'sick', 'vacation'].map((type) => (
            <Grid item xs={12} md={4} key={type}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    {getLeaveTypeIcon(type)}
                    <Typography variant="h6" sx={{ ml: 1 }}>
                      {type.charAt(0).toUpperCase() + type.slice(1)} Leave
                    </Typography>
                  </Box>
                  {loading.balance ? (
                    <CircularProgress size={24} />
                  ) : (
                    <>
                      <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                        {leaveBalance[type].remaining}
                        <Typography component="span" variant="body1" color="text.secondary">
                          /{leaveBalance[type].total}
                        </Typography>
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {leaveBalance[type].taken} days taken
                      </Typography>
                    </>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">My Leave Requests</Typography>
              <Button startIcon={<Refresh />} onClick={fetchLeaveHistory} size="small">
                Refresh
              </Button>
            </Box>

            <Tabs 
              value={activeTab} 
              onChange={(e, newValue) => setActiveTab(newValue)}
              sx={{ mb: 2 }}
            >
              <Tab label="All" value="all" />
              <Tab label="Pending" value="pending" />
              <Tab label="Approved" value="approved" />
              <Tab label="Rejected" value="rejected" />
            </Tabs>

            {loading.leaves ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
              </Box>
            ) : leaves.length === 0 ? (
              <Box sx={{ 
                textAlign: 'center', 
                p: 4,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
              }}>
                <Event sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
                <Typography variant="h6" color="text.secondary">
                  No leave requests found
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  You haven't applied for any leaves yet
                </Typography>
                <Button 
                  variant="outlined" 
                  onClick={() => setOpenModal(true)}
                  startIcon={<Add />}
                >
                  Request Leave
                </Button>
              </Box>
            ) : (
              <>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Leave Type</TableCell>
                      <TableCell>Dates</TableCell>
                      <TableCell>Duration</TableCell>
                      <TableCell>Reason</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {leaves.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((leave) => (
                      <TableRow key={leave._id}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            {getLeaveTypeIcon(leave.leaveType)}
                            <Typography sx={{ ml: 1 }}>
                              {leave.leaveType.charAt(0).toUpperCase() + leave.leaveType.slice(1)}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Event sx={{ mr: 1, color: 'text.secondary' }} />
                            {format(parseISO(leave.startDate), 'MMM dd, yyyy')}
                            {!leave.isHalfDay && (
                              <>
                                <DateRange sx={{ mx: 1, color: 'text.secondary' }} />
                                {format(parseISO(leave.endDate), 'MMM dd, yyyy')}
                              </>
                            )}
                            {leave.isHalfDay && (
                              <Chip label="Half Day" size="small" sx={{ ml: 1 }} />
                            )}
                          </Box>
                        </TableCell>
                        <TableCell>
                          {leave.isHalfDay ? '0.5 day' : 
                            `${differenceInDays(parseISO(leave.endDate), parseISO(leave.startDate)) + 1} days`}
                        </TableCell>
                        <TableCell sx={{ maxWidth: 200 }}>
                          <Typography noWrap>{leave.reason}</Typography>
                        </TableCell>
                        <TableCell>
                          {getStatusChip(leave.status)}
                          {leave.reviewerComment && (
                            <Typography variant="caption" color="text.secondary" display="block">
                              {leave.reviewerComment}
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          {leave.status === 'pending' && (
                            <Button
                              variant="outlined"
                              color="error"
                              size="small"
                              onClick={() => handleCancelRequest(leave._id)}
                            >
                              Cancel
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <TablePagination
                  rowsPerPageOptions={[5, 10, 25]}
                  component="div"
                  count={leaves.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={(e, newPage) => setPage(newPage)}
                  onRowsPerPageChange={(e) => {
                    setRowsPerPage(parseInt(e.target.value, 10));
                    setPage(0);
                  }}
                />
              </>
            )}
          </CardContent>
        </Card>

        {/* New Leave Request Modal */}
        <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="sm" fullWidth>
          <DialogTitle>New Leave Request</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <Select
                  fullWidth
                  label="Leave Type"
                  name="leaveType"
                  value={form.leaveType}
                  onChange={handleChange}
                  required
                >
                  <MenuItem value="casual">Casual Leave</MenuItem>
                  <MenuItem value="sick">Sick Leave</MenuItem>
                  <MenuItem value="vacation">Vacation Leave</MenuItem>
                </Select>
                <Typography variant="caption" color={canTakeLeave(form.leaveType, duration) ? 'text.secondary' : 'error'}>
                  {leaveBalance ? 
                    `${leaveBalance[form.leaveType].remaining} ${form.leaveType} leaves remaining` : 
                    'Loading leave balance...'}
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Checkbox
                    name="isHalfDay"
                    checked={form.isHalfDay}
                    onChange={handleChange}
                  />
                  <Typography>Half Day Leave</Typography>
                </Box>
              </Grid>

              <Grid item xs={12} md={form.isHalfDay ? 12 : 6}>
                <TextField
                  fullWidth
                  label="Start Date"
                  type="date"
                  name="startDate"
                  value={form.startDate}
                  onChange={handleChange}
                  required
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ min: format(new Date(), 'yyyy-MM-dd') }}
                />
              </Grid>

              {!form.isHalfDay && (
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="End Date"
                    type="date"
                    name="endDate"
                    value={form.endDate}
                    onChange={handleChange}
                    required
                    InputLabelProps={{ shrink: true }}
                    inputProps={{ min: form.startDate || format(new Date(), 'yyyy-MM-dd') }}
                    disabled={!form.startDate}
                  />
                </Grid>
              )}

              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary">
                  Duration: {form.isHalfDay ? '0.5 day' : `${duration} day${duration !== 1 ? 's' : ''}`}
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Reason"
                  name="reason"
                  value={form.reason}
                  onChange={handleChange}
                  required
                  multiline
                  rows={4}
                  placeholder="Briefly explain the reason for your leave..."
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenModal(false)}>Cancel</Button>
            <Button
              onClick={handleSubmitRequest}
              variant="contained"
              disabled={!canTakeLeave(form.leaveType, duration)}
              sx={{
                background: 'linear-gradient(135deg, #3f51b5, #303f9f)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #303f9f, #1a237e)'
                },
                '&:disabled': {
                  background: '#e0e0e0'
                }
              }}
            >
              Submit Request
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </DashboardLayout>
  );
};

export default EmployeeLeaveManagement;