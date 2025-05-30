import React, { useEffect, useState } from 'react';
import {
    Box, Typography, Button, Select, MenuItem, TextField, Grid, Paper, CircularProgress, IconButton
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [roleFilter, setRoleFilter] = useState('');
    const [newUser, setNewUser] = useState({
        name: '', email: '', password: '', role: 'employee'
    });
    const [loading, setLoading] = useState(false);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const res = await axios.get(`http://localhost:5000/api/admin/users${roleFilter ? `?role=${roleFilter}` : ''}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
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
            setNewUser({ name: '', email: '', password: '', role: 'employee' });
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
        <Box p={3}>
            <Typography variant="h4" gutterBottom>Manage Users</Typography>

            <Box mb={3}>
                <Select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
                    <MenuItem value="">All</MenuItem>
                    <MenuItem value="admin">Admin</MenuItem>
                    <MenuItem value="manager">Manager</MenuItem>
                    <MenuItem value="employee">Employee</MenuItem>
                </Select>
            </Box>

            {loading ? (
                <CircularProgress />
            ) : (
                <Grid container spacing={2}>
                    {users.map((user) => (
                        <Grid item xs={12} md={6} lg={4} key={user._id}>
                            <Paper elevation={3} sx={{ p: 2 }}>
                                <Typography><strong>{user.name}</strong> ({user.role})</Typography>
                                <Typography>Email: {user.email}</Typography>
                                <IconButton color="error" onClick={() => handleDeleteUser(user._id)}>
                                    <DeleteIcon />
                                </IconButton>
                            </Paper>
                        </Grid>
                    ))}
                </Grid>
            )}

            <Box mt={5}>
                <Typography variant="h6">Add New User</Typography>
                <Grid container spacing={2}>
                    <Grid item xs={12} md={3}>
                        <TextField
                            fullWidth label="Name" value={newUser.name}
                            onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                        />
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <TextField
                            fullWidth label="Email" value={newUser.email}
                            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                        />
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <TextField
                            fullWidth type="password" label="Password" value={newUser.password}
                            onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                        />
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <TextField
                            fullWidth label="Contact" value={newUser.contact}
                            onChange={(e) => setNewUser({ ...newUser, contact: e.target.value })}
                        />
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <TextField
                            fullWidth label="Address" value={newUser.address}
                            onChange={(e) => setNewUser({ ...newUser, address: e.target.value })}
                        />
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <Select
                            fullWidth value={newUser.role}
                            onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                        >
                            <MenuItem value="employee">Employee</MenuItem>
                            <MenuItem value="manager">Manager</MenuItem>
                            <MenuItem value="admin">Admin</MenuItem>
                        </Select>
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <Select
                            fullWidth
                            value={newUser.manager || ''}
                            onChange={(e) => setNewUser({ ...newUser, manager: e.target.value })}
                            displayEmpty
                        >
                            <MenuItem value="">No Manager</MenuItem>
                            {users
                                .filter(u => u.role === 'admin' || u.role === 'manager')
                                .map(manager => (
                                    <MenuItem key={manager._id} value={manager._id}>
                                        {manager.name} ({manager.role})
                                    </MenuItem>
                                ))}
                        </Select>
                    </Grid>
                    <Grid item xs={12} md={2}>
                        <Button variant="contained" onClick={handleAddUser}>Add</Button>
                    </Grid>
                </Grid>
            </Box>
        </Box>
    );
};

export default AdminUsers;
