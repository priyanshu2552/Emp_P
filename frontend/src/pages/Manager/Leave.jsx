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
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextareaAutosize
} from '@mui/material';
import { Add, Close, Refresh, CheckCircle, Cancel, Pending } from '@mui/icons-material';
import ManagerLayout from '../../components/Layout/ManagerLayout';

const API_BASE = 'http://localhost:5000/api/manager';

const ManagerLeave = () => {
  const [leaves, setLeaves] = useState([]);
  const [teamLeaves, setTeamLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [openActionDialog, setOpenActionDialog] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [comment, setComment] = useState('');
  const [actionType, setActionType] = useState('');
  const [form, setForm] = useState({
    startDate: '',
    endDate: '',
    leaveType: 'casual',
    reason: ''
  });

  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [teamPage, setTeamPage] = useState(0);
  const [teamRowsPerPage, setTeamRowsPerPage] = useState(5);
  const [activeTab, setActiveTab] = useState('myLeaves');

  const token = localStorage.getItem('token');

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const [myLeavesRes, teamLeavesRes] = await Promise.all([
        fetch(`${API_BASE}/leaves`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }),
        fetch(`${API_BASE}/team-leaves`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
      ]);

      const myLeavesData = await myLeavesRes.json();
      const teamLeavesData = await teamLeavesRes.json();

      if (myLeavesData.success) {
        setLeaves(myLeavesData.leaves);
      }
      if (teamLeavesData.success) {
        setTeamLeaves(teamLeavesData.leaves);
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

  const handleApproveReject = (leave, type) => {
    setSelectedLeave(leave);
    setActionType(type);
    setOpenActionDialog(true);
  };

  const submitAction = async () => {
    try {
      const res = await fetch(`${API_BASE}/leaves/${selectedLeave._id}/action`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          action: actionType,
          comment: comment
        })
      });

      const data = await res.json();
      if (data.success) {
        setOpenActionDialog(false);
        setComment('');
        fetchLeaves();
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error('Failed to process leave action:', error);
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

  const handleTeamChangePage = (event, newPage) => {
    setTeamPage(newPage);
  };

  const handleTeamChangeRowsPerPage = (event) => {
    setTeamRowsPerPage(parseInt(event.target.value, 10));
    setTeamPage(0);
  };

  // Calculate paginated leaves
  const paginatedLeaves = leaves.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const paginatedTeamLeaves = teamLeaves.slice(
    teamPage * teamRowsPerPage,
    teamPage * teamRowsPerPage + teamRowsPerPage
  );

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved': return <CheckCircle color="success" sx={{ fontSize: '1rem', mr: 0.5 }} />;
      case 'rejected': return <Cancel color="error" sx={{ fontSize: '1rem', mr: 0.5 }} />;
      default: return <Pending color="warning" sx={{ fontSize: '1rem', mr: 0.5 }} />;
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  // Styles
  const styles = {
    container: {
      display: 'flex',
      flexDirection: 'column',
      p: 3,
      width: '100%',
      maxWidth: '1200px',
      mx: 'auto',
      boxSizing: 'border-box'
    },
    card: {
      borderRadius: '8px',
      boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
      mb: 3,
      overflow: 'hidden'
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      mb: 3,
      flexWrap: 'wrap',
      gap: 2
    },
    summaryCard: {
      p: 2,
      flex: 1,
      minWidth: '200px',
      borderRadius: '8px',
      boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.05)',
      transition: 'all 0.3s ease',
      '&:hover': {
        boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
      }
    },
    tabButton: {
      mr: 2,
      fontWeight: 600,
      color: 'text.secondary',
      borderBottom: '2px solid transparent',
      '&.active': {
        color: 'primary.main',
        borderColor: 'primary.main'
      }
    }
  };

  return (
    <ManagerLayout>
      <Box sx={styles.container}>
        {/* Header Section */}
        <Box sx={styles.header}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Leave Management
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={fetchLeaves}
              sx={{ textTransform: 'none' }}
            >
              Refresh
            </Button>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setOpenModal(true)}
              sx={{ textTransform: 'none' }}
            >
              New Request
            </Button>
          </Box>
        </Box>

        {/* Summary Cards */}
        <Box sx={{ display: 'flex', gap: 3, mb: 4, flexWrap: 'wrap' }}>
          <Paper sx={styles.summaryCard}>
            <Typography variant="subtitle2" color="text.secondary">Total Requests</Typography>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>{leaves.length}</Typography>
          </Paper>
          <Paper sx={styles.summaryCard}>
            <Typography variant="subtitle2" color="text.secondary">Pending</Typography>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              {leaves.filter(l => l.status === 'pending').length}
            </Typography>
          </Paper>
          <Paper sx={styles.summaryCard}>
            <Typography variant="subtitle2" color="text.secondary">Team Pending</Typography>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              {teamLeaves.filter(l => l.status === 'pending').length}
            </Typography>
          </Paper>
        </Box>

        {/* Tab Navigation */}
        <Box sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}>
          <Button
            variant="text"
            onClick={() => setActiveTab('myLeaves')}
            sx={{
              ...styles.tabButton,
              ...(activeTab === 'myLeaves' && { color: 'primary.main', borderColor: 'primary.main' })
            }}
          >
            My Leaves
          </Button>
          <Button
            variant="text"
            onClick={() => setActiveTab('teamLeaves')}
            sx={{
              ...styles.tabButton,
              ...(activeTab === 'teamLeaves' && { color: 'primary.main', borderColor: 'primary.main' })
            }}
          >
            Team Leaves
          </Button>
        </Box>

        {/* My Leaves Table */}
        {activeTab === 'myLeaves' && (
          <Card sx={styles.card}>
            <Box sx={{ p: 2, borderBottom: '1px solid #f0f0f0' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                My Leave Requests
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
                          <TableRow key={leave._id} hover>
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
                                  color: '#1976d2'
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
                    />
                  )}
                </>
              )}
            </CardContent>
          </Card>
        )}

        {/* Team Leaves Table */}
        {activeTab === 'teamLeaves' && (
          <Card sx={styles.card}>
            <Box sx={{ p: 2, borderBottom: '1px solid #f0f0f0' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                Team Leave Requests
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Showing {paginatedTeamLeaves.length} of {teamLeaves.length} entries
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
                        <TableCell sx={{ fontWeight: 600 }}>Employee</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Start Date</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>End Date</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Reason</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {paginatedTeamLeaves.length > 0 ? (
                        paginatedTeamLeaves.map((leave) => (
                          <TableRow key={leave._id} hover>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Avatar
                                  src={leave.employee?.image || '/default-avatar.png'}
                                  sx={{ width: 32, height: 32 }}
                                />
                                <Typography>{leave.employee?.name || 'Unknown'}</Typography>
                              </Box>
                            </TableCell>
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
                                  color: '#1976d2'
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
                              {leave.status === 'pending' && (
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                  <Button
                                    variant="contained"
                                    size="small"
                                    color="success"
                                    onClick={() => handleApproveReject(leave, 'approve')}
                                    sx={{ textTransform: 'none' }}
                                  >
                                    Approve
                                  </Button>
                                  <Button
                                    variant="contained"
                                    size="small"
                                    color="error"
                                    onClick={() => handleApproveReject(leave, 'reject')}
                                    sx={{ textTransform: 'none' }}
                                  >
                                    Reject
                                  </Button>
                                </Box>
                              )}
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={7} sx={{ textAlign: 'center', py: 4 }}>
                            <Typography variant="body2" color="text.secondary">
                              No team leave requests found
                            </Typography>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                  {teamLeaves.length > 5 && (
                    <TablePagination
                      rowsPerPageOptions={[5, 10, 25]}
                      component="div"
                      count={teamLeaves.length}
                      rowsPerPage={teamRowsPerPage}
                      page={teamPage}
                      onPageChange={handleTeamChangePage}
                      onRowsPerPageChange={handleTeamChangeRowsPerPage}
                    />
                  )}
                </>
              )}
            </CardContent>
          </Card>
        )}

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
            outline: 'none'
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
              <IconButton onClick={() => setOpenModal(false)}>
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
                >
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  type="submit"
                >
                  Submit Request
                </Button>
              </Box>
            </form>
          </Box>
        </Modal>

        {/* Approve/Reject Dialog */}
        <Dialog open={openActionDialog} onClose={() => setOpenActionDialog(false)}>
          <DialogTitle>
            {actionType === 'approve' ? 'Approve Leave' : 'Reject Leave'}
          </DialogTitle>
          <DialogContent>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {actionType === 'approve'
                ? 'Are you sure you want to approve this leave request?'
                : 'Are you sure you want to reject this leave request?'}
            </Typography>
            <TextField
              fullWidth
              label="Comment (Optional)"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              multiline
              rows={3}
              variant="outlined"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenActionDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={submitAction}
              color={actionType === 'approve' ? 'success' : 'error'}
              variant="contained"
            >
              {actionType === 'approve' ? 'Approve' : 'Reject'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </ManagerLayout>
  );
};

export default ManagerLeave;