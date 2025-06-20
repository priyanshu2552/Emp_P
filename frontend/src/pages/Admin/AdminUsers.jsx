import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  styled,
  TablePagination,
  Snackbar,
  Alert
} from '@mui/material';
import { Delete, Add } from '@mui/icons-material';
import axios from 'axios';

const ContentContainer = styled(Box)(({ theme }) => ({
  backgroundColor: 'white',
  borderRadius: '16px',
  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
  padding: theme.spacing(4),
  [theme.breakpoints.down('md')]: {
    marginTop: '-100px',
    position: 'relative',
    zIndex: 1
  }
}));

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [managers, setManagers] = useState([]);
  const [roleFilter, setRoleFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'employee',
    contact: '',
    address: '',
    manager: '',
    Department: '',
    EmployeeId: ''
  });
  const [errors, setErrors] = useState({});
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [totalUsers, setTotalUsers] = useState(0);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const validate = () => {
    const tempErrors = {};
    if (!newUser.name) tempErrors.name = 'Name is required';
    if (!newUser.email) tempErrors.email = 'Email is required';
    if (!newUser.password) tempErrors.password = 'Password is required';
    if (!newUser.Department) tempErrors.Department = 'Department is required';
    if (!newUser.EmployeeId) tempErrors.EmployeeId = 'Employee ID is required';
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      // Fetch all users (or filtered by role)
      const res = await axios.get(
        `http://localhost:5000/api/admin/users?page=${page + 1}&limit=${rowsPerPage}${roleFilter ? `&role=${roleFilter}` : ''}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Safely handle the response data
      const usersData = res.data?.users || res.data || [];
      const total = res.data?.total || usersData.length || 0;

      setUsers(Array.isArray(usersData) ? usersData : []);
      setTotalUsers(total);

      // Fetch just managers and admins for the dropdown
      const managersRes = await axios.get(
        'http://localhost:5000/api/admin/users?role=manager,admin',
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const managersData = managersRes.data?.users || managersRes.data || [];
      setManagers(Array.isArray(managersData) ? managersData : []);
    } catch (err) {
      console.error('Failed to fetch users', err);
      setSnackbar({
        open: true,
        message: 'Failed to fetch users',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async () => {
    if (!validate()) return;

    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/admin/users', newUser, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      setNewUser({
        name: '',
        email: '',
        password: '',
        role: 'employee',
        contact: '',
        address: '',
        manager: '',
        Department: '',
        EmployeeId: ''
      });
      setOpenModal(false);
      fetchUsers();
      setSnackbar({
        open: true,
        message: 'User added successfully',
        severity: 'success'
      });
    } catch (err) {
      console.error('Failed to add user', err);
      if (err.response?.data?.message) {
        if (err.response.data.message.includes('Employee ID')) {
          setErrors({ ...errors, EmployeeId: err.response.data.message });
        } else if (err.response.data.message.includes('email')) {
          setErrors({ ...errors, email: err.response.data.message });
        } else {
          setErrors({ ...errors, form: err.response.data.message });
        }
      }
    }
  };

  const handleDeleteUser = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/admin/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchUsers();
      setSnackbar({
        open: true,
        message: 'User deleted successfully',
        severity: 'success'
      });
    } catch (err) {
      console.error('Failed to delete user', err);
      setSnackbar({
        open: true,
        message: 'Failed to delete user',
        severity: 'error'
      });
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10)); // Fixed: use radix 10 and take the actual value
    setPage(0); // Reset to first page when rows per page changes
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter, page, rowsPerPage]);

  return (
    <Box sx={{ marginLeft: '3%' }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 4,
        }}
      >
        <Typography variant="h4" fontWeight={600}>
          Manage Users
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setOpenModal(true)}
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #5a6fd1 0%, #6a4299 100%)'
            }
          }}
        >
          Add User
        </Button>
      </Box>

      <Box mb={4}>
        <FormControl fullWidth size="small">
          <InputLabel>Filter by Role</InputLabel>
          <Select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setPage(0);
            }}
            label="Filter by Role"
          >
            <MenuItem value="">All Roles</MenuItem>
            <MenuItem value="employee">Employee</MenuItem>
            <MenuItem value="manager">Manager</MenuItem>
            <MenuItem value="admin">Admin</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <TableContainer component={Paper} elevation={3}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Role</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Department</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Employee ID</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Array.isArray(users) && users.map((user) => (
                  <TableRow key={user._id} hover>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Box
                        sx={{
                          display: 'inline-block',
                          px: 1.5,
                          py: 0.5,
                          borderRadius: 1,
                          backgroundColor:
                            user.role === 'admin'
                              ? '#e3f2fd'
                              : user.role === 'manager'
                                ? '#e8f5e9'
                                : '#fff8e1',
                          color:
                            user.role === 'admin'
                              ? '#1976d2'
                              : user.role === 'manager'
                                ? '#2e7d32'
                                : '#ff8f00',
                          fontWeight: 500
                        }}
                      >
                        {user.role?.charAt(0)?.toUpperCase() + user.role?.slice(1)}
                      </Box>
                    </TableCell>
                    <TableCell>{user.Department || '-'}</TableCell>
                    <TableCell>{user.EmployeeId || '-'}</TableCell>
                    <TableCell>
                      <IconButton
                        color="error"
                        size="small"
                        onClick={() => handleDeleteUser(user._id)}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 7, 9, 10]} // Added your requested options
            component="div"
            count={totalUsers}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </>
      )}

      {/* Add User Modal */}
      <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New User</DialogTitle>
        <DialogContent>
          {errors.form && (
            <Box color="error.main" mb={2}>
              {errors.form}
            </Box>
          )}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            <TextField
              label="Name *"
              fullWidth
              size="small"
              value={newUser.name}
              onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
              error={!!errors.name}
              helperText={errors.name}
            />
            <TextField
              label="Email *"
              fullWidth
              size="small"
              value={newUser.email}
              onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              error={!!errors.email}
              helperText={errors.email}
            />
            <TextField
              type="password"
              label="Password *"
              fullWidth
              size="small"
              value={newUser.password}
              onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
              error={!!errors.password}
              helperText={errors.password}
            />
            <TextField
              label="Department *"
              fullWidth
              size="small"
              value={newUser.Department}
              onChange={(e) => setNewUser({ ...newUser, Department: e.target.value })}
              error={!!errors.Department}
              helperText={errors.Department}
            />
            <TextField
              label="Employee ID *"
              fullWidth
              size="small"
              value={newUser.EmployeeId}
              onChange={(e) => setNewUser({ ...newUser, EmployeeId: e.target.value })}
              error={!!errors.EmployeeId}
              helperText={errors.EmployeeId}
            />
            <TextField
              label="Contact"
              fullWidth
              size="small"
              value={newUser.contact}
              onChange={(e) => setNewUser({ ...newUser, contact: e.target.value })}
            />
            <TextField
              label="Address"
              fullWidth
              size="small"
              value={newUser.address}
              onChange={(e) => setNewUser({ ...newUser, address: e.target.value })}
            />
            <FormControl fullWidth size="small">
              <InputLabel>Role *</InputLabel>
              <Select
                value={newUser.role}
                onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                label="Role"
              >
                <MenuItem value="employee">Employee</MenuItem>
                <MenuItem value="manager">Manager</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth size="small">
              <InputLabel>Manager</InputLabel>
              <Select
                value={newUser.manager || ''}
                onChange={(e) => setNewUser({
                  ...newUser,
                  manager: e.target.value === '' ? null : e.target.value
                })}
                displayEmpty
                label="Manager"
              >
                <MenuItem value="">No Manager</MenuItem>
                {Array.isArray(managers) && managers.map((manager) => (
                  <MenuItem key={manager._id} value={manager._id}>
                    {manager.name} ({manager.role})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenModal(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleAddUser}
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #5a6fd1 0%, #6a4299 100%)'
              }
            }}
          >
            Add User
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminUsers;