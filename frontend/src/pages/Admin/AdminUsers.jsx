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
  Modal,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  styled
} from '@mui/material';
import { Delete, Edit, Add } from '@mui/icons-material';
import axios from 'axios';

const ContentContainer = styled(Box)(({ theme }) => ({
  backgroundColor: 'white',
  borderRadius: '16px',
  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
  padding: theme.spacing(4),
  [theme.breakpoints.down('md')]: {
    marginTop: '-100px', // This will pull the content up into the purple area
    position: 'relative',
    zIndex: 1
  }
}));

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
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
    manager: ''
  });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await axios.get(
        `http://localhost:5000/api/admin/users${roleFilter ? `?role=${roleFilter}` : ''}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUsers(res.data);
    } catch (err) {
      console.error('Failed to fetch users', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/admin/users', newUser, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNewUser({
        name: '',
        email: '',
        password: '',
        role: 'employee',
        contact: '',
        address: '',
        manager: ''
      });
      setOpenModal(false);
      fetchUsers();
    } catch (err) {
      console.error('Failed to add user', err);
    }
  };

  const handleDeleteUser = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/admin/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchUsers();
    } catch (err) {
      console.error('Failed to delete user', err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  return (
    
    <Box>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 4
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
        <FormControl fullWidth variant="outlined" size="small" sx={{ maxWidth: 300 }}>
          <InputLabel>Filter by Role</InputLabel>
          <Select
            label="Filter by Role"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <MenuItem value="">All Users</MenuItem>
            <MenuItem value="admin">Admin</MenuItem>
            <MenuItem value="manager">Manager</MenuItem>
            <MenuItem value="employee">Employee</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper} elevation={3}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Role</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Contact</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
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
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </Box>
                  </TableCell>
                  <TableCell>{user.contact || '-'}</TableCell>
                  <TableCell>
                    <IconButton color="primary" size="small">
                      <Edit fontSize="small" />
                    </IconButton>
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
      )}

      {/* Add User Modal */}
      <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New User</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            <TextField
              label="Name"
              fullWidth
              size="small"
              value={newUser.name}
              onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
            />
            <TextField
              label="Email"
              fullWidth
              size="small"
              value={newUser.email}
              onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
            />
            <TextField
              type="password"
              label="Password"
              fullWidth
              size="small"
              value={newUser.password}
              onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
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
              <InputLabel>Role</InputLabel>
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
                onChange={(e) => setNewUser({ ...newUser, manager: e.target.value })}
                displayEmpty
                label="Manager"
              >
                <MenuItem value="">No Manager</MenuItem>
                {users
                  .filter((u) => u.role === 'admin' || u.role === 'manager')
                  .map((manager) => (
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
    </Box>
  );
};

export default AdminUsers;