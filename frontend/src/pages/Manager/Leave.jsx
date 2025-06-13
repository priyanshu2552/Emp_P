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
  Tab
} from '@mui/material';
import {
  Add,
  Refresh,
  CheckCircle,
  Cancel,
  Pending,
  Event,
  DateRange
} from '@mui/icons-material';
import { format, parseISO, differenceInDays } from 'date-fns';
import axios from 'axios';
import { useSnackbar } from 'notistack';
import DashboardLayout from '../../components/Layout/EmployeeLayout';

const ManagerLeaveManagement = () => {
  const [myLeaves, setMyLeaves] = useState([]);
  const [teamLeaves, setTeamLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [openActionDialog, setOpenActionDialog] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [actionType, setActionType] = useState('');
  const [comment, setComment] = useState('');
  const [leaveAllocation, setLeaveAllocation] = useState({
    casual: { total: 12, taken: 0, remaining: 12 },
    sick: { total: 6, taken: 0, remaining: 6 },
    vacation: { total: 15, taken: 0, remaining: 15 }
  });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [teamPage, setTeamPage] = useState(0);
  const [teamRowsPerPage, setTeamRowsPerPage] = useState(5);
  const [activeTab, setActiveTab] = useState(0);
  const { enqueueSnackbar } = useSnackbar();

  const [form, setForm] = useState({
    startDate: '',
    endDate: '',
    leaveType: 'casual',
    reason: ''
  });

  const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return {
      headers: {
        Authorization: `Bearer ${token}`
      }
    };
  };

  const checkAuth = () => {
    if (!localStorage.getItem('token')) {
      window.location.href = '/login';
      return false;
    }
    return true;
  };

  const duration = form.startDate && form.endDate 
    ? differenceInDays(parseISO(form.endDate), parseISO(form.startDate)) + 1
    : 0;

  const fetchData = async () => {
    if (!checkAuth()) return;
    
    try {
      setLoading(true);
      const [myLeavesRes, teamLeavesRes, allocationRes] = await Promise.all([
        axios.get('http://localhost:5000/api/manager/leaves', getAuthHeader()),
        axios.get('http://localhost:5000/api/manager/leaves/team', getAuthHeader()),
        axios.get('http://localhost:5000/api/manager/leaves/allocation', getAuthHeader())
      ]);

      setMyLeaves(myLeavesRes.data.leaves || []);
      setTeamLeaves(teamLeavesRes.data.leaves || []);
      
      if (allocationRes.data.allocation) {
        setLeaveAllocation({
          casual: allocationRes.data.allocation.casual || { total: 12, taken: 0, remaining: 12 },
          sick: allocationRes.data.allocation.sick || { total: 6, taken: 0, remaining: 6 },
          vacation: allocationRes.data.allocation.vacation || { total: 15, taken: 0, remaining: 15 }
        });
      }
    } catch (error) {
      if (error.response?.status === 401) {
        enqueueSnackbar('Session expired. Please login again.', { variant: 'error' });
        localStorage.removeItem('token');
        window.location.href = '/login';
      } else {
        enqueueSnackbar('Failed to fetch leave data', { variant: 'error' });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!checkAuth()) return;

    try {
      await axios.post(
        'http://localhost:5000/api/manager/leaves', 
        form, 
        getAuthHeader()
      );
      enqueueSnackbar('Leave request submitted successfully', { variant: 'success' });
      setOpenModal(false);
      setForm({
        startDate: '',
        endDate: '',
        leaveType: 'casual',
        reason: ''
      });
      fetchData();
    } catch (error) {
      if (error.response?.status === 401) {
        enqueueSnackbar('Session expired. Please login again.', { variant: 'error' });
        localStorage.removeItem('token');
        window.location.href = '/login';
      } else {
        enqueueSnackbar(error.response?.data?.message || 'Failed to submit leave', { variant: 'error' });
      }
    }
  };

  const handleAction = async () => {
    if (!checkAuth()) return;

    try {
      await axios.post(
        `http://localhost:5000/api/manager/leaves/${selectedLeave._id}/review`,
        { action: actionType, comment },
        getAuthHeader()
      );
      enqueueSnackbar(`Leave ${actionType === 'approve' ? 'approved' : 'rejected'} successfully`, { 
        variant: 'success' 
      });
      setOpenActionDialog(false);
      setComment('');
      fetchData();
    } catch (error) {
      if (error.response?.status === 401) {
        enqueueSnackbar('Session expired. Please login again.', { variant: 'error' });
        localStorage.removeItem('token');
        window.location.href = '/login';
      } else {
        enqueueSnackbar(error.response?.data?.message || 'Failed to process action', { variant: 'error' });
      }
    }
  };

  const getStatusChip = (status) => {
    switch (status) {
      case 'approved': return <Chip icon={<CheckCircle />} label="Approved" color="success" size="small" />;
      case 'rejected': return <Chip icon={<Cancel />} label="Rejected" color="error" size="small" />;
      default: return <Chip icon={<Pending />} label="Pending" color="warning" size="small" />;
    }
  };

  const getLeaveTypeChip = (type) => {
    const colors = { casual: 'primary', sick: 'secondary', vacation: 'info' };
    return <Chip label={type.charAt(0).toUpperCase() + type.slice(1)} color={colors[type]} size="small" />;
  };

  const canTakeLeave = (type, days) => {
    if (!leaveAllocation || !leaveAllocation[type]) return false;
    return leaveAllocation[type].remaining >= days;
  };

  return (
    <DashboardLayout>
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4">Leave Management</Typography>
          <Button variant="contained" startIcon={<Add />} onClick={() => setOpenModal(true)}>
            New Request
          </Button>
        </Box>

        <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)} sx={{ mb: 3 }}>
          <Tab label="My Leaves" />
          <Tab label="Team Leaves" />
        </Tabs>

        {activeTab === 0 && (
          <>
            <Grid container spacing={3} sx={{ mb: 4 }}>
              {['casual', 'sick', 'vacation'].map((type) => (
                <Grid item xs={12} md={4} key={type}>
                  <Card>
                    <CardContent>
                      <Typography color="text.secondary" gutterBottom>
                        {type.charAt(0).toUpperCase() + type.slice(1)} Leaves
                      </Typography>
                      <Typography variant="h4">
                        {leaveAllocation[type].remaining} / {leaveAllocation[type].total}
                      </Typography>
                      <Typography variant="body2">
                        {leaveAllocation[type].taken} days taken
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>

            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">My Leave Requests</Typography>
                  <Button startIcon={<Refresh />} onClick={fetchData} size="small">Refresh</Button>
                </Box>

                {loading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                    <CircularProgress />
                  </Box>
                ) : (
                  <>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Dates</TableCell>
                          <TableCell>Type</TableCell>
                          <TableCell>Duration</TableCell>
                          <TableCell>Reason</TableCell>
                          <TableCell>Status</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {myLeaves.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((leave) => (
                          <TableRow key={leave._id}>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Event sx={{ mr: 1, color: 'text.secondary' }} />
                                {format(parseISO(leave.startDate), 'MMM dd, yyyy')}
                                <DateRange sx={{ mx: 1, color: 'text.secondary' }} />
                                {format(parseISO(leave.endDate), 'MMM dd, yyyy')}
                              </Box>
                            </TableCell>
                            <TableCell>{getLeaveTypeChip(leave.leaveType)}</TableCell>
                            <TableCell>
                              {differenceInDays(parseISO(leave.endDate), parseISO(leave.startDate)) + 1} days
                            </TableCell>
                            <TableCell sx={{ maxWidth: 200 }}>
                              <Typography noWrap>{leave.reason}</Typography>
                            </TableCell>
                            <TableCell>{getStatusChip(leave.status)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    <TablePagination
                      rowsPerPageOptions={[5, 10, 25]}
                      component="div"
                      count={myLeaves.length}
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
          </>
        )}

        {activeTab === 1 && (
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Team Leave Requests</Typography>
                <Button startIcon={<Refresh />} onClick={fetchData} size="small">Refresh</Button>
              </Box>

              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                  <CircularProgress />
                </Box>
              ) : (
                <>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Employee</TableCell>
                        <TableCell>Dates</TableCell>
                        <TableCell>Type</TableCell>
                        <TableCell>Duration</TableCell>
                        <TableCell>Reason</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {teamLeaves.slice(teamPage * teamRowsPerPage, teamPage * teamRowsPerPage + teamRowsPerPage).map((leave) => (
                        <TableRow key={leave._id}>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Avatar src={leave.userId?.image || '/default-avatar.png'} sx={{ width: 32, height: 32, mr: 1 }} />
                              {leave.userId?.name || 'Unknown'}
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Event sx={{ mr: 1, color: 'text.secondary' }} />
                              {format(parseISO(leave.startDate), 'MMM dd, yyyy')}
                              <DateRange sx={{ mx: 1, color: 'text.secondary' }} />
                              {format(parseISO(leave.endDate), 'MMM dd, yyyy')}
                            </Box>
                          </TableCell>
                          <TableCell>{getLeaveTypeChip(leave.leaveType)}</TableCell>
                          <TableCell>
                            {differenceInDays(parseISO(leave.endDate), parseISO(leave.startDate)) + 1} days
                          </TableCell>
                          <TableCell sx={{ maxWidth: 200 }}>
                            <Typography noWrap>{leave.reason}</Typography>
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              <Button
                                variant="contained"
                                color="success"
                                size="small"
                                onClick={() => {
                                  setSelectedLeave(leave);
                                  setActionType('approve');
                                  setOpenActionDialog(true);
                                }}
                              >
                                Approve
                              </Button>
                              <Button
                                variant="contained"
                                color="error"
                                size="small"
                                onClick={() => {
                                  setSelectedLeave(leave);
                                  setActionType('reject');
                                  setOpenActionDialog(true);
                                }}
                              >
                                Reject
                              </Button>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={teamLeaves.length}
                    rowsPerPage={teamRowsPerPage}
                    page={teamPage}
                    onPageChange={(e, newPage) => setTeamPage(newPage)}
                    onRowsPerPageChange={(e) => {
                      setTeamRowsPerPage(parseInt(e.target.value, 10));
                      setTeamPage(0);
                    }}
                  />
                </>
              )}
            </CardContent>
          </Card>
        )}

        <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="sm" fullWidth>
          <DialogTitle>New Leave Request</DialogTitle>
          <DialogContent>
            <form onSubmit={handleSubmit}>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12} md={6}>
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
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    Duration: {duration} day{duration !== 1 ? 's' : ''}
                  </Typography>
                </Grid>
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
                    {leaveAllocation ? 
                      `${leaveAllocation[form.leaveType].remaining} ${form.leaveType} leaves remaining` : 
                      'Loading leave balance...'}
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
                  />
                </Grid>
              </Grid>
            </form>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenModal(false)}>Cancel</Button>
            <Button
              onClick={handleSubmit}
              variant="contained"
              disabled={!canTakeLeave(form.leaveType, duration)}
            >
              Submit Request
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog open={openActionDialog} onClose={() => setOpenActionDialog(false)}>
          <DialogTitle>
            {actionType === 'approve' ? 'Approve Leave' : 'Reject Leave'}
          </DialogTitle>
          <DialogContent>
            <DialogContentText sx={{ mb: 2 }}>
              {actionType === 'approve' 
                ? 'Are you sure you want to approve this leave request?' 
                : 'Are you sure you want to reject this leave request?'}
            </DialogContentText>
            <TextField
              fullWidth
              label="Comment (Optional)"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              multiline
              rows={3}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenActionDialog(false)}>Cancel</Button>
            <Button
              onClick={handleAction}
              variant="contained"
              color={actionType === 'approve' ? 'success' : 'error'}
            >
              {actionType === 'approve' ? 'Approve' : 'Reject'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </DashboardLayout>
  );
};

export default ManagerLeaveManagement;