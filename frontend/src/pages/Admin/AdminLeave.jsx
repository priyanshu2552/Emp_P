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
  DialogContentText,
  Divider,
  IconButton,
  Chip,
  CircularProgress,
  TablePagination,
  Grid,
  Avatar,
  Tabs,
  Tab,
  Checkbox,
  FormControlLabel, CardHeader, CardActions
} from '@mui/material';
import {
  Add,
  Refresh,
  CheckCircle,
  Cancel,
  Pending,
  Event,
  DateRange,
  Edit,
  Settings
} from '@mui/icons-material';
import { format, parseISO, differenceInDays } from 'date-fns';
import axios from 'axios';
import { useSnackbar } from 'notistack';

const AdminLeaveManagement = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [policy, setPolicy] = useState(null);
  const [filter, setFilter] = useState({ status: '' });
  const [showPolicyModal, setShowPolicyModal] = useState(false);
  const [showProcessModal, setShowProcessModal] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [processData, setProcessData] = useState({ status: 'approved', comment: '' });
  const [resetting, setResetting] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const { enqueueSnackbar } = useSnackbar();

  // Get auth token from localStorage
  const getAuthToken = () => {
    return localStorage.getItem('token');
  };

  // Axios instance with auth header
  const api = axios.create({
    baseURL: 'http://localhost:5000/api/admin',
    headers: {
      'Authorization': `Bearer ${getAuthToken()}`
    }
  });

  // Fetch all leave requests
  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/leaves', { params: filter });
      setLeaves(data.data);
    } catch (error) {
      enqueueSnackbar(error.response?.data?.message || 'Failed to fetch leave requests', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Fetch leave policy
  const fetchPolicy = async () => {
    try {
      const { data } = await api.get('/policy');
      setPolicy(data.data);
    } catch (error) {
      enqueueSnackbar(error.response?.data?.message || 'Failed to fetch leave policy', { variant: 'error' });
    }
  };

  useEffect(() => {
    fetchLeaves();
    fetchPolicy();
  }, [filter]);

  // Handle leave processing
  const handleProcessLeave = async () => {
    try {
      const response = await api.put(`/leaves/${selectedLeave._id}/process`, {
        status: processData.status,
        comment: processData.comment || undefined
      });

      if (response.data.success) {
        enqueueSnackbar('Leave request processed successfully', { variant: 'success' });
        fetchLeaves();
        setShowProcessModal(false);
      } else {
        enqueueSnackbar(response.data.message || 'Failed to process leave request', { variant: 'error' });
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message ||
        error.response?.data?.error ||
        'Failed to process leave request';
      enqueueSnackbar(errorMessage, { variant: 'error' });
      console.error('Error processing leave:', error.response?.data);
    }
  };

  // Update leave policy
  const handleUpdatePolicy = async () => {
    try {
      const { data } = await api.put('/policy', policy);
      setPolicy(data.data);
      enqueueSnackbar('Leave policy updated successfully', { variant: 'success' });
      setShowPolicyModal(false);
    } catch (error) {
      enqueueSnackbar(error.response?.data?.message || 'Failed to update leave policy', { variant: 'error' });
    }
  };

  // Reset yearly allocations
  const handleResetAllocations = async () => {
    try {
      setResetting(true);
      await api.post('/reset-allocations');
      enqueueSnackbar('Yearly allocations reset successfully', { variant: 'success' });
    } catch (error) {
      enqueueSnackbar(error.response?.data?.message || 'Failed to reset allocations', { variant: 'error' });
    } finally {
      setResetting(false);
    }
  };

  // Status chip component
  const StatusChip = ({ status }) => {
    const variants = {
      pending: { icon: <Pending />, color: 'warning', label: 'Pending' },
      approved: { icon: <CheckCircle />, color: 'success', label: 'Approved' },
      rejected: { icon: <Cancel />, color: 'error', label: 'Rejected' }
    };
    return (
      <Chip
        icon={variants[status]?.icon}
        label={variants[status]?.label || status}
        color={variants[status]?.color}
        size="small"
      />
    );
  };

  // Leave type chip component
  const LeaveTypeChip = ({ type }) => {
    const colors = {
      casual: 'primary',
      sick: 'secondary',
      vacation: 'info',
      maternity: 'warning',
      paternity: 'success'
    };
    return (
      <Chip
        label={type.charAt(0).toUpperCase() + type.slice(1)}
        color={colors[type] || 'default'}
        size="small"
      />
    );
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Admin Leave Management</Typography>
        <Box>
          <Button
            variant="contained"
            startIcon={<Settings />}
            onClick={() => setShowPolicyModal(true)}
            sx={{ mr: 2 }}
          >
            Policy Settings
          </Button>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={() => {
              fetchLeaves();
              fetchPolicy();
            }}
          >
            Refresh
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={9}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Leave Requests</Typography>
                <Select
                  value={filter.status}
                  onChange={(e) => setFilter({ ...filter, status: e.target.value })}
                  size="small"
                  sx={{ minWidth: 150 }}
                >
                  <MenuItem value="">All Status</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="approved">Approved</MenuItem>
                  <MenuItem value="rejected">Rejected</MenuItem>
                </Select>
              </Box>

              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                  <CircularProgress />
                </Box>
              ) : leaves.length === 0 ? (
                <Typography variant="body1" sx={{ textAlign: 'center', p: 3 }}>
                  No leave requests found
                </Typography>
              ) : (
                <>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Employee</TableCell>
                        <TableCell>Type</TableCell>
                        <TableCell>Dates</TableCell>
                        <TableCell>Duration</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {leaves.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((leave) => (
                        <TableRow key={leave._id}>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Avatar
                                src={leave.userId?.image || '/default-avatar.png'}
                                sx={{ width: 32, height: 32, mr: 1 }}
                              />
                              {leave.userId?.name || 'Unknown User'}
                            </Box>
                          </TableCell>
                          <TableCell>
                            <LeaveTypeChip type={leave.leaveType} />
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Event sx={{ mr: 1, color: 'text.secondary' }} />
                              {format(parseISO(leave.startDate), 'MMM dd, yyyy')}
                              <DateRange sx={{ mx: 1, color: 'text.secondary' }} />
                              {format(parseISO(leave.endDate), 'MMM dd, yyyy')}
                              {leave.isHalfDay && ' (Half Day)'}
                            </Box>
                          </TableCell>
                          <TableCell>
                            {leave.isHalfDay ? '0.5 day' : `${differenceInDays(parseISO(leave.endDate), parseISO(leave.startDate)) + 1} days`}
                          </TableCell>
                          <TableCell>
                            <StatusChip status={leave.status} />
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="outlined"
                              size="small"
                              onClick={() => {
                                setSelectedLeave(leave);
                                setProcessData({
                                  status: 'approved',
                                  comment: ''
                                });
                                setShowProcessModal(true);
                              }}
                              disabled={leave.status !== 'pending'}
                            >
                              Process
                            </Button>
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
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardHeader
              title="Leave Policy"
              action={
                <IconButton onClick={() => setShowPolicyModal(true)}>
                  <Edit />
                </IconButton>
              }
            />
            <CardContent>
              {policy ? (
                <>
                  <Typography variant="subtitle1" gutterBottom>
                    {policy.policyName} ({policy.year || new Date().getFullYear()})
                  </Typography>
                  <Divider sx={{ my: 2 }} />

                  <Typography variant="subtitle2">Casual Leave</Typography>
                  <Typography variant="body2">
                    Entitlement: {policy.casualLeave?.entitlement || 12} days
                  </Typography>
                  <Typography variant="body2">
                    Carry Over: {policy.casualLeave?.canCarryOver ? 'Yes' : 'No'}
                  </Typography>

                  <Typography variant="subtitle2" sx={{ mt: 2 }}>Sick Leave</Typography>
                  <Typography variant="body2">
                    Entitlement: {policy.sickLeave?.entitlement || 6} days
                  </Typography>
                  <Typography variant="body2">
                    Requires Documentation: {policy.sickLeave?.requiresDocumentation ? 'Yes' : 'No'}
                  </Typography>

                  <Typography variant="subtitle2" sx={{ mt: 2 }}>Vacation Leave</Typography>
                  <Typography variant="body2">
                    Entitlement: {policy.vacationLeave?.entitlement || 15} days
                  </Typography>
                  <Typography variant="body2">
                    Min Notice: {policy.vacationLeave?.minNoticePeriod || 7} days
                  </Typography>
                </>
              ) : (
                <CircularProgress size={24} />
              )}
            </CardContent>
            <CardActions>
              <Button
                variant="contained"
                color="warning"
                size="small"
                fullWidth
                onClick={handleResetAllocations}
                disabled={resetting}
                startIcon={resetting ? <CircularProgress size={20} /> : <Refresh />}
              >
                Reset Yearly Allocations
              </Button>
            </CardActions>
          </Card>
        </Grid>
      </Grid>

      {/* Process Leave Dialog */}
      <Dialog open={showProcessModal} onClose={() => setShowProcessModal(false)}>
        <DialogTitle>Process Leave Request</DialogTitle>
        <DialogContent>
          {selectedLeave && (
            <>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle1">Employee: {selectedLeave.userId?.name || 'Unknown User'}</Typography>
                <Typography variant="body2">Leave Type: <LeaveTypeChip type={selectedLeave.leaveType} /></Typography>
                <Typography variant="body2">
                  Dates: {format(parseISO(selectedLeave.startDate), 'MMM dd, yyyy')} to {format(parseISO(selectedLeave.endDate), 'MMM dd, yyyy')}
                </Typography>
                <Typography variant="body2">
                  Duration: {selectedLeave.isHalfDay ? '0.5 day' : `${differenceInDays(parseISO(selectedLeave.endDate), parseISO(selectedLeave.startDate)) + 1} days`}
                </Typography>
                <Typography variant="body2">Reason: {selectedLeave.reason}</Typography>
              </Box>

              <Select
                fullWidth
                value={processData.status}
                onChange={(e) => setProcessData({ ...processData, status: e.target.value })}
                sx={{ mb: 2 }}
              >
                <MenuItem value="approved">Approve</MenuItem>
                <MenuItem value="rejected">Reject</MenuItem>
              </Select>

              <TextField
                fullWidth
                label="Comment"
                multiline
                rows={3}
                value={processData.comment}
                onChange={(e) => setProcessData({ ...processData, comment: e.target.value })}
                placeholder="Enter comments for the employee (optional)"
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowProcessModal(false)}>Cancel</Button>
          <Button onClick={handleProcessLeave} variant="contained" color="primary">
            Submit
          </Button>
        </DialogActions>
      </Dialog>

      {/* Policy Settings Dialog */}
      <Dialog open={showPolicyModal} onClose={() => setShowPolicyModal(false)} maxWidth="md" fullWidth>
        <DialogTitle>Leave Policy Settings</DialogTitle>
        <DialogContent>
          {policy ? (
            <Box sx={{ mt: 2 }}>
              <TextField
                fullWidth
                label="Policy Name"
                value={policy.policyName}
                onChange={(e) => setPolicy({ ...policy, policyName: e.target.value })}
                sx={{ mb: 3 }}
              />

              <Typography variant="h6" gutterBottom>Casual Leave</Typography>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Entitlement (days)"
                    type="number"
                    value={policy.casualLeave?.entitlement || 12}
                    onChange={(e) => setPolicy({
                      ...policy,
                      casualLeave: {
                        ...policy.casualLeave,
                        entitlement: parseInt(e.target.value) || 0
                      }
                    })}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={policy.casualLeave?.canCarryOver || false}
                          onChange={(e) => setPolicy({
                            ...policy,
                            casualLeave: {
                              ...policy.casualLeave,
                              canCarryOver: e.target.checked
                            }
                          })}
                        />
                      }
                      label="Can Carry Over"
                    />
                  </Box>
                </Grid>
                {policy.casualLeave?.canCarryOver && (
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Carry Over Limit (days)"
                      type="number"
                      value={policy.casualLeave?.carryOverLimit || 0}
                      onChange={(e) => setPolicy({
                        ...policy,
                        casualLeave: {
                          ...policy.casualLeave,
                          carryOverLimit: parseInt(e.target.value) || 0
                        }
                      })}
                    />
                  </Grid>
                )}
              </Grid>

              <Typography variant="h6" gutterBottom>Sick Leave</Typography>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Entitlement (days)"
                    type="number"
                    value={policy.sickLeave?.entitlement || 6}
                    onChange={(e) => setPolicy({
                      ...policy,
                      sickLeave: {
                        ...policy.sickLeave,
                        entitlement: parseInt(e.target.value) || 0
                      }
                    })}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={policy.sickLeave?.requiresDocumentation || false}
                        onChange={(e) => setPolicy({
                          ...policy,
                          sickLeave: {
                            ...policy.sickLeave,
                            requiresDocumentation: e.target.checked
                          }
                        })}
                      />
                    }
                    label="Requires Documentation"
                  />
                </Grid>
              </Grid>

              <Typography variant="h6" gutterBottom>Vacation Leave</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Entitlement (days)"
                    type="number"
                    value={policy.vacationLeave?.entitlement || 15}
                    onChange={(e) => setPolicy({
                      ...policy,
                      vacationLeave: {
                        ...policy.vacationLeave,
                        entitlement: parseInt(e.target.value) || 0
                      }
                    })}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={policy.vacationLeave?.canCarryOver || true}
                        onChange={(e) => setPolicy({
                          ...policy,
                          vacationLeave: {
                            ...policy.vacationLeave,
                            canCarryOver: e.target.checked
                          }
                        })}
                      />
                    }
                    label="Can Carry Over"
                  />
                </Grid>
                {policy.vacationLeave?.canCarryOver && (
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Carry Over Limit (days)"
                      type="number"
                      value={policy.vacationLeave?.carryOverLimit || 5}
                      onChange={(e) => setPolicy({
                        ...policy,
                        vacationLeave: {
                          ...policy.vacationLeave,
                          carryOverLimit: parseInt(e.target.value) || 0
                        }
                      })}
                    />
                  </Grid>
                )}
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Minimum Notice Period (days)"
                    type="number"
                    value={policy.vacationLeave?.minNoticePeriod || 7}
                    onChange={(e) => setPolicy({
                      ...policy,
                      vacationLeave: {
                        ...policy.vacationLeave,
                        minNoticePeriod: parseInt(e.target.value) || 0
                      }
                    })}
                  />
                </Grid>
              </Grid>
            </Box>
          ) : (
            <CircularProgress />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowPolicyModal(false)}>Cancel</Button>
          <Button onClick={handleUpdatePolicy} variant="contained" color="primary">
            Save Policy
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminLeaveManagement;